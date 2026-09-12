import { useState, useMemo } from "react";
import { Expense, CreditCard, ExpenseCategory, PaymentMethod, CategoryItem } from "../types";
import { formatBRL, formatDateBR, getCategoryDetails, DEFAULT_CATEGORIES, PAYMENT_METHOD_LABELS } from "../utils/formatters";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  CreditCard as CardIcon,
  FileSpreadsheet,
  FileText,
  Plus,
  ArrowUpDown,
  Receipt,
  Palette,
} from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  cards: CreditCard[];
  selectedMonth: string;
  onToggleStatus: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenNewExpense: () => void;
  onOpenNFCe?: () => void;
  onViewNFCe?: (expense: Expense) => void;
  onOpenPdfExport?: () => void;
  categories?: CategoryItem[];
  onOpenCategoryManager?: () => void;
  isDark?: boolean;
}

export function ExpenseList({
  expenses,
  cards,
  selectedMonth,
  onToggleStatus,
  onEditExpense,
  onDeleteExpense,
  onOpenNewExpense,
  onOpenNFCe,
  onViewNFCe,
  onOpenPdfExport,
  categories,
  onOpenCategoryManager,
  isDark = false,
}: ExpenseListProps) {
  const activeCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Map cards for quick lookup
  const cardMap = useMemo(() => {
    const map = new Map<string, CreditCard>();
    cards.forEach((c) => map.set(c.id, c));
    return map;
  }, [cards]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        // Month filter
        const matchMonth = e.date.startsWith(selectedMonth);
        if (!matchMonth) return false;

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchDesc = e.description.toLowerCase().includes(term);
          const matchNotes = e.notes?.toLowerCase().includes(term);
          const matchMerchant = e.merchantName?.toLowerCase().includes(term);
          if (!matchDesc && !matchNotes && !matchMerchant) return false;
        }

        // Category filter
        if (selectedCategory !== "all" && e.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "all" && e.status !== selectedStatus) {
          return false;
        }

        // Payment method filter
        if (selectedMethod !== "all" && e.paymentMethod !== selectedMethod) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === "amount") {
          return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
        }
        // Default sort by date
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [
    expenses,
    selectedMonth,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedMethod,
    sortField,
    sortOrder,
  ]);

  const totalFiltered = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert("Não há despesas para exportar no período.");
      return;
    }

    const headers = ["Data", "Descricao", "Categoria", "Valor", "Forma Pagamento", "Cartao", "Status", "Notas"];
    const rows = filteredExpenses.map((e) => {
      const card = e.cardId ? cardMap.get(e.cardId)?.name || "" : "";
      return [
        e.date,
        `"${e.description.replace(/"/g, '""')}"`,
        getCategoryDetails(e.category, categories).label || e.category,
        e.amount.toFixed(2),
        PAYMENT_METHOD_LABELS[e.paymentMethod] || e.paymentMethod,
        `"${card}"`,
        e.status === "paid" ? "Paga" : "Pendente",
        `"${(e.notes || "").replace(/"/g, '""')}"`,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `despesas-casa-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const bgContainer = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900";
  const bgInput = isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900";
  const tableBorder = isDark ? "border-slate-800" : "border-slate-200";

  return (
    <div id="expenses-list-container" className={`rounded-2xl border shadow-xs overflow-hidden ${bgContainer}`}>
      {/* Table Header Controls */}
      <div className={`p-5 border-b space-y-4 ${tableBorder}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Registro de Despesas da Casa
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredExpenses.length} despesas encontradas • Total:{" "}
              <strong className={isDark ? "text-white font-black" : "text-slate-900 font-black"}>
                {formatBRL(totalFiltered)}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNFCe && (
              <button
                onClick={onOpenNFCe}
                className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isDark
                    ? "bg-indigo-950/60 hover:bg-indigo-900 border-indigo-800 text-indigo-300"
                    : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
                }`}
                title="Importar Cupom Fiscal NFC-e"
              >
                <Receipt className="w-4 h-4 text-indigo-500" />
                Importar NFC-e
              </button>
            )}

            {onOpenPdfExport && (
              <button
                id="btn-open-pdf-modal"
                onClick={onOpenPdfExport}
                className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isDark
                    ? "bg-red-950/50 hover:bg-red-900/60 border-red-800 text-red-300"
                    : "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                }`}
                title="Visualizar, Baixar e Compartilhar Todos os Gastos em PDF"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline">Relatório</span> PDF
              </button>
            )}

            {onOpenCategoryManager && (
              <button
                id="btn-open-category-manager-list"
                onClick={onOpenCategoryManager}
                className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isDark
                    ? "bg-purple-950/50 hover:bg-purple-900/60 border-purple-800 text-purple-300"
                    : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                }`}
                title="Editar, Renomear ou Criar Categorias da Casa"
              >
                <Palette className="w-4 h-4 text-purple-500" />
                <span className="hidden sm:inline">Categorias</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
              title="Exportar para Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              CSV
            </button>

            <button
              id="btn-add-expense-from-list"
              onClick={onOpenNewExpense}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Gasto
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Buscar conta, mercado, diarista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs ${bgInput}`}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs ${bgInput}`}
            >
              <option value="all">Todas as Categorias</option>
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs ${bgInput}`}
            >
              <option value="all">Todos os Status</option>
              <option value="paid">Apenas Pagas</option>
              <option value="pending">Apenas Pendentes (A Pagar)</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              id="filter-method-select"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs ${bgInput}`}
            >
              <option value="all">Todas as Formas de Pagto</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <p className="text-sm font-semibold text-slate-400">
              Nenhuma despesa encontrada para os filtros selecionados no mês.
            </p>
            <button
              onClick={onOpenNewExpense}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Primeiro Gasto
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className={`uppercase text-[10px] font-bold tracking-wider ${isDark ? "bg-slate-800/80 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => {
                      if (sortField === "date") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("date");
                        setSortOrder("desc");
                      }
                    }}
                    className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer"
                  >
                    Data <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Descrição / Estabelecimento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Pagamento</th>
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      if (sortField === "amount") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("amount");
                        setSortOrder("desc");
                      }
                    }}
                    className="flex items-center gap-1 ml-auto hover:text-indigo-400 cursor-pointer"
                  >
                    Valor <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? "divide-slate-800 text-slate-300" : "divide-slate-100 text-slate-700"}`}>
              {filteredExpenses.map((exp) => {
                const cat = getCategoryDetails(exp.category, categories);
                const card = exp.cardId ? cardMap.get(exp.cardId) : null;
                const isPaid = exp.status === "paid";
                const hasNFCe = exp.items && exp.items.length > 0;

                return (
                  <tr
                    key={exp.id}
                    className={`transition-colors ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50/70"}`}
                  >
                    {/* Status toggle pill */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(exp.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                        }`}
                        title="Clique para alternar entre Paga e Pendente"
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Paga
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            Pendente
                          </>
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-medium text-slate-400 whitespace-nowrap">
                      {formatDateBR(exp.date)}
                    </td>

                    {/* Description & Notes & NFC-e Badge */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold block truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                          {exp.description}
                        </span>
                        {hasNFCe && (
                          <button
                            onClick={() => onViewNFCe?.(exp)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-[10px] font-bold transition-colors cursor-pointer"
                            title="Ver itens da NFC-e"
                          >
                            <Receipt className="w-3 h-3 text-indigo-400" />
                            {exp.items?.length} itens
                          </button>
                        )}
                      </div>
                      {exp.notes && (
                        <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                          {exp.notes}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          cat?.bgColor || "bg-slate-100 text-slate-800 border-slate-200"
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat?.color }}
                        />
                        {cat?.label || exp.category}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">
                          {PAYMENT_METHOD_LABELS[exp.paymentMethod] || exp.paymentMethod}
                        </span>
                        {card && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-white font-medium shadow-2xs"
                            style={{ backgroundColor: card.color || "#059669" }}
                          >
                            <CardIcon className="w-2.5 h-2.5" />
                            {card.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className={`py-3.5 px-4 text-right font-extrabold whitespace-nowrap ${isDark ? "text-white" : "text-slate-900"}`}>
                      {formatBRL(exp.amount)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir a despesa "${exp.description}"?`)) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
