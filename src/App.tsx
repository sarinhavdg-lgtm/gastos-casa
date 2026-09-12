import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { FinanceData, Expense, CreditCard, ThemeMode } from "./types";
import { fetchFinanceData, saveFinanceData, resetFinanceData, checkServerStatus } from "./services/api";
import { Navbar } from "./components/Navbar";
import { BestDateBanner } from "./components/BestDateBanner";
import { SummaryCards } from "./components/SummaryCards";
import { InteractiveCharts } from "./components/InteractiveCharts";
import { MonthlyComparison } from "./components/MonthlyComparison";
import { ExpenseList } from "./components/ExpenseList";
import { CardsSidebarPanel } from "./components/CardsSidebarPanel";
import { ExpenseModal } from "./components/ExpenseModal";
import { CreditCardManager } from "./components/CreditCardManager";
import { ShareLinkModal } from "./components/ShareLinkModal";
import { NFCeImportModal } from "./components/NFCeImportModal";
import { NFCeDetailsModal } from "./components/NFCeDetailsModal";
import { TutorialModal } from "./components/TutorialModal";
import { LoginScreen } from "./components/LoginScreen";
import { PdfExportModal } from "./components/PdfExportModal";
import {
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Layers,
  BarChart3,
  ListOrdered,
  Receipt,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function App() {
  const [data, setData] = useState<FinanceData>({
    monthlyIncome: 0,
    cards: [],
    expenses: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(new Date());

  const isSavingRef = useRef(false);
  const currentVersionRef = useRef(data.version || 1);
  const lastUpdatedRef = useRef(data.lastUpdated || "");

  useEffect(() => {
    currentVersionRef.current = data.version || 1;
    lastUpdatedRef.current = data.lastUpdated || "";
  }, [data.version, data.lastUpdated]);

  // Theme layout: 'light' or 'dark'
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("gastos_casa_theme") || localStorage.getItem("financely_theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const [isDark, setIsDark] = useState(theme === "dark");

  useEffect(() => {
    setIsDark(theme === "dark");
    localStorage.setItem("gastos_casa_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // User Authentication
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
      const storedLocal = localStorage.getItem("gastos_casa_auth_session");
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal);
        return parsed.user || "adm";
      }
      const storedSession = sessionStorage.getItem("gastos_casa_auth_session");
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        return parsed.user || "adm";
      }
    } catch {
      // ignore
    }
    return null;
  });

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    if (confirm("Deseja realmente sair do GASTOS.CASA?")) {
      localStorage.removeItem("gastos_casa_auth_session");
      sessionStorage.removeItem("gastos_casa_auth_session");
      setCurrentUser(null);
    }
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Current selected month: defaults to current YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Navigation tab for the main analysis section
  const [activeSection, setActiveSection] = useState<"all" | "charts" | "compare" | "table">("all");

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNFCeModalOpen, setIsNFCeModalOpen] = useState(false);
  const [isNFCeDetailsOpen, setIsNFCeDetailsOpen] = useState(false);
  const [viewingNFCeExpense, setViewingNFCeExpense] = useState<Expense | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const initial = await fetchFinanceData();
        setData(initial);
        setLastSyncedTime(new Date());
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Manual force sync across devices
  const handleManualSync = useCallback(async () => {
    if (isLiveSyncing) return;
    setIsLiveSyncing(true);
    try {
      const latest = await fetchFinanceData();
      setData(latest);
      setLastSyncedTime(new Date());
    } catch (err) {
      console.warn("Manual sync error:", err);
    } finally {
      setIsLiveSyncing(false);
    }
  }, [isLiveSyncing]);

  // Real-time automatic synchronization between phones/devices
  useEffect(() => {
    let isMounted = true;

    const performSyncCheck = async () => {
      // If currently saving or already live syncing, wait for next tick
      if (isSavingRef.current) return;
      try {
        const status = await checkServerStatus();
        if (!isMounted || !status) return;

        const currentVer = currentVersionRef.current;
        const currentUpdated = lastUpdatedRef.current;

        // If the server has a newer version or newer updated timestamp, fetch immediately!
        if (status.version > currentVer || (status.lastUpdated && status.lastUpdated !== currentUpdated)) {
          setIsLiveSyncing(true);
          const latest = await fetchFinanceData();
          if (isMounted) {
            setData(latest);
            setLastSyncedTime(new Date());
          }
          setIsLiveSyncing(false);
        }
      } catch {
        // Silently ignore transient network disconnects
      }
    };

    // 1. Check server every 3.5 seconds
    const intervalId = setInterval(performSyncCheck, 3500);

    // 2. Immediately check when user unlocks phone or switches back to browser
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        performSyncCheck();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, []);

  // Persist helper
  const persistChanges = useCallback(async (updated: FinanceData) => {
    setData(updated);
    setIsSaving(true);
    isSavingRef.current = true;
    try {
      await saveFinanceData(updated);
      setLastSyncedTime(new Date());
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, []);

  // Available unique months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(selectedMonth);
    const d = new Date();
    set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    data.expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        set.add(e.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [data.expenses, selectedMonth]);

  // Handle Expenses
  const handleSaveExpense = (expenseData: Omit<Expense, "id">, id?: string) => {
    if (id) {
      // Edit
      const updatedExpenses = data.expenses.map((e) =>
        e.id === id ? { ...expenseData, id } : e
      );
      persistChanges({ ...data, expenses: updatedExpenses });
    } else {
      // Add
      const newExp: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      persistChanges({ ...data, expenses: [newExp, ...data.expenses] });
    }
    setIsExpenseModalOpen(false);
    setExpenseToEdit(null);
  };

  // Handle NFC-e imported expenses (batch)
  const handleImportNFCeExpenses = (newExpenses: Omit<Expense, "id">[]) => {
    const created: Expense[] = newExpenses.map((exp, idx) => ({
      ...exp,
      id: `exp-nfce-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    }));

    persistChanges({
      ...data,
      expenses: [...created, ...data.expenses],
    });
    setIsNFCeModalOpen(false);
  };

  const handleToggleExpenseStatus = (id: string) => {
    const updatedExpenses = data.expenses.map((e) =>
      e.id === id
        ? { ...e, status: (e.status === "paid" ? "pending" : "paid") as "paid" | "pending" }
        : e
    );
    persistChanges({ ...data, expenses: updatedExpenses });
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = data.expenses.filter((e) => e.id !== id);
    persistChanges({ ...data, expenses: updatedExpenses });
  };

  // Handle Cards
  const handleSaveCard = (cardData: Omit<CreditCard, "id">, id?: string) => {
    if (id) {
      const updatedCards = data.cards.map((c) =>
        c.id === id ? { ...cardData, id } : c
      );
      persistChanges({ ...data, cards: updatedCards });
    } else {
      const newCard: CreditCard = {
        ...cardData,
        id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      persistChanges({ ...data, cards: [...data.cards, newCard] });
    }
  };

  const handleDeleteCard = (id: string) => {
    const updatedCards = data.cards.filter((c) => c.id !== id);
    const updatedExpenses = data.expenses.map((e) =>
      e.cardId === id ? { ...e, cardId: undefined } : e
    );
    persistChanges({ ...data, cards: updatedCards, expenses: updatedExpenses });
  };

  // Handle Income
  const handleUpdateIncome = (newIncome: number) => {
    persistChanges({ ...data, monthlyIncome: newIncome });
  };

  // Reset data to empty
  const handleResetData = async () => {
    if (confirm("Deseja zerar todas as informações para começar do zero?")) {
      setIsLoading(true);
      try {
        const clean = await resetFinanceData();
        setData(clean);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleViewNFCe = (exp: Expense) => {
    setViewingNFCeExpense(exp);
    setIsNFCeDetailsOpen(true);
  };

  // If user is not authenticated, display login screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-800"}`}>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wide">
            Carregando suas finanças residenciais...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col font-sans antialiased transition-colors ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50/80 text-slate-900"}`}>
      {/* Top Navbar with Theme Toggle, Tutorial and NFC-e buttons */}
      <Navbar
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableMonths={availableMonths}
        cardCount={data.cards.length}
        onOpenNewExpense={() => {
          setExpenseToEdit(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenCards={() => setIsCardsModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenNFCe={() => setIsNFCeModalOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenPdf={() => setIsPdfModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isSaving={isSaving}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        isLiveSyncing={isLiveSyncing}
        onManualSync={handleManualSync}
        lastSyncedTime={lastSyncedTime}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8 space-y-5 sm:space-y-6 overflow-x-hidden">
        {/* 1. CRITICAL HIGHLIGHT: BEST CREDIT CARD PURCHASE DATE */}
        <BestDateBanner
          cards={data.cards}
          onOpenAddCard={() => setIsCardsModalOpen(true)}
          isDark={isDark}
        />

        {/* 2. SUMMARY CARDS: High Density Metrics */}
        <SummaryCards
          expenses={data.expenses}
          monthlyIncome={data.monthlyIncome}
          onUpdateIncome={handleUpdateIncome}
          selectedMonth={selectedMonth}
          isDark={isDark}
        />

        {/* Quick Tabs: View Mode Switcher */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className={`flex p-1 rounded-xl text-xs font-semibold ${isDark ? "bg-slate-900 border border-slate-800" : "bg-slate-200/70 border border-slate-300/60"}`}>
            <button
              onClick={() => setActiveSection("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSection === "all"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "bg-white text-slate-900 shadow-xs font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Visão Completa
            </button>
            <button
              onClick={() => setActiveSection("charts")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeSection === "charts"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "bg-white text-slate-900 shadow-xs font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              Gráficos
            </button>
            <button
              onClick={() => setActiveSection("compare")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeSection === "compare"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "bg-white text-slate-900 shadow-xs font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Comparativo
            </button>
            <button
              onClick={() => setActiveSection("table")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeSection === "table"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "bg-white text-slate-900 shadow-xs font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
              Contas da Casa
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className={`hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Tutorial das Abas
            </button>

            <button
              id="btn-quick-export-pdf"
              onClick={() => setIsPdfModalOpen(true)}
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-red-950/60 hover:bg-red-900 border-red-800 text-red-300"
                  : "bg-red-50 hover:bg-red-100 border-red-200 text-red-700 shadow-2xs"
              }`}
              title="Gerar, Baixar e Compartilhar Todos os Gastos em PDF"
            >
              <FileText className="w-3.5 h-3.5 text-red-500" />
              Relatório PDF
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className={`hidden sm:inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-emerald-950/60 hover:bg-emerald-900 border-emerald-800 text-emerald-300"
                  : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Acessar por Link no Celular
            </button>
          </div>
        </div>

        {/* 3. HIGH DENSITY 12-COLUMN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Area: Charts, Comparison and Table (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Interactive Charts */}
            {(activeSection === "all" || activeSection === "charts") && (
              <InteractiveCharts
                expenses={data.expenses}
                cards={data.cards}
                monthlyIncome={data.monthlyIncome}
                selectedMonth={selectedMonth}
                isDark={isDark}
              />
            )}

            {/* Monthly Comparison */}
            {(activeSection === "all" || activeSection === "compare") && (
              <MonthlyComparison
                expenses={data.expenses}
                currentMonth={selectedMonth}
                availableMonths={availableMonths}
                isDark={isDark}
              />
            )}

            {/* Expenses Table */}
            {(activeSection === "all" || activeSection === "table") && (
              <ExpenseList
                expenses={data.expenses}
                cards={data.cards}
                selectedMonth={selectedMonth}
                onToggleStatus={handleToggleExpenseStatus}
                onEditExpense={(exp) => {
                  setExpenseToEdit(exp);
                  setIsExpenseModalOpen(true);
                }}
                onDeleteExpense={handleDeleteExpense}
                onOpenNewExpense={() => {
                  setExpenseToEdit(null);
                  setIsExpenseModalOpen(true);
                }}
                onOpenNFCe={() => setIsNFCeModalOpen(true)}
                onViewNFCe={handleViewNFCe}
                onOpenPdfExport={() => setIsPdfModalOpen(true)}
                isDark={isDark}
              />
            )}
          </div>

          {/* Right Sidebar: High Density Dark Slate Panel (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            <CardsSidebarPanel
              cards={data.cards}
              expenses={data.expenses}
              onOpenCards={() => setIsCardsModalOpen(true)}
              onOpenNewExpense={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              onOpenShare={() => setIsShareModalOpen(true)}
              onOpenNFCe={() => setIsNFCeModalOpen(true)}
              onOpenTutorial={() => setIsTutorialOpen(true)}
              onOpenPdf={() => setIsPdfModalOpen(true)}
              onViewNFCe={handleViewNFCe}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className={`pt-8 pb-4 border-t text-xs flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>
              GASTOS.CASA • Gestão Residencial e Cartões de Crédito salvos e sincronizados via Link.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="hover:underline flex items-center gap-1 cursor-pointer font-medium text-indigo-400"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Tutorial
            </button>
            <span>•</span>
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors text-xs font-semibold"
              title="Zerar dados e recomeçar do zero"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Zerar Dados
            </button>
          </div>
        </footer>
      </main>

      {/* MODALS */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        cards={data.cards}
        expenseToEdit={expenseToEdit}
      />

      <CreditCardManager
        cards={data.cards}
        expenses={data.expenses}
        onSaveCard={handleSaveCard}
        onDeleteCard={handleDeleteCard}
        isOpen={isCardsModalOpen}
        onClose={() => setIsCardsModalOpen(false)}
        isDark={isDark}
      />

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={data}
        onImportData={persistChanges}
      />

      <NFCeImportModal
        isOpen={isNFCeModalOpen}
        onClose={() => setIsNFCeModalOpen(false)}
        cards={data.cards}
        onSaveExpenses={handleImportNFCeExpenses}
        isDark={isDark}
      />

      <NFCeDetailsModal
        isOpen={isNFCeDetailsOpen}
        onClose={() => {
          setIsNFCeDetailsOpen(false);
          setViewingNFCeExpense(null);
        }}
        expense={viewingNFCeExpense}
        isDark={isDark}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        isDark={isDark}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        expenses={data.expenses}
        cards={data.cards}
        selectedMonth={selectedMonth}
        isDark={isDark}
      />
    </div>
  );
}
