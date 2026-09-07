import { useState } from "react";
import { getMonthYearLabel } from "../utils/formatters";
import { ThemeMode } from "../types";
import {
  Menu,
  X,
  CreditCard as CardIcon,
  Plus,
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
  QrCode,
  BarChart3,
  Layers,
  ListOrdered,
  Home,
  CheckCircle2,
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
  currentUser?: string | null;
  onLogout?: () => void;
  activeSection?: "all" | "charts" | "compare" | "table";
  onSelectSection?: (section: "all" | "charts" | "compare" | "table") => void;
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
  activeSection = "all",
  onSelectSection,
}: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Month navigation
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

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      {/* Top Main Bar */}
      <header
        className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b ${
          isDark
            ? "bg-slate-950/95 border-slate-800 text-white"
            : "bg-white/95 border-slate-200 text-slate-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          {/* Main row */}
          <div className="flex items-center justify-between h-14 md:h-16 gap-2">
            {/* Left: Hamburger (☰) + Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                id="btn-open-sidebar"
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                }`}
                title="Abrir Menu Lateral"
                aria-label="Abrir Menu Lateral"
              >
                <Menu className="w-5 h-5 text-indigo-500" />
              </button>

              {/* Logo & Branding */}
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md shrink-0">
                  $
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-sm sm:text-base font-extrabold tracking-tight">
                      GASTOS<span className="text-indigo-500">.CASA</span>
                    </span>
                    <span
                      className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        isDark
                          ? "bg-indigo-950/60 text-indigo-300 border-indigo-800"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      <Cloud className="w-2.5 h-2.5 text-indigo-500" />
                      {isSaving ? "Salvando..." : "Nuvem"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Month Navigator (Desktop only in row 1, Mobile has it right below) */}
            <div
              className={`hidden md:flex items-center p-1 rounded-xl border text-xs font-semibold ${
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                onClick={handlePrevMonth}
                className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                    : "hover:bg-white text-slate-600 hover:text-slate-900"
                }`}
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 font-bold whitespace-nowrap text-xs">
                {getMonthYearLabel(selectedMonth)}
              </span>

              <button
                onClick={handleNextMonth}
                className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                    : "hover:bg-white text-slate-600 hover:text-slate-900"
                }`}
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Quick Action Buttons (VISÍVEIS NO CELULAR E NO COMPUTADOR) */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Scan NFC-e button */}
              <button
                id="btn-navbar-scan-nfce-top"
                onClick={onOpenNFCe}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark
                    ? "bg-indigo-950/70 hover:bg-indigo-900 border-indigo-800 text-indigo-300"
                    : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
                }`}
                title="Ler QR Code da Nota Fiscal"
              >
                <QrCode className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">NFC-e</span>
              </button>

              {/* Cards button */}
              <button
                id="btn-navbar-cards-top"
                onClick={onOpenCards}
                className={`p-2 sm:px-3 sm:py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
                title="Gerenciar Cartões de Crédito"
              >
                <CardIcon className="w-4 h-4 text-orange-500" />
                <span className="hidden sm:inline">Cartões</span>
                {cardCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-bold">
                    {cardCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle Button */}
              <button
                id="btn-toggle-theme-top"
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-850 border-slate-800 text-amber-400"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
                title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Tutorial button (Desktop only, mobile has it in sidebar) */}
              <button
                id="btn-navbar-tutorial-desktop"
                onClick={onOpenTutorial}
                className={`hidden md:flex p-2 rounded-xl border text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
                title="Tutorial e Como Usar"
              >
                <HelpCircle className="w-4 h-4 text-indigo-500" />
              </button>

              {/* Add Expense (Quick button) */}
              <button
                id="btn-navbar-new-expense"
                onClick={onOpenNewExpense}
                className="px-2.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs">Gasto</span>
              </button>

              {/* User badge (Desktop) */}
              {currentUser && (
                <div className="hidden lg:flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800">
                  <div
                    className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border ${
                      isDark
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[11px] font-mono">{currentUser}</span>
                  </div>
                  {onLogout && (
                    <button
                      id="btn-navbar-logout-desktop"
                      onClick={onLogout}
                      className={`p-2 rounded-xl border text-xs text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer ${
                        isDark ? "border-slate-800" : "border-slate-200"
                      }`}
                      title="Sair (Logout)"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sub-bar on Mobile: Centered Month Navigator + Quick Status */}
          <div className="md:hidden py-1.5 px-1 flex items-center justify-between border-t border-slate-200/20 text-xs">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
              <Cloud className="w-3 h-3 text-indigo-500" />
              <span>{isSaving ? "Salvando..." : "Nuvem Ativa"}</span>
            </div>

            <div
              className={`flex items-center p-0.5 rounded-xl border text-xs font-bold ${
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                onClick={handlePrevMonth}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                    : "hover:bg-white text-slate-600 hover:text-slate-900"
                }`}
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-bold whitespace-nowrap text-xs text-indigo-500">
                {getMonthYearLabel(selectedMonth)}
              </span>

              <button
                onClick={handleNextMonth}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                    : "hover:bg-white text-slate-600 hover:text-slate-900"
                }`}
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* LATERAL SIDEBAR (MENU LATERAL - Estilo Aplicativo de Celular) */}
      {/* ========================================================= */}
      {isSidebarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex transition-opacity"
        >
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={closeSidebar}
            title="Fechar menu"
          />

          {/* Sliding Drawer from the Left */}
          <aside
            className={`relative z-10 w-80 max-w-[85vw] h-full flex flex-col shadow-2xl border-r transition-all overflow-y-auto ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                  $
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight">
                    GASTOS<span className="text-indigo-500">.CASA</span>
                  </h2>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Menu do Aplicativo
                  </p>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="p-4 border-b border-slate-200/20 bg-slate-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold truncate max-w-[140px]">
                      {currentUser || "Administrador"}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Sincronizado na Nuvem
                    </div>
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={() => {
                      closeSidebar();
                      onLogout();
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Sair do aplicativo"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="p-3 space-y-4 flex-1">
              {/* Primary Actions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                  Ações Rápidas
                </span>

                {/* Add Expense Button */}
                <button
                  type="button"
                  onClick={() => {
                    closeSidebar();
                    onOpenNewExpense();
                  }}
                  className="w-full p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-3 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Novo Gasto</span>
                </button>

                {/* NFC-e with QR Code Scanner */}
                <button
                  type="button"
                  onClick={() => {
                    closeSidebar();
                    onOpenNFCe();
                  }}
                  className={`w-full p-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isDark
                      ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-indigo-300"
                      : "bg-indigo-50/80 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-4 h-4 text-indigo-500" />
                    <span>Ler QR Code da Nota Fiscal</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">
                    Câmera
                  </span>
                </button>

                {/* Credit Cards Manager */}
                <button
                  type="button"
                  onClick={() => {
                    closeSidebar();
                    onOpenCards();
                  }}
                  className={`w-full p-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isDark
                      ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CardIcon className="w-4 h-4 text-orange-500" />
                    <span>Cartões de Crédito</span>
                  </div>
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-bold">
                    {cardCount} cadastrados
                  </span>
                </button>
              </div>

              {/* View Sections Switcher (Visões do App) */}
              {onSelectSection && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                    Visualizações
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectSection("all");
                      closeSidebar();
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                      activeSection === "all"
                        ? "bg-indigo-600 text-white font-bold"
                        : isDark
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Visão Geral & Melhores Datas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectSection("charts");
                      closeSidebar();
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                      activeSection === "charts"
                        ? "bg-indigo-600 text-white font-bold"
                        : isDark
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Gráficos & Categorias</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectSection("compare");
                      closeSidebar();
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                      activeSection === "compare"
                        ? "bg-indigo-600 text-white font-bold"
                        : isDark
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Comparativo Mensal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectSection("table");
                      closeSidebar();
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                      activeSection === "table"
                        ? "bg-indigo-600 text-white font-bold"
                        : isDark
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ListOrdered className="w-4 h-4" />
                    <span>Tabela de Contas da Casa</span>
                  </button>
                </div>
              )}

              {/* Utility Tools */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                  Configurações & Ajuda
                </span>

                {/* Theme Mode Toggle */}
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                    <span>Aparência: {isDark ? "Modo Escuro" : "Modo Claro"}</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-500">Alternar</span>
                </button>

                {/* Tutorial / Help */}
                <button
                  type="button"
                  onClick={() => {
                    closeSidebar();
                    onOpenTutorial();
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                    isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>Tutorial & Dúvidas</span>
                </button>

                {/* Share Link on Mobile */}
                <button
                  type="button"
                  onClick={() => {
                    closeSidebar();
                    onOpenShare();
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                    isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>Abrir no Celular / WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200/20 text-center text-[10px] text-slate-400">
              GASTOS.CASA • 100% Gratuito & Seguro
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Barra Fixa Inferior no Celular) */}
      {/* ========================================================= */}
      <nav
        aria-label="Barra de navegação inferior"
        translate="no"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg px-2 py-1 flex items-center justify-around notranslate ${
          isDark
            ? "bg-slate-950/90 border-slate-800 text-slate-400"
            : "bg-white/90 border-slate-200 text-slate-600"
        }`}
      >
        {/* Início */}
        <button
          type="button"
          onClick={() => onSelectSection?.("all")}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold transition-colors cursor-pointer notranslate ${
            activeSection === "all" ? "text-indigo-500" : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="notranslate whitespace-nowrap">Início</span>
        </button>

        {/* Cartões */}
        <button
          type="button"
          onClick={onOpenCards}
          className="flex flex-col items-center py-1 px-3 text-[10px] font-bold hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer relative notranslate"
        >
          <CardIcon className="w-5 h-5 text-orange-500" />
          <span className="notranslate whitespace-nowrap">Cartões</span>
          {cardCount > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold notranslate">
              {cardCount}
            </span>
          )}
        </button>

        {/* Central Add Expense Button (Flutuante destacado) */}
        <button
          type="button"
          onClick={onOpenNewExpense}
          className="w-12 h-12 -mt-5 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 cursor-pointer hover:scale-105 active:scale-95 transition-all notranslate"
          title="Novo Gasto"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* NFC-e QR Code */}
        <button
          type="button"
          onClick={onOpenNFCe}
          className="flex flex-col items-center py-1 px-3 text-[10px] font-bold hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer notranslate"
        >
          <QrCode className="w-5 h-5 text-indigo-500" />
          <span className="notranslate whitespace-nowrap">NFC-e</span>
        </button>

        {/* Menu Lateral (3 Barrinhas ☰) */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center py-1 px-3 text-[10px] font-bold hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer notranslate"
        >
          <Menu className="w-5 h-5" />
          <span className="notranslate whitespace-nowrap">Menu</span>
        </button>
      </nav>
    </>
  );
}
