import { useState, type FormEvent } from "react";
import { CreditCard, Expense } from "../types";
import { formatBRL } from "../utils/formatters";
import { analyzeCardForDate } from "../utils/creditCardUtils";
import {
  CreditCard as CardIcon,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  Check,
  Sparkles,
  Info,
  Layers,
} from "lucide-react";

interface CreditCardManagerProps {
  cards: CreditCard[];
  expenses: Expense[];
  onSaveCard: (card: Omit<CreditCard, "id">, id?: string) => void;
  onDeleteCard: (cardId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

const PRESET_COLORS = [
  "#820ad1", // Nubank purple
  "#ff7a00", // Inter orange
  "#003399", // Itaú blue
  "#cc0000", // Bradesco / Santander red
  "#111827", // Black / Carbon
  "#059669", // Emerald green
  "#2563eb", // Royal blue
  "#7c3aed", // Deep violet
];

export function CreditCardManager({
  cards,
  expenses,
  onSaveCard,
  onDeleteCard,
  isOpen,
  onClose,
  isDark = false,
}: CreditCardManagerProps) {
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Mastercard");
  const [closingDay, setClosingDay] = useState(15);
  const [dueDay, setDueDay] = useState(22);
  const [limit, setLimit] = useState("5000");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleOpenNew = () => {
    setEditingCard(null);
    setName("");
    setBrand("Mastercard");
    setClosingDay(15);
    setDueDay(22);
    setLimit("5000");
    setColor(PRESET_COLORS[0]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (card: CreditCard) => {
    setEditingCard(card);
    setName(card.name);
    setBrand(card.brand);
    setClosingDay(card.closingDay);
    setDueDay(card.dueDay);
    setLimit(card.limit ? card.limit.toString() : "0");
    setColor(card.color || PRESET_COLORS[0]);
    setIsFormOpen(true);
  };

  const handleQuickPreset = (presetName: string, presetBrand: string, presetColor: string) => {
    setName(presetName);
    setBrand(presetBrand);
    setColor(presetColor);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor, digite o nome do cartão de crédito.");
      return;
    }

    const cDay = Number(closingDay);
    const dDay = Number(dueDay);

    if (isNaN(cDay) || cDay < 1 || cDay > 31) {
      alert("O dia de fechamento (melhor data de compra) deve ser entre 1 e 31.");
      return;
    }

    if (isNaN(dDay) || dDay < 1 || dDay > 31) {
      alert("O dia de vencimento da fatura deve ser entre 1 e 31.");
      return;
    }

    const numLimit = parseFloat(limit.replace(",", "."));
    onSaveCard(
      {
        name: name.trim(),
        brand,
        closingDay: cDay,
        dueDay: dDay,
        limit: isNaN(numLimit) ? 0 : numLimit,
        color,
      },
      editingCard ? editingCard.id : undefined
    );
    setIsFormOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="credit-card-manager-modal"
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <CardIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Cartões de Crédito
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                  Totalmente Editável
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Altere nomes, configure o dia de fechamento (melhor data de compra) e o vencimento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!isFormOpen ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Cartões Cadastrados ({cards.length})
                </span>
                <button
                  id="btn-add-new-card-form"
                  onClick={handleOpenNew}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Cartão
                </button>
              </div>

              {cards.length === 0 ? (
                <div
                  className={`text-center py-12 rounded-2xl border-2 border-dashed p-6 ${
                    isDark
                      ? "bg-slate-950/50 border-slate-800 text-slate-300"
                      : "bg-slate-50 border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                    <CardIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold mb-1">Nenhum cartão cadastrado ainda</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                    Você pode adicionar seus próprios cartões do zero, definir o nome personalizado,
                    o dia de fechamento da fatura (melhor data de compra) e o dia do vencimento!
                  </p>
                  <button
                    onClick={handleOpenNew}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Meu Primeiro Cartão
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cards.map((card) => {
                    const analysis = analyzeCardForDate(card);
                    const cardExpenses = expenses.filter((e) => e.cardId === card.id);
                    const totalCardSpent = cardExpenses.reduce((acc, curr) => acc + curr.amount, 0);

                    return (
                      <div
                        key={card.id}
                        className={`rounded-2xl border overflow-hidden shadow-xs transition-all flex flex-col justify-between ${
                          isDark
                            ? "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {/* Visual Card Header */}
                        <div
                          className="p-4 text-white relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${card.color || "#4f46e5"}, #0f172a)`,
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-white/80 font-bold block">
                                {card.brand}
                              </span>
                              <h3 className="text-base font-bold text-white tracking-wide">
                                {card.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(card)}
                                className="px-2 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                title="Editar Nome, Fechamento e Vencimento"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Excluir o cartão "${card.name}"?`)) {
                                    onDeleteCard(card.id);
                                  }
                                }}
                                className="p-1 rounded-lg bg-rose-500/30 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                                title="Excluir Cartão"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-between items-baseline text-xs">
                            <div>
                              <span className="text-white/70 text-[10px] block">Limite Cadastrado</span>
                              <span className="font-semibold text-white">
                                {card.limit ? formatBRL(card.limit) : "Sem limite definido"}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-white/70 text-[10px] block">Prazo Hoje</span>
                              <span className="font-bold text-emerald-300">
                                {analysis.daysUntilDueIfBoughtToday} dias
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Dates Info */}
                        <div
                          className={`p-3.5 border-t text-xs space-y-2 ${
                            isDark
                              ? "bg-slate-900 border-slate-800 text-slate-300"
                              : "bg-slate-50 border-slate-100 text-slate-700"
                          }`}
                        >
                          <div className="flex justify-between items-center bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                            <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                              <Sparkles className="w-3.5 h-3.5" />
                              Melhor Dia de Compra:
                            </span>
                            <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                              Todo dia {card.closingDay}
                            </span>
                          </div>

                          <div className="flex justify-between items-center px-1">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3.5 h-3.5 text-amber-500" />
                              Vencimento da Fatura:
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Todo dia {card.dueDay}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex justify-between items-center text-[11px] px-1">
                            <span className="text-slate-500">Despesas vinculadas:</span>
                            <span className="font-semibold">
                              {formatBRL(totalCardSpent)} ({cardExpenses.length})
                            </span>
                          </div>

                          {/* Quick Edit button */}
                          <button
                            onClick={() => handleOpenEdit(card)}
                            className="w-full mt-1 py-1.5 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            Editar Nome e Datas
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Add / Edit Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-indigo-500" />
                    {editingCard ? `Editar Cartão "${editingCard.name}"` : "Cadastrar Novo Cartão de Crédito"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina o nome do cartão e as datas exatas de fechamento e vencimento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer font-medium"
                >
                  Voltar à Lista
                </button>
              </div>

              {/* Quick suggestions if new */}
              {!editingCard && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Sugestões Rápidas de Bancos:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: "Nubank Roxinho", brand: "Mastercard", color: "#820ad1" },
                      { name: "Banco Inter", brand: "Mastercard", color: "#ff7a00" },
                      { name: "Itaú Click", brand: "Visa", color: "#003399" },
                      { name: "Santander SX", brand: "Visa", color: "#cc0000" },
                      { name: "C6 Bank Carbon", brand: "Mastercard", color: "#111827" },
                      { name: "XP Visa Infinite", brand: "Visa", color: "#111827" },
                      { name: "Bradesco Neo", brand: "Visa", color: "#cc0000" },
                      { name: "Caixa Elo", brand: "Elo", color: "#2563eb" },
                    ].map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleQuickPreset(p.name, p.brand, p.color)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Cartão de Crédito *
                </label>
                <input
                  id="card-name-input"
                  type="text"
                  required
                  placeholder="Ex: Nubank, Cartão Mercado, Visa Black, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? "bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Você pode editar e renomear este cartão quando quiser.
                </p>
              </div>

              {/* Critical Dates Section */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark
                    ? "bg-indigo-950/30 border-indigo-800/60"
                    : "bg-indigo-50/70 border-indigo-200"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Datas de Fechamento e Vencimento da Fatura:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Closing day */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Melhor Data de Compra (Dia do Fechamento) *
                    </label>
                    <div className="relative">
                      <input
                        id="card-closing-day-input"
                        type="number"
                        min="1"
                        max="31"
                        required
                        value={closingDay}
                        onChange={(e) => setClosingDay(Number(e.target.value))}
                        className={`w-full px-3.5 py-2 text-sm font-extrabold rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isDark
                            ? "bg-slate-900 border-indigo-700 text-emerald-400"
                            : "bg-white border-indigo-300 text-emerald-900"
                        }`}
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">
                        dia do mês
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                      ✓ A melhor data para comprar é no fechamento ou após!
                    </span>
                  </div>

                  {/* Due day */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Dia de Vencimento do Boleto *
                    </label>
                    <div className="relative">
                      <input
                        id="card-due-day-input"
                        type="number"
                        min="1"
                        max="31"
                        required
                        value={dueDay}
                        onChange={(e) => setDueDay(Number(e.target.value))}
                        className={`w-full px-3.5 py-2 text-sm font-extrabold rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isDark
                            ? "bg-slate-900 border-indigo-700 text-amber-400"
                            : "bg-white border-indigo-300 text-amber-900"
                        }`}
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">
                        dia do mês
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Data limite para pagar a fatura sem cobrança de juros.
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand and Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bandeira
                  </label>
                  <select
                    id="card-brand-select"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Mastercard">Mastercard</option>
                    <option value="Visa">Visa</option>
                    <option value="Elo">Elo</option>
                    <option value="American Express">American Express</option>
                    <option value="Hipercard">Hipercard</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Limite do Cartão (R$) - Opcional
                  </label>
                  <input
                    id="card-limit-input"
                    type="number"
                    step="50"
                    placeholder="Ex: 5000"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
                        : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>

              {/* Color selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cor de Destaque do Cartão
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        color === c ? "scale-110 ring-2 ring-offset-2 ring-indigo-500" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-card-submit"
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingCard ? "Salvar Alterações do Cartão" : "Cadastrar Cartão"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
