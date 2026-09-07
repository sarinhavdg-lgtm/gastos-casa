import { Expense } from "../types";
import { formatBRL } from "../utils/formatters";
import { Receipt, X, ShoppingBag, Store, Calendar, CreditCard, Hash } from "lucide-react";

interface NFCeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  isDark?: boolean;
}

export function NFCeDetailsModal({
  isOpen,
  onClose,
  expense,
  isDark = false,
}: NFCeDetailsModalProps) {
  if (!isOpen || !expense || !expense.items) return null;

  const bgModal = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden my-6 transition-all ${bgModal}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Cupom Fiscal / NFC-e Detalhada
              </h2>
              <p className="text-xs text-slate-400">
                {expense.merchantName || expense.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Metadata Card */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1">
                <Store className="w-3.5 h-3.5" /> Estabelecimento
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {expense.merchantName || "Supermercado"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Data da Compra
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {expense.date}
              </span>
            </div>
            {expense.nfceKey && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                <span className="text-slate-400 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> Chave
                </span>
                <span className="font-mono text-[10px] text-slate-500 max-w-[240px] truncate" title={expense.nfceKey}>
                  {expense.nfceKey}
                </span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Itens do Cupom ({expense.items.length})
            </span>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-2 py-2 text-center">Qtd</th>
                    <th className="px-2 py-2 text-right">Unitário</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {expense.items.map((it, idx) => (
                    <tr key={it.id || idx}>
                      <td className="px-3 py-2 font-medium truncate max-w-[180px]" title={it.name}>
                        {it.name}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400">
                        {it.quantity} {it.unit || "UN"}
                      </td>
                      <td className="px-2 py-2 text-right text-slate-400">
                        {formatBRL(it.unitPrice)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">
                        {formatBRL(it.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex justify-between items-center">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Total Pago no Cupom
            </span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {formatBRL(expense.amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
