import { CreditCard, CardRecommendation } from "../types";

/**
 * Calculates the exact recommendation and best purchase date for each card
 * relative to a given date (defaults to today).
 */
export function analyzeCardForDate(card: CreditCard, referenceDate: Date = new Date()): CardRecommendation {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed
  const currentDay = referenceDate.getDate();

  // Create date helper keeping within valid month bounds
  const getSafeDate = (year: number, month: number, day: number) => {
    // If day exceeds month's max days, cap it
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(day, lastDayOfMonth));
  };

  // Determine whether this month's invoice has already closed
  // When purchase is made ON or AFTER closingDay, it belongs to the next billing cycle.
  const hasClosedThisMonth = currentDay >= card.closingDay;

  // Next closing date
  let nextClosing: Date;
  if (hasClosedThisMonth) {
    // Next closing is next month
    nextClosing = getSafeDate(currentYear, currentMonth + 1, card.closingDay);
  } else {
    // Next closing is this month
    nextClosing = getSafeDate(currentYear, currentMonth, card.closingDay);
  }

  // Calculate the due date for a purchase made TODAY:
  let effectiveDueDate: Date;
  if (hasClosedThisMonth) {
    // Falls into the NEXT cycle.
    // If dueDay > closingDay, due date is next month's dueDay.
    // If dueDay <= closingDay (e.g. closes on 28th, due on 5th of next month), it rolls over to 2 months ahead!
    if (card.dueDay > card.closingDay) {
      effectiveDueDate = getSafeDate(currentYear, currentMonth + 1, card.dueDay);
    } else {
      effectiveDueDate = getSafeDate(currentYear, currentMonth + 2, card.dueDay);
    }
  } else {
    // Falls into THIS current cycle.
    // Will be due this month (if dueDay > closingDay) or next month (if dueDay <= closingDay)
    if (card.dueDay > card.closingDay) {
      effectiveDueDate = getSafeDate(currentYear, currentMonth, card.dueDay);
    } else {
      effectiveDueDate = getSafeDate(currentYear, currentMonth + 1, card.dueDay);
    }
  }

  // Calculate days difference
  const oneDayMs = 1000 * 60 * 60 * 24;
  const todayReset = new Date(currentYear, currentMonth, currentDay);
  
  const daysUntilClosing = Math.max(0, Math.round((nextClosing.getTime() - todayReset.getTime()) / oneDayMs));
  const daysUntilDueIfBoughtToday = Math.max(1, Math.round((effectiveDueDate.getTime() - todayReset.getTime()) / oneDayMs));

  // Determine status and tip
  let statusType: "success" | "warning" | "neutral" = "neutral";
  let statusText = "";
  let tip = "";
  let score = daysUntilDueIfBoughtToday;

  // Days since closing (if closed this month)
  const daysSinceClosing = hasClosedThisMonth ? currentDay - card.closingDay : 30 - (card.closingDay - currentDay);

  if (currentDay === card.closingDay) {
    statusType = "success";
    statusText = "MELHOR DIA DE COMPRA: Fatura fecha HOJE!";
    tip = `Excelente momento! Compras a partir de hoje caem direto na fatura de ${effectiveDueDate.toLocaleDateString("pt-BR", { month: "long" })}, dando ${daysUntilDueIfBoughtToday} dias de prazo!`;
    score += 20; // bonus priority
  } else if (hasClosedThisMonth && daysSinceClosing <= 7) {
    statusType = "success";
    statusText = `Janela de Ouro (${daysSinceClosing} dias pós-fechamento)`;
    tip = `Ótima escolha! Fatura fechou dia ${card.closingDay}. Compras hoje vencem somente em ${effectiveDueDate.toLocaleDateString("pt-BR")}. Você terá ${daysUntilDueIfBoughtToday} dias para pagar!`;
    score += 15;
  } else if (!hasClosedThisMonth && daysUntilClosing <= 3) {
    statusType = "warning";
    statusText = `Fatura fecha em ${daysUntilClosing} dia(s)!`;
    tip = `Atenção: Espere ${daysUntilClosing} dia(s) até dia ${card.closingDay}! Se comprar agora, você terá apenas ${daysUntilDueIfBoughtToday} dias para pagar. Se aguardar, ganhará mais de 35 dias!`;
    score -= 10;
  } else if (!hasClosedThisMonth && daysUntilClosing <= 7) {
    statusType = "warning";
    statusText = `Fatura fecha em ${daysUntilClosing} dias`;
    tip = `Fechamento próximo dia ${card.closingDay}. Para compras de alto valor, prefira esperar o fechamento para ter prazo máximo.`;
  } else {
    statusType = "neutral";
    statusText = `Ciclo regular (${daysUntilDueIfBoughtToday} dias até o vencimento)`;
    tip = `Próximo fechamento em ${nextClosing.toLocaleDateString("pt-BR")}. Vencimento da compra de hoje em ${effectiveDueDate.toLocaleDateString("pt-BR")}.`;
  }

  return {
    card,
    isBestToday: false, // will be resolved across all cards
    score,
    daysUntilClosing,
    daysUntilDueIfBoughtToday,
    closingDateThisCycle: nextClosing.toISOString().split("T")[0],
    effectiveDueDate: effectiveDueDate.toISOString().split("T")[0],
    statusText,
    statusType,
    tip,
  };
}

/**
 * Compares all cards and finds the best card to buy today
 */
export function getCardsRecommendations(cards: CreditCard[], referenceDate: Date = new Date()): CardRecommendation[] {
  if (!cards || cards.length === 0) return [];

  const analyzed = cards.map((c) => analyzeCardForDate(c, referenceDate));

  // Sort descending by score / days until due
  analyzed.sort((a, b) => b.score - a.score || b.daysUntilDueIfBoughtToday - a.daysUntilDueIfBoughtToday);

  // Mark the top card as best today
  if (analyzed.length > 0) {
    analyzed[0].isBestToday = true;
  }

  return analyzed;
}

/**
 * Predicts the invoice billing month for an expense made on a specific date with a card
 */
export function getInvoiceMonthForExpense(expenseDateStr: string, card: CreditCard): string {
  const parts = expenseDateStr.split("-").map(Number);
  const year = parts[0];
  const month = parts[1] - 1;
  const day = parts[2];

  if (day >= card.closingDay) {
    // Falls into the following month's bill
    const nextDate = new Date(year, month + 1, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, "0");
    return `${nextYear}-${nextMonth}`;
  } else {
    // Falls into this month's bill
    const currentMonth = String(month + 1).padStart(2, "0");
    return `${year}-${currentMonth}`;
  }
}
