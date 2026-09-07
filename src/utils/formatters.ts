import { ExpenseCategory, PaymentMethod } from "../types";

export const CATEGORY_DETAILS: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  alimentacao: {
    label: "Alimentação",
    icon: "Utensils",
    color: "#f97316", // orange
    bgColor: "bg-orange-50 text-orange-700 border-orange-200",
  },
  energia: {
    label: "Energia Elétrica",
    icon: "Zap",
    color: "#eab308", // yellow
    bgColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  agua: {
    label: "Água e Esgoto",
    icon: "Droplets",
    color: "#0284c7", // sky blue
    bgColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  empregada: {
    label: "Empregada / Diarista",
    icon: "Sparkles",
    color: "#ec4899", // pink
    bgColor: "bg-pink-50 text-pink-700 border-pink-200",
  },
  moradia: {
    label: "Moradia / Condomínio",
    icon: "Home",
    color: "#8b5cf6", // purple
    bgColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  internet: {
    label: "Internet & TV",
    icon: "Wifi",
    color: "#06b6d4", // cyan
    bgColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  gas: {
    label: "Gás de Cozinha",
    icon: "Flame",
    color: "#ef4444", // red
    bgColor: "bg-red-50 text-red-700 border-red-200",
  },
  transporte: {
    label: "Transporte",
    icon: "Car",
    color: "#64748b", // slate
    bgColor: "bg-slate-50 text-slate-700 border-slate-200",
  },
  saude: {
    label: "Saúde & Farmácia",
    icon: "HeartPulse",
    color: "#10b981", // emerald
    bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  manutencao: {
    label: "Manutenção da Casa",
    icon: "Wrench",
    color: "#d97706", // amber
    bgColor: "bg-amber-50 text-amber-800 border-amber-300",
  },
  lazer: {
    label: "Lazer & Passeios",
    icon: "Smile",
    color: "#a855f7", // violet
    bgColor: "bg-violet-50 text-violet-700 border-violet-200",
  },
  outros: {
    label: "Outros Gastos",
    icon: "Tag",
    color: "#6b7280", // gray
    bgColor: "bg-gray-50 text-gray-700 border-gray-200",
  },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  credit: "Cartão de Crédito",
  pix: "Pix",
  boleto: "Boleto Bancário",
  debit: "Cartão de Débito",
  cash: "Dinheiro / Espécie",
};

export function formatBRL(val: number): string {
  if (isNaN(val)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export const MONTH_NAMES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function getMonthYearLabel(monthKey: string): string {
  // format YYYY-MM
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return monthKey;
  return `${MONTH_NAMES_PT[month - 1]} de ${year}`;
}
