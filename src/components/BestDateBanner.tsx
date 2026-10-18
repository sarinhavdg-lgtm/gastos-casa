import { useState } from "react";
import { CreditCard as CreditCardType, CardRecommendation } from "../types";
import { getCardsRecommendations } from "../utils/creditCardUtils";
import { formatDateBR, formatBRL } from "../utils/formatters";
import {
  CreditCard,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calculator,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface BestDateBannerProps {
  cards: CreditCardType[];
  onOpenAddCard: () => void;
  isDark?: boolean;
}

export function BestDateBanner({ cards, onOpenAddCard, isDark = false }: BestDateBannerProps) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedAmount, setSimulatedAmount] = useState<number>(250);
  const [showAllCards, setShowAllCards] = useState(false);

  const today = new Date();
  const todayFormatted = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const recommendations = getCardsRecommendations(cards, today);
  const bestCardRec: CardRecommendation | undefined = recommendations.find((r) => r.isBestToday) || recommendations[0];

  if (cards.length === 0) {
    return (
      <div
        id="best-date-empty-banner"
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-6 md:p-8 transition-colors ${
          isDark
            ? "bg-slate-900/70 border-amber-500/40 text-slate-100"
            : "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border-amber-300 text-gray-900"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-500/20 text-amber-800"}`}>
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 border ${
                isDark ? "bg-amber-950/60 text-amber-300 border-amber-800" : "bg-amber-100 text-amber-800 border-amber-300"
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                Alerta Inteligente de Compras
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Cadastre seus Cartões de Crédito
              </h2>
              <p className={`text-sm md:text-base mt-1 max-w-xl ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                O <strong>GASTOS.CASA</strong> calculará automaticamente a <strong>melhor data de compra</strong> de cada cartão para você saber
                sempre qual usar hoje e ganhar até <strong>40 dias para pagar</strong> sem juros!
              </p>
            </div>
          </div>
          <button
            id="btn-add-first-card"
            onClick={onOpenAddCard}
            className="w-full md:w-auto px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4" />
            Adicionar Primeiro Cartão
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      id="best-date-main-banner"
      aria-label="Alerta de Melhor Data de Compra"
      className="relative rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-xl overflow-hidden border-b-4 border-orange-700 p-5 md:p-6"
    >
      {/* Top Header Tag */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/20">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="text-xs font-black tracking-wider uppercase text-white/95">
            Destaque • Melhor Dia para Compra
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-orange-100 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span className="capitalize">{todayFormatted}</span>
        </div>
      </div>

      {/* Main Spotlight Section */}
      <div className="relative z-10 pt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Column: Big Recommendation */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="bg-white/20 p-3 rounded-full shrink-0 shadow-inner">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" /> Recomendado Hoje
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                {bestCardRec.card.name} • {bestCardRec.daysUntilDueIfBoughtToday} Dias de Prazo
              </h2>
              <p className="text-orange-50 font-medium text-xs md:text-sm mt-0.5 opacity-95">
                {bestCardRec.tip}
              </p>
            </div>
          </div>

          {/* Quick Metrics of the Best Card */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            <div className="bg-white/15 border border-white/25 rounded-xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-100 block">
                Prazo p/ Pagar
              </span>
              <span className="text-xl md:text-2xl font-black text-white">
                {bestCardRec.daysUntilDueIfBoughtToday} dias
              </span>
              <span className="text-[10px] text-orange-100 block mt-0.5">sem juros</span>
            </div>

            <div className="bg-white/15 border border-white/25 rounded-xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-100 block">
                Fechamento
              </span>
              <span className="text-xl md:text-2xl font-black text-white">
                Dia {bestCardRec.card.closingDay}
              </span>
              <span className="text-[10px] text-orange-100 block mt-0.5">
                {bestCardRec.daysUntilClosing === 0 ? "Fecha hoje!" : `em ${bestCardRec.daysUntilClosing} dias`}
              </span>
            </div>

            <div className="bg-white/15 border border-white/25 rounded-xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-100 block">
                Vencimento
              </span>
              <span className="text-xl md:text-2xl font-black text-white">
                {formatDateBR(bestCardRec.effectiveDueDate)}
              </span>
              <span className="text-[10px] text-orange-100 block mt-0.5">data do boleto</span>
            </div>
          </div>
        </div>

        {/* Right Column: Card Preview & Actions */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          <div
            className="p-4 rounded-xl relative overflow-hidden shadow-lg border border-white/30 bg-slate-900/80 backdrop-blur-md"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-orange-300">
                  Melhor Cartão
                </span>
                <h4 className="text-base font-bold text-white tracking-wide mt-0.5">
                  {bestCardRec.card.name}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-extrabold text-white uppercase tracking-wider">
                {bestCardRec.card.brand}
              </span>
            </div>

            <div className="flex justify-between items-end text-xs pt-2 border-t border-white/10">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Limite Total</span>
                <span className="font-bold text-white">{formatBRL(bestCardRec.card.limit)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Status</span>
                <span className="font-bold text-emerald-400">
                  {bestCardRec.daysUntilClosing === 0 ? "Fechando Hoje" : `Fecha em ${bestCardRec.daysUntilClosing}d`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              id="btn-toggle-simulator"
              onClick={() => setShowSimulator(!showSimulator)}
              className="flex-1 px-3 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-xs shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              {showSimulator ? "Fechar Simulador" : "Simular Compra"}
            </button>
            <button
              id="btn-toggle-cards-comparison"
              onClick={() => setShowAllCards(!showAllCards)}
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {showAllCards ? "Recolher" : `Ver Todos (${cards.length})`}
              {showAllCards ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Section (Collapsible) */}
      {showSimulator && (
        <div
          id="purchase-simulator-panel"
          className="mt-6 pt-5 border-t border-white/10 bg-white/5 rounded-xl p-4 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              Simulador de Compra: Qual cartão escolher se eu gastar agora?
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-full sm:w-64">
              <label className="text-[11px] text-slate-300 block mb-1">
                Valor estimado da compra:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">R$</span>
                <input
                  id="simulator-amount-input"
                  type="number"
                  min="1"
                  step="10"
                  value={simulatedAmount || ""}
                  onChange={(e) => setSimulatedAmount(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <div className="text-xs text-slate-300 flex-1">
              Compare as datas abaixo: o cartão marcado em verde lhe dá o maior prazo para pagar sua compra de{" "}
              <strong className="text-emerald-300">{formatBRL(simulatedAmount)}</strong>.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.card.id}
                className={`p-3 rounded-lg border text-xs ${
                  rec.isBestToday
                    ? "bg-emerald-950/60 border-emerald-500/50 text-white"
                    : "bg-slate-900/60 border-white/10 text-slate-300"
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: rec.card.color }}
                    />
                    {rec.card.name}
                  </span>
                  {rec.isBestToday && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                      VENCEDOR
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-slate-400 my-1">
                  <span>Vencimento da compra:</span>
                  <strong className="text-white">{formatDateBR(rec.effectiveDueDate)}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tempo até pagar:</span>
                  <strong className={rec.isBestToday ? "text-emerald-400" : "text-slate-200"}>
                    {rec.daysUntilDueIfBoughtToday} dias
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison List of All Cards */}
      {showAllCards && (
        <div
          id="all-cards-comparison-table"
          className="mt-6 pt-5 border-t border-white/10 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              Comparativo de Todos os Cartões Cadastrados
            </h3>
            <span className="text-xs text-slate-400">
              Ordenados pelo melhor prazo de pagamento hoje
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, index) => (
              <div
                key={rec.card.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
                  rec.isBestToday
                    ? "bg-emerald-900/30 border-emerald-500/40"
                    : rec.statusType === "warning"
                    ? "bg-amber-950/20 border-amber-500/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: rec.card.color }}
                      />
                      <span className="font-bold text-white text-sm">
                        {index + 1}º - {rec.card.name}
                      </span>
                    </div>

                    {rec.isBestToday ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                        ⭐ MELHOR HOJE
                      </span>
                    ) : rec.statusType === "warning" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Fatura Próxima
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {rec.daysUntilClosing}d p/ fechar
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mb-3">{rec.tip}</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs text-slate-300">
                  <span>
                    Fecha todo dia <strong>{rec.card.closingDay}</strong> • Vence dia{" "}
                    <strong>{rec.card.dueDay}</strong>
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {rec.daysUntilDueIfBoughtToday} dias de prazo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
