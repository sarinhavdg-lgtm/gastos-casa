import { CategoryItem, DefaultExpenseCategory, PaymentMethod } from "../types";

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "alimentacao",
    label: "Alimentação & Refeições",
    color: "#f97316", // orange
    bgColor: "bg-orange-50 text-orange-700 border-orange-200",
    icon: "Utensils",
  },
  {
    id: "mercado",
    label: "Supermercado & Feira",
    color: "#16a34a", // green
    bgColor: "bg-green-50 text-green-700 border-green-200",
    icon: "ShoppingCart",
  },
  {
    id: "energia",
    label: "Energia Elétrica",
    color: "#eab308", // yellow
    bgColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "Zap",
  },
  {
    id: "agua",
    label: "Água e Esgoto",
    color: "#0284c7", // sky blue
    bgColor: "bg-sky-50 text-sky-700 border-sky-200",
    icon: "Droplets",
  },
  {
    id: "gas",
    label: "Gás de Cozinha",
    color: "#ef4444", // red
    bgColor: "bg-red-50 text-red-700 border-red-200",
    icon: "Flame",
  },
  {
    id: "moradia",
    label: "Moradia / Condomínio / Aluguel",
    color: "#8b5cf6", // purple
    bgColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "Home",
  },
  {
    id: "empregada",
    label: "Empregada / Diarista",
    color: "#ec4899", // pink
    bgColor: "bg-pink-50 text-pink-700 border-pink-200",
    icon: "Sparkles",
  },
  {
    id: "internet",
    label: "Internet & TV",
    color: "#06b6d4", // cyan
    bgColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    icon: "Wifi",
  },
  {
    id: "combustivel",
    label: "Combustível & Carro",
    color: "#f59e0b", // amber
    bgColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "Fuel",
  },
  {
    id: "transporte",
    label: "Transporte / Ônibus / Metrô",
    color: "#64748b", // slate
    bgColor: "bg-slate-50 text-slate-700 border-slate-200",
    icon: "Car",
  },
  {
    id: "saude",
    label: "Saúde & Farmácia",
    color: "#10b981", // emerald
    bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "HeartPulse",
  },
  {
    id: "educacao",
    label: "Educação & Cursos",
    color: "#3b82f6", // blue
    bgColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "GraduationCap",
  },
  {
    id: "pets",
    label: "Pets / Animais",
    color: "#14b8a6", // teal
    bgColor: "bg-teal-50 text-teal-700 border-teal-200",
    icon: "PawPrint",
  },
  {
    id: "vestuario",
    label: "Vestuário / Roupas",
    color: "#d946ef", // fuchsia
    bgColor: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    icon: "Shirt",
  },
  {
    id: "beleza",
    label: "Beleza & Cuidados",
    color: "#f43f5e", // rose
    bgColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "Scissors",
  },
  {
    id: "streaming",
    label: "Assinaturas & Streaming",
    color: "#6366f1", // indigo
    bgColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: "Tv",
  },
  {
    id: "impostos",
    label: "Impostos / IPTU / IPVA",
    color: "#78716c", // stone
    bgColor: "bg-stone-50 text-stone-700 border-stone-200",
    icon: "FileText",
  },
  {
    id: "manutencao",
    label: "Manutenção da Casa",
    color: "#b45309", // amber-700
    bgColor: "bg-amber-50 text-amber-800 border-amber-300",
    icon: "Wrench",
  },
  {
    id: "lazer",
    label: "Lazer & Passeios",
    color: "#a855f7", // violet
    bgColor: "bg-violet-50 text-violet-700 border-violet-200",
    icon: "Smile",
  },
  {
    id: "outros",
    label: "Outros Gastos",
    color: "#6b7280", // gray
    bgColor: "bg-gray-50 text-gray-700 border-gray-200",
    icon: "Tag",
  },
];

export const CATEGORY_DETAILS: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string }
> = DEFAULT_CATEGORIES.reduce((acc, item) => {
  acc[item.id] = {
    label: item.label,
    icon: item.icon || "Tag",
    color: item.color,
    bgColor: item.bgColor || "bg-slate-50 text-slate-700 border-slate-200",
  };
  return acc;
}, {} as Record<string, { label: string; icon: string; color: string; bgColor: string }>);

export function getCategoryDetails(
  catKey: string,
  customCategories?: CategoryItem[]
): { label: string; icon: string; color: string; bgColor: string } {
  if (customCategories && customCategories.length > 0) {
    const found = customCategories.find((c) => c.id === catKey);
    if (found) {
      return {
        label: found.label,
        icon: found.icon || "Tag",
        color: found.color,
        bgColor: found.bgColor || "bg-slate-50 text-slate-700 border-slate-200",
      };
    }
  }

  if (CATEGORY_DETAILS[catKey]) {
    return CATEGORY_DETAILS[catKey];
  }

  return {
    label: catKey || "Outros Gastos",
    icon: "Tag",
    color: "#64748b",
    bgColor: "bg-slate-50 text-slate-700 border-slate-200",
  };
}

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
