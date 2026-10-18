import { useState } from "react";
import { Expense, CreditCard, ReportGroupingMode } from "../types";
import { formatBRL, CATEGORY_DETAILS } from "../utils/formatters";
import { isExpenseInSelectedMonth, getReportPeriodDescription } from "../utils/invoiceUtils";
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Wallet,
  PieChart,
  Edit2,
  Check,
  Calendar,
  CreditCard as CardIcon,
  ArrowRightLeft,
  Sparkles,
} from "lucide-react";

interface SummaryCardsProps {
  expenses: Expense[];
  cards?: CreditCard[];
  monthlyIncome: number;
  onUpdateIncome: (newIncome: number) => void;
  selectedMonth: string; // YYYY-MM
  reportMode?: ReportGroupingMode;
  onToggleReportMode?: () => void;
  selectedCardId?: string;
  isDark?: boolean;
}

export function SummaryCards({
  expenses,
  cards = [],
  monthlyIncome,
  onUpdateIncome,
  selectedMonth,
  reportMode = "invoice",
  onToggleReportMode,
  selectedCardId = "all",
  isDark = false,
}: SummaryCardsProps) {
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString());

  // Filter expenses according to the active report mode (invoice vs calendar)
  const monthExpenses = expenses.filter((e) =>
    isExpenseInSelectedMonth(e, selectedMonth, cards, reportMode, selectedCardId)
  );

  const periodDesc = getReportPeriodDescription(selectedMonth, cards, reportMode, selectedCardId);

  const totalSpent = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = monthExpenses
    .filter((e) => e.status === "paid")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = monthExpenses
    .filter((e) => e.status === "pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCount = monthExpenses.filter((e) => e.status === "pending").length;
  const paidCount = monthExpenses.filter((e) => e.status === "paid").length;

  const balance = monthlyIncome - totalSpent;
  const budgetUsagePercent = monthlyIncome > 0 ? Math.min(100, Math.round((totalSpent / monthlyIncome) * 100)) : 0;

  // Category with highest spending
  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  let topCategoryKey = "";
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategoryKey = cat;
    }
  });

  const handleSaveIncome = () => {
    const val = parseFloat(incomeInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateIncome(val);
      setIsEditingIncome(false);
    }
  };

  const bgCard = isDark
    ? "bg-slate-900 border-slate-800 text-white"
    : "bg-white border-slate-200 text-slate-900";
  const bgBar = isDark ? "bg-slate-800" : "bg-slate-100";
  const textSub = isDark ? "text-slate-400" : "text-slate-500";
  const textBoldSub = isDark ? "text-slate-200" : "text-slate-700";

  return (
    <div className="space-y-3">
      {/* Dynamic Invoice / Month Period Indicator Banner */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              reportMode === "invoice"
                ? "bg-indigo-500/15 text-indigo-500 border border-indigo-500/30"
                : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
            }`}
          >
            {reportMode === "invoice" ? (
              <CardIcon className="w-5 h-5" />
            ) : (
              <Calendar className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                {periodDesc.title}
              </h2>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  reportMode === "invoice"
                    ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800"
                    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                }`}
              >
                {reportMode === "invoice" ? "💳 Ciclo por Fechamento dos Cartões" : "🗓️ Mês Calendário"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {periodDesc.subtitle}
            </p>
          </div>
        </div>

        {onToggleReportMode && (
          <button
            type="button"
            onClick={onToggleReportMode}
            className={`self-start sm:self-center shrink-0 px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? "bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
            }`}
            title="Alternar entre o cálculo por fechamento da fatura ou mês civil"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {reportMode === "invoice" ? "Ver Mês Calendário" : "Ver por Fatura dos Cartões"}
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Despesas do Mês */}
      <div
        id="card-total-spent"
        className={`p-4 rounded-xl border shadow-sm transition-colors ${bgCard}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Despesas
          </p>
          <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <p className="text-xl font-black tracking-tight">
            {formatBRL(totalSpent)}
          </p>
          <div className={`mt-1 flex items-center justify-between text-[11px] font-medium ${textSub}`}>
            <span>{monthExpenses.length} contas</span>
            <span className={`font-bold ${textBoldSub}`}>
              {budgetUsagePercent}% da renda
            </span>
          </div>
        </div>
        {/* High Density progress bar */}
        <div className={`w-full ${bgBar} h-1.5 rounded-full mt-2 overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all ${
              budgetUsagePercent > 90
                ? "bg-rose-500"
                : budgetUsagePercent > 70
                ? "bg-orange-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
          />
        </div>
      </div>

      {/* Contas Pagas vs Pendentes */}
      <div
        id="card-paid-pending"
        className={`p-4 rounded-xl border shadow-sm transition-colors ${bgCard}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            A Pagar / Pendente
          </p>
          <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
            {pendingCount > 0 ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </div>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-black">
              {formatBRL(totalPending)}
            </p>
            <span className="text-[11px] font-bold text-amber-500 uppercase">pendente</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-medium">
            <span className="text-emerald-500 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Pagas: {formatBRL(totalPaid)}
            </span>
            <span className={`${textSub} font-bold`}>
              {pendingCount} fatura(s)
            </span>
          </div>
        </div>
        <div className={`w-full ${bgBar} h-1.5 rounded-full mt-2 overflow-hidden`}>
          <div
            className="bg-amber-500 h-full rounded-full"
            style={{
              width: `${totalSpent > 0 ? Math.min(100, (totalPending / totalSpent) * 100) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Renda & Saldo */}
      <div
        id="card-income-balance"
        className={`p-4 rounded-xl border shadow-sm transition-colors ${bgCard}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Saldo Líquido
          </p>
          <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline gap-1.5">
            <p
              className={`text-xl font-black tracking-tight ${
                balance >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {formatBRL(balance)}
            </p>
            <span className="text-[11px] text-slate-400 font-bold uppercase">restante</span>
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px]">
            {isEditingIncome ? (
              <div className="flex items-center gap-1 w-full">
                <input
                  id="edit-income-input"
                  type="number"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="w-full text-xs font-bold border border-indigo-500 rounded px-1.5 py-0.5 bg-transparent"
                  autoFocus
                />
                <button
                  id="btn-confirm-income"
                  onClick={handleSaveIncome}
                  className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                  title="Salvar Renda"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <span className={`${textSub} font-medium`}>
                  Renda: <strong className={textBoldSub}>{formatBRL(monthlyIncome)}</strong>
                </span>
                <button
                  id="btn-edit-income"
                  onClick={() => {
                    setIncomeInput(monthlyIncome.toString());
                    setIsEditingIncome(true);
                  }}
                  className="text-indigo-500 hover:text-indigo-400 font-bold cursor-pointer text-[10px] uppercase"
                  title="Editar Renda Mensal"
                >
                  Alterar
                </button>
              </>
            )}
          </div>
        </div>
        <div className={`w-full ${bgBar} h-1.5 rounded-full mt-2 overflow-hidden`}>
          <div
            className={`h-full rounded-full ${balance >= 0 ? "bg-indigo-600" : "bg-rose-500"}`}
            style={{
              width: `${monthlyIncome > 0 ? Math.min(100, Math.max(0, (balance / monthlyIncome) * 100)) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Maior Gasto por Categoria */}
      <div
        id="card-top-category"
        className={`p-4 rounded-xl border shadow-sm transition-colors ${bgCard}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Maior Gasto
          </p>
          <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          {topCategoryKey ? (
            <>
              <p className="text-xl font-black truncate">
                {CATEGORY_DETAILS[topCategoryKey as keyof typeof CATEGORY_DETAILS]?.label || topCategoryKey}
              </p>
              <div className={`mt-1 flex items-center justify-between text-[11px] font-medium ${textSub}`}>
                <span className={`font-bold ${textBoldSub}`}>{formatBRL(topCategoryAmount)}</span>
                <span className="font-bold text-indigo-500">
                  {totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0}% do total
                </span>
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-400 block mt-1">
              Sem despesas no mês
            </span>
          )}
        </div>
        <div className={`w-full ${bgBar} h-1.5 rounded-full mt-2 overflow-hidden`}>
          <div
            className="bg-indigo-500 h-full rounded-full"
            style={{
              width: `${totalSpent > 0 ? Math.min(100, (topCategoryAmount / totalSpent) * 100) : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
    </div>
  );
}
