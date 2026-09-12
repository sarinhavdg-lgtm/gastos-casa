import { useState, useMemo } from "react";
import { Expense, CreditCard, CategoryItem } from "../types";
import { formatBRL, getCategoryDetails, MONTH_NAMES_PT } from "../utils/formatters";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { BarChart3, PieChart as PieIcon, CreditCard as CardIcon, Calendar } from "lucide-react";

interface InteractiveChartsProps {
  expenses: Expense[];
  cards: CreditCard[];
  monthlyIncome: number;
  selectedMonth: string; // YYYY-MM
  categories?: CategoryItem[];
  isDark?: boolean;
}

export function InteractiveCharts({
  expenses,
  cards,
  monthlyIncome,
  selectedMonth,
  categories,
  isDark = false,
}: InteractiveChartsProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "history" | "payment">("categories");

  // 1. Data for Selected Month Categories
  const categoryData = useMemo(() => {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
    const totals: Record<string, number> = {};

    monthExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

    return Object.entries(totals)
      .map(([catKey, amount]) => {
        const catInfo = getCategoryDetails(catKey, categories);
        return {
          name: catInfo.label,
          key: catKey,
          value: Math.round(amount * 100) / 100,
          color: catInfo.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [expenses, selectedMonth, categories]);

  // 2. Data for Monthly History (all unique months)
  const historyData = useMemo(() => {
    const monthTotals: Record<string, number> = {};

    expenses.forEach((e) => {
      const ym = e.date.slice(0, 7);
      monthTotals[ym] = (monthTotals[ym] || 0) + e.amount;
    });

    const sortedYms = Object.keys(monthTotals).sort();
    return sortedYms.map((ym) => {
      const [year, month] = ym.split("-").map(Number);
      const shortName = `${MONTH_NAMES_PT[month - 1]?.slice(0, 3)}/${String(year).slice(-2)}`;
      return {
        monthKey: ym,
        monthName: shortName,
        totalSpent: monthTotals[ym],
        income: monthlyIncome,
      };
    });
  }, [expenses, monthlyIncome]);

  // 3. Data for Payment Methods & Cards in selected month
  const paymentMethodData = useMemo(() => {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
    const methods: Record<string, number> = {
      pix: 0,
      boleto: 0,
      credit: 0,
      debit: 0,
      cash: 0,
    };

    monthExpenses.forEach((e) => {
      methods[e.paymentMethod] = (methods[e.paymentMethod] || 0) + e.amount;
    });

    return [
      { name: "Cartão de Crédito", amount: methods.credit, color: "#820ad1" },
      { name: "Pix", amount: methods.pix, color: "#00bdae" },
      { name: "Boleto", amount: methods.boleto, color: "#f59e0b" },
      { name: "Débito", amount: methods.debit, color: "#3b82f6" },
      { name: "Dinheiro", amount: methods.cash, color: "#10b981" },
    ].filter((item) => item.amount > 0);
  }, [expenses, selectedMonth]);

  const totalMonthSpent = categoryData.reduce((acc, curr) => acc + curr.value, 0);

  const bgContainer = isDark
    ? "bg-slate-900 border-slate-800 text-white"
    : "bg-white border-slate-200 text-slate-900";
  const bgTabs = isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200";

  return (
    <div id="interactive-charts-section" className={`rounded-2xl border p-5 md:p-6 shadow-xs space-y-5 ${bgContainer}`}>
      {/* Header & View Switcher */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div>
          <h2 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Comparativo e Gráficos de Gastos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visão geral dos últimos meses e centros de custo da casa
          </p>
        </div>

        {/* Tab Buttons */}
        <div className={`flex p-1 rounded-xl text-xs font-semibold ${bgTabs}`}>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "categories"
                ? isDark
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-indigo-400" />
            Por Categoria
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? isDark
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Evolução Mensal
          </button>

          <button
            onClick={() => setActiveTab("payment")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "payment"
                ? isDark
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CardIcon className="w-3.5 h-3.5 text-orange-400" />
            Formas de Pagamento
          </button>
        </div>
      </div>

      {/* View 1: Categories Donut & List */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 h-72 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhuma despesa para exibir no gráfico deste mês.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val) || 0), "Valor"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#38bdf8" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="lg:col-span-5 space-y-2 max-h-72 overflow-y-auto pr-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Ranking de Gastos no Mês ({formatBRL(totalMonthSpent)})
            </span>
            {categoryData.map((cat) => {
              const pct = totalMonthSpent > 0 ? ((cat.value / totalMonthSpent) * 100).toFixed(1) : "0";
              return (
                <div
                  key={cat.key}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-slate-800 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 block">
                      {formatBRL(cat.value)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {pct}% do total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Monthly Evolution Bar Chart */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Evolução de Gastos Mês a Mês vs Renda Mensal</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                Despesas Totais
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-rose-500 inline-block" />
                Renda Mensal
              </span>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {historyData.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum histórico de gastos registrado ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    tickFormatter={(val) => `R$ ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val) || 0), "Gasto"]}
                    labelFormatter={(name) => `Mês: ${name}`}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <ReferenceLine
                    y={monthlyIncome}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: `Renda: ${formatBRL(monthlyIncome)}`,
                      position: "top",
                      fill: "#ef4444",
                      fontSize: 10,
                    }}
                  />
                  <Bar dataKey="totalSpent" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* View 3: Payment Methods */}
      {activeTab === "payment" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentMethodData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(val) => `R$ ${val}`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#334155" }} />
                <Tooltip
                  formatter={(val: any) => [formatBRL(Number(val) || 0), "Total"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} fill="#820ad1" maxBarSize={30}>
                  {paymentMethodData.map((entry, idx) => (
                    <Cell key={`pm-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Distribuição por Método
            </h3>
            {paymentMethodData.map((pm) => (
              <div
                key={pm.name}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: pm.color }}
                  />
                  <span className="font-semibold text-slate-800">{pm.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{formatBRL(pm.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
