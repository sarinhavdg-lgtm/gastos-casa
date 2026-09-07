import { FinanceData, Expense, CreditCard } from "../types";

const LOCAL_STORAGE_KEY = "gastos_casa_data_v1";
const LEGACY_STORAGE_KEY = "gestao_financeira_residencial_v1";

// Merge data intelligently so that no card or expense is ever overwritten by an empty state
function mergeFinanceData(local: FinanceData, remote: FinanceData): FinanceData {
  const cardMap = new Map<string, CreditCard>();
  (remote.cards || []).forEach((c) => cardMap.set(c.id, c));
  (local.cards || []).forEach((c) => cardMap.set(c.id, c));

  const expenseMap = new Map<string, Expense>();
  (remote.expenses || []).forEach((e) => expenseMap.set(e.id, e));
  (local.expenses || []).forEach((e) => expenseMap.set(e.id, e));

  return {
    monthlyIncome: local.monthlyIncome > 0 ? local.monthlyIncome : (remote.monthlyIncome || 0),
    cards: Array.from(cardMap.values()),
    expenses: Array.from(expenseMap.values()),
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchFinanceData(): Promise<FinanceData> {
  // Check local cache first
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
    const res = await fetch("/api/finances");
    if (res.ok) {
      const serverData: FinanceData = await res.json();
      
      // If we have cached client data, merge them safely so nothing is ever lost
      let finalData = serverData;
      if (cachedData) {
        finalData = mergeFinanceData(cachedData, serverData);
      }

      // If the merged result has data that server didn't have, immediately sync back to server
      const serverCount = (serverData.cards?.length || 0) + (serverData.expenses?.length || 0);
      const finalCount = (finalData.cards?.length || 0) + (finalData.expenses?.length || 0);
      if (finalCount > serverCount) {
        console.info("Re-synchronizing client data to server:", finalCount, "items");
        saveFinanceData(finalData).catch(() => {});
      }

      // Save to local storage & auto backup
      const serialized = JSON.stringify(finalData);
      localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
      if (finalCount > 0) {
        localStorage.setItem("gastos_casa_backup_auto", serialized);
      }
      return finalData;
    }
  } catch (err) {
    console.warn("Could not fetch from server API, using local backup:", err);
  }

  // Fallback to cached data if network failed
  if (cachedData) {
    return cachedData;
  }

  // If nothing exists, default clean initial structure starting from zero
  return {
    monthlyIncome: 0,
    cards: [],
    expenses: [],
  };
}

export async function saveFinanceData(data: FinanceData): Promise<boolean> {
  // Always update local storage and backup immediately
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    if ((data.cards && data.cards.length > 0) || (data.expenses && data.expenses.length > 0)) {
      localStorage.setItem("gastos_casa_backup_auto", serialized);
    }
  } catch (e) {
    console.warn("Failed to write to localStorage:", e);
  }

  // Send to server API
  try {
    const res = await fetch("/api/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to sync to server:", err);
    return false;
  }
}

export async function resetFinanceData(): Promise<FinanceData> {
  try {
    const res = await fetch("/api/finances/reset", { method: "POST" });
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
