export type DefaultExpenseCategory =
  | "alimentacao"
  | "mercado"
  | "energia"
  | "agua"
  | "empregada"
  | "moradia"
  | "internet"
  | "gas"
  | "combustivel"
  | "transporte"
  | "saude"
  | "educacao"
  | "pets"
  | "vestuario"
  | "beleza"
  | "streaming"
  | "impostos"
  | "manutencao"
  | "lazer"
  | "outros";

export type ExpenseCategory = DefaultExpenseCategory | (string & {});

export interface CategoryItem {
  id: string;
  label: string;
  color: string;
  icon?: string;
  bgColor?: string;
  isCustom?: boolean;
}

export type PaymentMethod = "credit" | "pix" | "boleto" | "debit" | "cash";

export interface CreditCard {
  id: string;
  name: string;
  brand: string;
  closingDay: number; // Dia em que a fatura fecha (melhor data de compra começa aqui!)
  dueDay: number; // Dia de vencimento do pagamento
  limit: number;
  color: string;
}

export type ThemeMode = "light" | "dark";

export interface NFCeItem {
  id?: string;
  name: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface NFCeReceipt {
  accessKey: string;
  issuerName: string;
  cnpj?: string;
  date: string;
  totalAmount: number;
  items: NFCeItem[];
  uf?: string;
  invoiceNumber?: string;
}

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  cardId?: string;
  status: "paid" | "pending";
  notes?: string;
  nfceKey?: string;
  merchantName?: string;
  items?: NFCeItem[];
}

export interface FinanceData {
  monthlyIncome: number;
  cards: CreditCard[];
  expenses: Expense[];
  categories?: CategoryItem[];
  lastUpdated?: string;
  version?: number;
}

export interface CardRecommendation {
  card: CreditCard;
  isBestToday: boolean;
  score: number;
  daysUntilClosing: number;
  daysUntilDueIfBoughtToday: number;
  closingDateThisCycle: string;
  effectiveDueDate: string;
  statusText: string;
  statusType: "success" | "warning" | "neutral";
  tip: string;
}
