import { FinanceData, Expense, CreditCard } from "../types";

const LOCAL_STORAGE_KEY = "gastos_casa_data_v1";
const LEGACY_STORAGE_KEY = "gestao_financeira_residencial_v1";

// Smart recovery merge: ONLY used if the server restarted completely empty (0 items)
// and the local phone still has data to re-hydrate the server without losing anything.
function rehydrateEmptyServer(local: FinanceData, server: FinanceData): FinanceData {
  return {
    monthlyIncome: local.monthlyIncome > 0 ? local.monthlyIncome : (server.monthlyIncome || 0),
    cards: local.cards && local.cards.length > 0 ? local.cards : (server.cards || []),
    expenses: local.expenses && local.expenses.length > 0 ? local.expenses : (server.expenses || []),
    categories: local.categories && local.categories.length > 0 ? local.categories : server.categories,
    customLogo: local.customLogo || server.customLogo,
    version: (server.version || 1) + 1,
    lastUpdated: new Date().toISOString(),
  };
}

// Lightweight status check for real-time polling across devices
export async function checkServerStatus(): Promise<{
  version: number;
  lastUpdated: string;
  cardCount: number;
  expenseCount: number;
} | null> {
  try {
    const res = await fetch(`/api/finances/status?_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline or network error
  }
  return null;
}

export async function fetchFinanceData(): Promise<FinanceData> {
  // Check local cache for offline fallback
  let cachedData: FinanceData | null = null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem("gastos_casa_backup_auto");
    if (raw) {
      cachedData = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read local cache:", e);
  }

  // Also purge legacy mock key if present
  try {
    if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    // ignore
  }

  try {
    const res = await fetch(`/api/finances?_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store" },
    });

    if (res.ok) {
      const serverData: FinanceData = await res.json();
      
      const serverTotalItems = (serverData.cards?.length || 0) + (serverData.expenses?.length || 0);
      const cachedTotalItems = (cachedData?.cards?.length || 0) + (cachedData?.expenses?.length || 0);

      let finalData = serverData;

      // Special case: If server is totally empty (e.g. server freshly restarted from scratch)
      // but the phone already had cards/expenses, re-populate the server from the phone's backup!
      if (serverTotalItems === 0 && cachedTotalItems > 0 && cachedData) {
        console.info("Server is empty; restoring from phone storage to cloud:", cachedTotalItems, "items");
        finalData = rehydrateEmptyServer(cachedData, serverData);
        saveFinanceData(finalData).catch(() => {});
      }

      // Save to local storage & auto backup
      const serialized = JSON.stringify(finalData);
      localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
      if ((finalData.cards && finalData.cards.length > 0) || (finalData.expenses && finalData.expenses.length > 0)) {
        localStorage.setItem("gastos_casa_backup_auto", serialized);
      }
      return finalData;
    }
  } catch (err) {
    console.warn("Could not fetch from server API, using local backup:", err);
  }

  // Fallback to cached data if device is currently offline
  if (cachedData) {
    return cachedData;
  }

  // If nothing exists, default clean initial structure
  return {
    monthlyIncome: 0,
    cards: [],
    expenses: [],
    version: 1,
    lastUpdated: new Date().toISOString(),
  };
}

export async function saveFinanceData(data: FinanceData): Promise<boolean> {
  // Always update local storage immediately
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    if ((data.cards && data.cards.length > 0) || (data.expenses && data.expenses.length > 0)) {
      localStorage.setItem("gastos_casa_backup_auto", serialized);
    }
  } catch (e) {
    console.warn("Failed to write to localStorage:", e);
  }

  // Send to server API with anti-cache query
  try {
    const res = await fetch(`/api/finances?_t=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const respJson = await res.json();
      if (respJson.version) {
        data.version = respJson.version;
        data.lastUpdated = respJson.lastUpdated;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to sync to server:", err);
    return false;
  }
}

export async function resetFinanceData(): Promise<FinanceData> {
  try {
    const res = await fetch(`/api/finances/reset?_t=${Date.now()}`, { method: "POST" });
    if (res.ok) {
      const json = await res.json();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
      return json.data;
    }
  } catch (err) {
    console.error("Failed to reset on server:", err);
  }
  const fallback = await fetchFinanceData();
  return fallback;
}
