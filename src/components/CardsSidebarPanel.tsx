import { CreditCard, Expense } from "../types";
import { formatBRL, CATEGORY_DETAILS } from "../utils/formatters";
import { analyzeCardForDate } from "../utils/creditCardUtils";
import {
  Plus,
  CreditCard as CardIcon,
  ChevronRight,
  Share2,
  Sparkles,
  Smartphone,
  Receipt,
  HelpCircle,
} from "lucide-react";

interface CardsSidebarPanelProps {
  cards: CreditCard[];
  expenses: Expense[];
  onOpenCards: () => void;
  onOpenNewExpense: () => void;
  onOpenShare: () => void;
  onOpenNFCe: () => void;
  onOpenTutorial: () => void;
  onViewNFCe?: (expense: Expense) => void;
}

export function CardsSidebarPanel({
  cards,
  expenses,
  onOpenCards,
  onOpenNewExpense,
  onOpenShare,
  onOpenNFCe,
  onOpenTutorial,
  onViewNFCe,
}: CardsSidebarPanelProps) {
  // Sort expenses by date descending
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <aside className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between space-y-6">
      <div>
        {/* Header Meus Cartões */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Meus Cartões
            </h3>
            <p className="text-[11px] text-slate-400">Ciclos de fechamento e melhor dia</p>
          </div>
          <button
            onClick={onOpenCards}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Gerenciar Cartões"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Novo</span>
          </button>
        </div>

        {/* Cards List */}
        <div className="space-y-2.5">
          {cards.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
              <p className="text-xs text-slate-400">Nenhum cartão cadastrado</p>
              <button
                onClick={onOpenCards}
                className="mt-2 text-xs font-bold text-orange-400 hover:underline cursor-pointer"
              >
                + Adicionar agora
              </button>
            </div>
          ) : (
            cards.map((card) => {
              const analysis = analyzeCardForDate(card, new Date());
              return (
                <div
                  key={card.id}
                  onClick={onOpenCards}
                  className="bg-slate-800 hover:bg-slate-750 p-3.5 rounded-xl border border-slate-700/80 flex justify-between items-center transition-all cursor-pointer group"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div
                      className="w-8 h-6 rounded-sm shrink-0 shadow-xs flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: card.color || "#f97316" }}
                    >
                      💳
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                        {card.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {card.brand.toUpperCase()} • Vence dia {card.dueDay}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-orange-400">
                      Dia {card.closingDay}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                      {analysis.daysUntilClosing === 0 ? "Fecha Hoje" : "Melhor Compra"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Gastos Recentes Section */}
        <div className="mt-7">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Gastos Recentes da Casa
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              {recentExpenses.length} mais recentes
            </span>
          </div>

          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Nenhum gasto registrado ainda.</p>
            ) : (
              recentExpenses.map((exp) => {
                const cat = CATEGORY_DETAILS[exp.category as keyof typeof CATEGORY_DETAILS];
                const hasNFCeItems = exp.items && exp.items.length > 0;

                return (
                  <div key={exp.id} className="flex justify-between items-center group">
                    <div className="flex gap-2.5 items-center min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
                        {cat?.icon || "🏠"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-200 truncate">
                            {exp.description}
                          </p>
                          {hasNFCeItems && (
                            <button
                              onClick={() => onViewNFCe?.(exp)}
                              className="px-1.5 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-[9px] font-bold transition-colors cursor-pointer"
                              title="Ver itens da NFC-e"
                            >
                              🧾 {exp.items?.length} itens
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          {cat?.label || exp.category}
                          {exp.status === "paid" ? (
                            <span className="text-emerald-400">• Paga</span>
                          ) : (
                            <span className="text-amber-400">• Pendente</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-white whitespace-nowrap pl-2">
                      {formatBRL(exp.amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-slate-800">
        <button
          id="btn-sidebar-add-expense"
          onClick={onOpenNewExpense}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar Gasto da Casa
        </button>

        <button
          id="btn-sidebar-import-nfce"
          onClick={onOpenNFCe}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-indigo-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Receipt className="w-3.5 h-3.5 text-indigo-400" />
          Importar NFC-e / Nota Fiscal
        </button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-sidebar-tutorial"
            onClick={onOpenTutorial}
            className="py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-300 hover:text-white font-semibold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            Como Usar
          </button>

          <button
            id="btn-sidebar-share-link"
            onClick={onOpenShare}
            className="py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-300 hover:text-white font-semibold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            Link Celular
          </button>
        </div>
      </div>
    </aside>
  );
}
