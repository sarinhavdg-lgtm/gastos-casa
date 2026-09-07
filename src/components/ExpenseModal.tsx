import { useState, useEffect, type FormEvent } from "react";
import { Expense, ExpenseCategory, PaymentMethod, CreditCard } from "../types";
import { CATEGORY_DETAILS, PAYMENT_METHOD_LABELS, formatDateBR } from "../utils/formatters";
import { getInvoiceMonthForExpense } from "../utils/creditCardUtils";
import { X, Check, CreditCard as CardIcon, Sparkles, Calendar, DollarSign } from "lucide-react";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, "id">, id?: string) => void;
  cards: CreditCard[];
  expenseToEdit?: Expense | null;
}

const QUICK_SUGGESTIONS = [
  { label: "Supermercado", category: "alimentacao" as ExpenseCategory },
  { label: "Conta de Luz (Energia)", category: "energia" as ExpenseCategory },
  { label: "Conta de Água", category: "agua" as ExpenseCategory },
  { label: "Diarista / Faxina", category: "empregada" as ExpenseCategory },
  { label: "Condomínio", category: "moradia" as ExpenseCategory },
  { label: "Internet Fibra", category: "internet" as ExpenseCategory },
  { label: "Gás de Cozinha", category: "gas" as ExpenseCategory },
  { label: "Farmácia / Remédios", category: "saude" as ExpenseCategory },
];

export function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  cards,
  expenseToEdit,
}: ExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("alimentacao");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [cardId, setCardId] = useState<string>("");
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount.toString());
      setDate(expenseToEdit.date);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setCardId(expenseToEdit.cardId || (cards.length > 0 ? cards[0].id : ""));
      setStatus(expenseToEdit.status);
      setNotes(expenseToEdit.notes || "");
    } else {
      setDescription("");
      setCategory("alimentacao");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("pix");
      setCardId(cards.length > 0 ? cards[0].id : "");
      setStatus("paid");
      setNotes("");
    }
  }, [expenseToEdit, isOpen, cards]);

  if (!isOpen) return null;

  const selectedCard = cards.find((c) => c.id === cardId);

  // Calculate invoice month if paid by credit card
  let creditCardInvoiceInfo = "";
  if (paymentMethod === "credit" && selectedCard && date) {
    const invMonth = getInvoiceMonthForExpense(date, selectedCard);
    const day = Number(date.split("-")[2]);
    const closed = day >= selectedCard.closingDay;
    creditCardInvoiceInfo = closed
      ? `✅ Fatura de ${invMonth}: Como o fechamento é dia ${selectedCard.closingDay}, esta compra já caiu na fatura do próximo mês! Ganho de prazo máximo!`
      : `⚠️ Fatura de ${invMonth}: Fecha em breve (dia ${selectedCard.closingDay}). Esta compra entrará na fatura atual.`;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(",", "."));
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert("Por favor, preencha uma descrição e um valor válido.");
      return;
    }

    onSave(
      {
        description: description.trim(),
        category,
        amount: numAmount,
        date,
        paymentMethod,
        cardId: paymentMethod === "credit" ? cardId : undefined,
        status,
        notes: notes.trim() || undefined,
      },
      expenseToEdit ? expenseToEdit.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="expense-modal-dialog"
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {expenseToEdit ? "Editar Despesa" : "Registrar Nova Despesa"}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Controle de contas da casa: alimentação, energia, água, diarista e mais
            </p>
          </div>
          <button
            id="btn-close-expense-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-slate-800 text-sm">
          {/* Quick Suggestions */}
          {!expenseToEdit && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Preenchimento Rápido (Contas Comuns):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDescription(sug.label);
                      setCategory(sug.category);
                    }}
                    className="px-2.5 py-1 text-xs rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {sug.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Descrição da Despesa *
            </label>
            <input
              id="expense-desc-input"
              type="text"
              required
              placeholder="Ex: Supermercado Assaí, Conta de Luz Enel, Diária Faxina"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Amount & Date in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium text-sm">
                  R$
                </span>
                <input
                  id="expense-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Data do Gasto / Vencimento *
              </label>
              <div className="relative">
                <input
                  id="expense-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Categoria da Casa *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(CATEGORY_DETAILS).map(([catKey, details]) => {
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey as ExpenseCategory)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: details.color }}
                    />
                    <span className="truncate">{details.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-medium transition-all cursor-pointer truncate ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {PAYMENT_METHOD_LABELS[method]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credit Card Specific Picker if paymentMethod === 'credit' */}
          {paymentMethod === "credit" && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <label className="block font-medium text-slate-800 text-xs flex items-center justify-between">
                <span>Selecione o Cartão de Crédito Utilizado:</span>
                {cards.length === 0 && (
                  <span className="text-rose-600">Nenhum cartão cadastrado</span>
                )}
              </label>

              {cards.length > 0 ? (
                <select
                  id="expense-card-select"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Fecha dia {c.closingDay} • Vence dia {c.dueDay})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-slate-500">
                  Cadastre um cartão no painel inicial para rastrear faturas e melhor data de compra automaticamente.
                </p>
              )}

              {creditCardInvoiceInfo && (
                <p className="text-xs bg-white rounded-lg p-2.5 border border-slate-200 text-slate-700">
                  {creditCardInvoiceInfo}
                </p>
              )}
            </div>
          )}

          {/* Status: Paid vs Pending */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Status do Pagamento
            </label>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="expenseStatus"
                  checked={status === "paid"}
                  onChange={() => setStatus("paid")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-emerald-800">
                  🟢 Conta já Paga
                </span>
              </label>

              <label className="flex-1 flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="expenseStatus"
                  checked={status === "pending"}
                  onChange={() => setStatus("pending")}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-amber-800">
                  🟡 Pendente / A Pagar
                </span>
              </label>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Observações (Opcional)
            </label>
            <input
              id="expense-notes-input"
              type="text"
              placeholder="Ex: Compra parcelada em 3x, referente ao mês de Abril"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-expense"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {expenseToEdit ? "Salvar Alterações" : "Registrar Despesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
