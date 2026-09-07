import { FinanceData, Expense, CreditCard } from "../types";

const LOCAL_STORAGE_KEY = "gastos_casa_data_v1";
const LEGACY_STORAGE_KEY = "gestao_financeira_residencial_v1";

export async function fetchFinanceData(): Promise<FinanceData> {
  // Purge legacy mock data cache if present
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
      const data = await res.json();
      // Also cache in localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn("Could not fetch from server API, checking localStorage backup:", err);
  }

  // Fallback to localStorage
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  // If nothing exists, default clean initial structure starting from zero
  return {
    monthlyIncome: 0,
    cards: [],
    expenses: [],
  };
}

export async function saveFinanceData(data: FinanceData): Promise<boolean> {
  // Update local storage first for snappy feel
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
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
