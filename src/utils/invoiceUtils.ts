import { CreditCard, Expense, ReportGroupingMode } from "../types";
import { formatDateBR, MONTH_NAMES_PT } from "./formatters";

export interface InvoicePeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  closingDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  formattedRange: string; // "17/09/2026 a 16/10/2026"
  shortRange: string; // "17/09 a 16/10"
  closingDay: number;
  dueDay: number;
}

/**
 * Returns safe YYYY-MM-DD string taking into account month boundary limits
 */
export function getSafeDateStr(year: number, monthZeroIndexed: number, day: number): string {
  // Normalize month overflow/underflow
  const d = new Date(year, monthZeroIndexed + 1, 0); // last day of month
  const actualYear = d.getFullYear();
  const actualMonth = d.getMonth() + 1;
  const actualDay = Math.min(Math.max(1, day), d.getDate());
  return `${actualYear}-${String(actualMonth).padStart(2, "0")}-${String(actualDay).padStart(2, "0")}`;
}

/**
 * Calculates the exact invoice period (abertura e fechamento) for a credit card in a given invoice month (YYYY-MM).
 * Example:
 * Card closing on day 16, due on day 25.
 * Month: "2026-10"
 * Abertura: 17/09/2026 (dia após o fechamento anterior)
 * Fechamento: 16/10/2026
 * Vencimento: 25/10/2026
 */
export function getCardInvoicePeriod(card: CreditCard, monthStr: string): InvoicePeriod {
  const [yearStr, monthNumStr] = monthStr.split("-");
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = (parseInt(monthNumStr, 10) || (new Date().getMonth() + 1)) - 1; // 0-indexed

  const closingDay = card.closingDay || 15;
  const dueDay = card.dueDay || 22;
  const cutoff = card.closingCutoff || "after_closing_day";

  let closingDateStr: string;
  let openingDateStr: string;

  if (cutoff === "on_closing_day") {
    // Modo "Melhor dia de compra": compras no dia 16 já vão para a próxima fatura.
    // Ciclo: dia 16 do mês anterior até dia 15 deste mês.
    openingDateStr = getSafeDateStr(year, month - 1, closingDay);
    closingDateStr = getSafeDateStr(year, month, Math.max(1, closingDay - 1));
  } else {
    // Padrão bancário brasileiro: A fatura fecha no dia 16.
    // Compras até o dia 16 entram nesta fatura.
    // Abertura: dia 17 do mês anterior (closingDay + 1).
    openingDateStr = getSafeDateStr(year, month - 1, closingDay + 1);
    closingDateStr = getSafeDateStr(year, month, closingDay);
  }

  // Due date
  let dueDateStr: string;
  if (dueDay > closingDay) {
    dueDateStr = getSafeDateStr(year, month, dueDay);
  } else {
    // Vence no mês seguinte (ex: fecha dia 28 e vence dia 5)
    dueDateStr = getSafeDateStr(year, month + 1, dueDay);
  }

  const startBR = formatDateBR(openingDateStr);
  const endBR = formatDateBR(closingDateStr);

  return {
    startDate: openingDateStr,
    endDate: closingDateStr,
    closingDate: closingDateStr,
    dueDate: dueDateStr,
    formattedRange: `${startBR} a ${endBR}`,
    shortRange: `${startBR.slice(0, 5)} a ${endBR.slice(0, 5)}`,
    closingDay,
    dueDay,
  };
}

/**
 * Calculates which invoice month (YYYY-MM) a card expense falls into based on card closing day.
 */
export function getInvoiceMonthForExpense(expenseDateStr: string, card: CreditCard): string {
  if (!expenseDateStr) return "";
  const parts = expenseDateStr.split("-").map(Number);
  const year = parts[0];
  const month = parts[1] - 1; // 0-indexed
  const day = parts[2];

  const cutoff = card.closingCutoff || "after_closing_day";
  const closingDay = card.closingDay || 15;

  let goesToNextMonth = false;

  if (cutoff === "on_closing_day") {
    // Compras no dia ou após o fechamento já entram na fatura do mês seguinte
    goesToNextMonth = day >= closingDay;
  } else {
    // Compras após o dia de fechamento (ex: dia 17 em diante) entram na próxima fatura.
    // Compras até o dia 16 entram na fatura deste mês.
    goesToNextMonth = day > closingDay;
  }

  if (goesToNextMonth) {
    const nextDate = new Date(year, month + 1, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, "0");
    return `${nextYear}-${nextMonth}`;
  } else {
    const currentMonth = String(month + 1).padStart(2, "0");
    return `${year}-${currentMonth}`;
  }
}

/**
 * Determines the effective reporting month (YYYY-MM) for an expense.
 * In "invoice" mode:
 * - Credit card expenses are grouped by the card's invoice cycle (using closingDay).
 * - Non-card expenses (Pix, Boleto, Dinheiro, Débito) are grouped by calendar month.
 * In "calendar" mode:
 * - All expenses are grouped strictly by expense date (01 a 31).
 */
export function getExpenseEffectiveMonth(
  expense: Expense,
  cards: CreditCard[],
  reportMode: ReportGroupingMode = "invoice"
): string {
  if (!expense.date) return "";

  if (reportMode === "calendar") {
    return expense.date.slice(0, 7);
  }

  // Check if expense is associated with a credit card
  if (expense.cardId) {
    const card = cards.find((c) => c.id === expense.cardId);
    if (card && card.closingDay) {
      return getInvoiceMonthForExpense(expense.date, card);
    }
  }

  // Fallback: If marked as paymentMethod 'credit' and there is only 1 card registered
  if (expense.paymentMethod === "credit" && cards.length === 1 && cards[0].closingDay) {
    return getInvoiceMonthForExpense(expense.date, cards[0]);
  }

  // Other payment methods (Pix, Boleto, Débito, Dinheiro)
  return expense.date.slice(0, 7);
}

/**
 * Checks whether an expense matches the selected month, considering the report mode and optional card filter.
 */
export function isExpenseInSelectedMonth(
  expense: Expense,
  targetMonth: string,
  cards: CreditCard[],
  reportMode: ReportGroupingMode = "invoice",
  filterCardId?: string
): boolean {
  if (!expense.date || !targetMonth) return false;

  // If a specific card filter is active
  if (filterCardId && filterCardId !== "all") {
    if (filterCardId === "no-card") {
      if (expense.cardId || expense.paymentMethod === "credit") return false;
      return expense.date.slice(0, 7) === targetMonth;
    }

    // Specific card selected
    if (expense.cardId !== filterCardId) return false;
    const card = cards.find((c) => c.id === filterCardId);
    if (!card) return expense.date.slice(0, 7) === targetMonth;

    if (reportMode === "invoice") {
      const invPeriod = getCardInvoicePeriod(card, targetMonth);
      return expense.date >= invPeriod.startDate && expense.date <= invPeriod.endDate;
    } else {
      return expense.date.slice(0, 7) === targetMonth;
    }
  }

  // General filtering
  const effectiveMonth = getExpenseEffectiveMonth(expense, cards, reportMode);
  return effectiveMonth === targetMonth;
}

/**
 * Gathers all unique available months (both invoice cycles and calendar) across expenses.
 */
export function getAvailableReportMonths(
  expenses: Expense[],
  cards: CreditCard[],
  reportMode: ReportGroupingMode = "invoice",
  currentSelectedMonth?: string
): string[] {
  const set = new Set<string>();

  if (currentSelectedMonth) {
    set.add(currentSelectedMonth);
  }

  const now = new Date();
  set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

  expenses.forEach((e) => {
    const m = getExpenseEffectiveMonth(e, cards, reportMode);
    if (m && m.length === 7) {
      set.add(m);
    }
    // Also include calendar month so switching modes is always seamless
    if (e.date && e.date.length >= 7) {
      set.add(e.date.slice(0, 7));
    }
  });

  return Array.from(set).sort().reverse();
}

/**
 * Returns human-readable summary description of the invoice / report period.
 */
export function getReportPeriodDescription(
  selectedMonth: string,
  cards: CreditCard[],
  reportMode: ReportGroupingMode,
  filterCardId?: string
): {
  title: string;
  subtitle: string;
  periodBadge?: string;
  isInvoiceMode: boolean;
  activeCard?: CreditCard;
} {
  const [yearStr, monthNumStr] = selectedMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10);
  const monthName = MONTH_NAMES_PT[month - 1] || selectedMonth;

  if (reportMode === "calendar") {
    const lastDay = new Date(year, month, 0).getDate();
    return {
      title: `${monthName} de ${year}`,
      subtitle: `Mês Calendário: 01/${String(month).padStart(2, "0")}/${year} até ${lastDay}/${String(month).padStart(2, "0")}/${year}`,
      periodBadge: `01 a ${lastDay}/${String(month).padStart(2, "0")}`,
      isInvoiceMode: false,
    };
  }

  // Invoice Mode
  if (filterCardId && filterCardId !== "all" && filterCardId !== "no-card") {
    const card = cards.find((c) => c.id === filterCardId);
    if (card) {
      const period = getCardInvoicePeriod(card, selectedMonth);
      return {
        title: `Fatura ${card.name} • ${monthName}/${year}`,
        subtitle: `Abertura: ${formatDateBR(period.startDate)} ➔ Fechamento: ${formatDateBR(period.endDate)} (Vence dia ${period.dueDay})`,
        periodBadge: `${period.shortRange} (Fecha dia ${card.closingDay})`,
        isInvoiceMode: true,
        activeCard: card,
      };
    }
  }

  // If there's exactly 1 card registered in the app
  if (cards.length === 1) {
    const card = cards[0];
    const period = getCardInvoicePeriod(card, selectedMonth);
    return {
      title: `Fatura de ${monthName} de ${year}`,
      subtitle: `Ciclo ${card.name}: Abertura ${formatDateBR(period.startDate)} até Fechamento ${formatDateBR(period.endDate)} (Fecha dia ${card.closingDay})`,
      periodBadge: `${period.shortRange} (Fechamento dia ${card.closingDay})`,
      isInvoiceMode: true,
      activeCard: card,
    };
  }

  // Multiple cards or general view
  const closingDays = Array.from(new Set(cards.map((c) => c.closingDay))).filter(Boolean);
  const closingInfo = closingDays.length > 0 ? `fechamentos dias ${closingDays.join(", ")}` : "fechamento dos cartões";

  return {
    title: `Faturas de ${monthName} de ${year}`,
    subtitle: `Gastos agrupados por fatura (${closingInfo}) e outras despesas no mês`,
    periodBadge: `Por Fatura dos Cartões`,
    isInvoiceMode: true,
  };
}
