import { FinanceData, Expense, CreditCard } from "../types";

const LOCAL_STORAGE_KEY = "gastos_casa_data_v1";
const LEGACY_STORAGE_KEY = "gestao_financeira_residencial_v1";

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
      
      const serverHasData = (serverData.cards && serverData.cards.length > 0) || (serverData.expenses && serverData.expenses.length > 0);
      const clientHasData = cachedData && ((cachedData.cards && cachedData.cards.length > 0) || (cachedData.expenses && cachedData.expenses.length > 0));

      // If server is empty (e.g., after a new deploy or container restart on Render)
      // but client has saved cards or expenses, KEEP the client data and re-sync to server!
      if (!serverHasData && clientHasData && cachedData) {
        console.info("Server data was empty, restoring from client persistent storage.");
        saveFinanceData(cachedData).catch(() => {});
        return cachedData;
      }

      // If server has data, update local storage and auto-backup
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData));
      if (serverHasData) {
        localStorage.setItem("gastos_casa_backup_auto", JSON.stringify(serverData));
      }
      return serverData;
    }
  } catch (err) {
    console.warn("Could not fetch from server API, checking localStorage backup:", err);
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
