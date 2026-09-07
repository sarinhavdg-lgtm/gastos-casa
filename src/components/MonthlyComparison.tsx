import { useMemo, useState } from "react";
import { Expense } from "../types";
import { formatBRL, CATEGORY_DETAILS, MONTH_NAMES_PT, getMonthYearLabel } from "../utils/formatters";
import {
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface MonthlyComparisonProps {
  expenses: Expense[];
  currentMonth: string; // YYYY-MM
  availableMonths: string[];
  isDark?: boolean;
}

export function MonthlyComparison({
  expenses,
  currentMonth,
  availableMonths,
  isDark = false,
}: MonthlyComparisonProps) {
  // Determine previous month by default
  const sortedMonths = useMemo(() => {
    return [...availableMonths].sort().reverse();
  }, [availableMonths]);

  const defaultPrevMonth = useMemo(() => {
    const currentIndex = sortedMonths.indexOf(currentMonth);
    if (currentIndex !== -1 && currentIndex + 1 < sortedMonths.length) {
      return sortedMonths[currentIndex + 1];
    }
    return sortedMonths[1] || currentMonth;
  }, [sortedMonths, currentMonth]);

  const [compareMonth, setCompareMonth] = useState<string>(defaultPrevMonth);

  // Totals for Month A (current) and Month B (compare)
  const monthAExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(currentMonth)),
    [expenses, currentMonth]
  );
  const monthBExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(compareMonth)),
    [expenses, compareMonth]
  );

  const totalA = monthAExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalB = monthBExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const diffAmount = totalA - totalB;
  const diffPercent = totalB > 0 ? ((totalA - totalB) / totalB) * 100 : 0;
  const isSavings = diffAmount < 0;

  // Breakdown by Category
  const categoryComparison = useMemo(() => {
    const allCategories = new Set<string>();
    monthAExpenses.forEach((e) => allCategories.add(e.category));
    monthBExpenses.forEach((e) => allCategories.add(e.category));

    const rows = Array.from(allCategories).map((catKey) => {
      const amtA = monthAExpenses
        .filter((e) => e.category === catKey)
        .reduce((sum, e) => sum + e.amount, 0);
      const amtB = monthBExpenses
        .filter((e) => e.category === catKey)
        .reduce((sum, e) => sum + e.amount, 0);
      const diff = amtA - amtB;
      const pct = amtB > 0 ? ((amtA - amtB) / amtB) * 100 : amtA > 0 ? 100 : 0;

      return {
        catKey,
        amtA,
        amtB,
        diff,
        pct,
      };
    });

    // Sort by largest absolute spending
    rows.sort((a, b) => b.amtA - a.amtA);
    return rows;
  }, [monthAExpenses, monthBExpenses]);

  const bgContainer = isDark
    ? "bg-slate-900 border-slate-800 text-white"
    : "bg-white border-slate-200 text-slate-900";
  const bgSubCard = isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200";

  return (
    <div id="monthly-comparison-section" className={`rounded-2xl border p-5 md:p-6 shadow-xs space-y-6 ${bgContainer}`}>
      {/* Header & Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isDark ? "bg-indigo-950/70 text-indigo-400" : "bg-indigo-50 text-indigo-700"}`}>
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Comparativo Mensal de Despesas
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Veja onde você economizou ou gastou a mais em relação a outros períodos
          </p>
        </div>

        {/* Month Selector for comparison */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Comparar com:</span>
          <select
            id="select-compare-month"
            value={compareMonth}
            onChange={(e) => setCompareMonth(e.target.value)}
            className={`px-3 py-1.5 border rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-800"
            }`}
          >
            {sortedMonths.map((m) => (
              <option key={m} value={m} disabled={m === currentMonth}>
                {getMonthYearLabel(m)} {m === currentMonth ? "(Mês Atual Selecionado)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-level Diff Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Month A */}
        <div className={`p-4 rounded-xl border ${bgSubCard}`}>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {getMonthYearLabel(currentMonth)}
          </span>
          <span className="text-2xl font-extrabold mt-1 block">
            {formatBRL(totalA)}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {monthAExpenses.length} contas cadastradas
          </span>
        </div>

        {/* Month B */}
        <div className={`p-4 rounded-xl border ${bgSubCard}`}>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {getMonthYearLabel(compareMonth)}
          </span>
          <span className="text-2xl font-extrabold mt-1 block">
            {formatBRL(totalB)}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {monthBExpenses.length} contas cadastradas
          </span>
        </div>

        {/* Variação Geral */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isSavings
              ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
              : diffAmount === 0
              ? "bg-slate-50 border-slate-200 text-slate-800"
              : "bg-rose-50/70 border-rose-300 text-rose-950"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                Variação Total
              </span>
              {isSavings ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Economia
                </span>
              ) : diffAmount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Aumento
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                  Estável
                </span>
              )}
            </div>

            <div className="text-2xl font-black mt-1">
              {isSavings ? "-" : diffAmount > 0 ? "+" : ""}
              {formatBRL(Math.abs(diffAmount))}
            </div>
          </div>

          <span className="text-xs font-medium mt-1">
            {isSavings
              ? `Gastou ${Math.abs(diffPercent).toFixed(1)}% MENOS do que em ${getMonthYearLabel(compareMonth)}`
              : diffAmount > 0
              ? `Gastou ${diffPercent.toFixed(1)}% MAIS do que em ${getMonthYearLabel(compareMonth)}`
              : "Mesmo total de gastos"}
          </span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Detalhamento da Variação por Categoria de Casa
        </h3>

        {categoryComparison.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Sem dados suficientes para comparação nestes meses.
          </p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">{getMonthYearLabel(currentMonth)}</th>
                  <th className="py-3 px-4 text-right">{getMonthYearLabel(compareMonth)}</th>
                  <th className="py-3 px-4 text-right">Diferença (R$)</th>
                  <th className="py-3 px-4 text-right">Variação (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {categoryComparison.map((row) => {
                  const cat = CATEGORY_DETAILS[row.catKey as keyof typeof CATEGORY_DETAILS];
                  const isCatSavings = row.diff < 0;

                  return (
                    <tr key={row.catKey} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat?.color || "#94a3b8" }}
                        />
                        <span className="font-semibold text-slate-900">
                          {cat?.label || row.catKey}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatBRL(row.amtA)}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatBRL(row.amtB)}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          isCatSavings
                            ? "text-emerald-700"
                            : row.diff > 0
                            ? "text-rose-600"
                            : "text-slate-500"
                        }`}
                      >
                        {isCatSavings ? "-" : row.diff > 0 ? "+" : ""}
                        {formatBRL(Math.abs(row.diff))}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isCatSavings
                              ? "bg-emerald-50 text-emerald-700"
                              : row.diff > 0
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isCatSavings ? "▼ " : row.diff > 0 ? "▲ " : ""}
                          {Math.abs(row.pct).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
