import { getMonthYearLabel } from "../utils/formatters";
import { ThemeMode } from "../types";
import {
  CreditCard as CardIcon,
  Plus,
  Share2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Sun,
  Moon,
  Receipt,
  HelpCircle,
  LogOut,
  User,
  Smartphone,
} from "lucide-react";

interface NavbarProps {
  selectedMonth: string; // YYYY-MM
  onMonthChange: (newMonth: string) => void;
  availableMonths: string[];
  cardCount: number;
  onOpenNewExpense: () => void;
  onOpenCards: () => void;
  onOpenShare: () => void;
  onOpenNFCe: () => void;
  onOpenTutorial: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  isSaving: boolean;
  currentUser?: string;
  onLogout?: () => void;
}

export function Navbar({
  selectedMonth,
  onMonthChange,
  availableMonths,
  cardCount,
  onOpenNewExpense,
  onOpenCards,
  onOpenShare,
  onOpenNFCe,
  onOpenTutorial,
  theme,
  onToggleTheme,
  isSaving,
  currentUser,
  onLogout,
}: NavbarProps) {
  // Navigation for months
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const newYm = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange(newYm);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const nextDate = new Date(year, month, 1);
    const newYm = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange(newYm);
  };

  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b ${
        isDark
          ? "bg-slate-950/95 border-slate-800 text-white"
          : "bg-white/95 border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
              $
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight">
                  GASTOS<span className="text-indigo-500">.CASA</span>
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isDark
                      ? "bg-indigo-950/60 text-indigo-300 border-indigo-800"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }`}
                >
                  <Cloud className="w-3 h-3 text-indigo-500" />
                  {isSaving ? "Salvando..." : "Nuvem Ativa"}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block truncate">
                Gestão Residencial & Cartões
              </span>
            </div>
          </div>

          {/* Month Navigator */}
          <div
            className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
              isDark
                ? "bg-slate-900 border-slate-800"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                  : "hover:bg-white text-slate-600 hover:text-slate-900"
              }`}
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 sm:px-3 font-bold whitespace-nowrap">
              {getMonthYearLabel(selectedMonth)}
            </span>

            <button
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                  : "hover:bg-white text-slate-600 hover:text-slate-900"
              }`}
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              id="btn-toggle-theme"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-850 border-slate-850 text-amber-400 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              }`}
              title={isDark ? "Mudar para Layout Claro" : "Mudar para Layout Escuro"}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-[11px] font-bold text-amber-300">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden xl:inline text-[11px] font-bold">Modo Escuro</span>
                </>
              )}
            </button>

            {/* Tutorial / Help button */}
            <button
              id="btn-navbar-tutorial"
              onClick={onOpenTutorial}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              }`}
              title="Tutorial e Como Usar Cada Aba"
            >
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span className="hidden lg:inline">Como Usar</span>
            </button>

            {/* Abrir no Celular / WhatsApp */}
            <button
              id="btn-navbar-mobile"
              onClick={onOpenShare}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? "bg-emerald-950/70 hover:bg-emerald-900 border-emerald-800 text-emerald-300"
                  : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
              }`}
              title="Abrir no Celular / Enviar para o WhatsApp"
            >
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span className="hidden md:inline font-bold">Abrir no Celular</span>
            </button>

            {/* Import NFC-e button */}
            <button
              id="btn-navbar-nfce"
              onClick={onOpenNFCe}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? "bg-indigo-950/70 hover:bg-indigo-900 border-indigo-800 text-indigo-300"
                  : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
              }`}
              title="Importar NFC-e / Nota Fiscal"
            >
              <Receipt className="w-4 h-4 text-indigo-500" />
              <span className="hidden md:inline font-bold">Importar NFC-e</span>
            </button>

            {/* Credit cards button */}
            <button
              id="btn-navbar-cards"
              onClick={onOpenCards}
              className={`p-2 sm:px-3 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              }`}
              title="Gerenciar Cartões de Crédito"
            >
              <CardIcon className="w-4 h-4 text-orange-500" />
              <span className="hidden lg:inline">Cartões</span>
              <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-bold">
                {cardCount}
              </span>
            </button>

            {/* Add expense button */}
            <button
              id="btn-navbar-new-expense"
              onClick={onOpenNewExpense}
              className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Gasto</span>
            </button>

            {/* Current user badge & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800">
                <div
                  className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border ${
                    isDark
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                  title={`Usuário ativo: ${currentUser}`}
                >
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline text-[11px] font-mono">{currentUser}</span>
                </div>
                {onLogout && (
                  <button
                    id="btn-navbar-logout"
                    onClick={onLogout}
                    className={`p-2 rounded-xl border text-xs text-rose-500 hover:bg-rose-500/10 hover:border-rose-300 transition-colors cursor-pointer ${
                      isDark ? "border-slate-800" : "border-slate-200"
                    }`}
                    title="Sair do sistema (Logout)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
