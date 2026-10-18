import { useState, useMemo, type ChangeEvent, type FormEvent } from "react";
import { Expense, ExpenseCategory, PaymentMethod, CreditCard, NFCeReceipt, NFCeItem } from "../types";
import { formatBRL, CATEGORY_DETAILS, PAYMENT_METHOD_LABELS } from "../utils/formatters";
import {
  parseAccessKey,
  extractKeyFromUrl,
  parseNFCeXML,
  resolveNFCe,
  SAMPLE_NFCE_RECEIPTS,
} from "../utils/nfceUtils";
import { QRScanner } from "./QRScanner";
import {
  QrCode,
  Camera,
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ShoppingCart,
  Receipt,
  Search,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

interface NFCeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  onSaveExpenses: (expenses: Omit<Expense, "id">[]) => void;
  isDark?: boolean;
}

export function NFCeImportModal({
  isOpen,
  onClose,
  cards,
  onSaveExpenses,
  isDark = false,
}: NFCeImportModalProps) {
  const [activeInputTab, setActiveInputTab] = useState<"qr" | "key" | "xml" | "quick">("qr");
  const [accessKeyInput, setAccessKeyInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Extracted Receipt State
  const [receipt, setReceipt] = useState<NFCeReceipt | null>(null);

  // Form selections for saving
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>("alimentacao");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("credit");
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || "");
  const [saveMode, setSaveMode] = useState<"single" | "multiple">("single");

  // Key validation preview
  const keyAnalysis = useMemo(() => {
    const raw = extractKeyFromUrl(accessKeyInput) || accessKeyInput.replace(/\D/g, "");
    if (!raw) return null;
    return parseAccessKey(raw);
  }, [accessKeyInput]);

  if (!isOpen) return null;

  // Handle Scan QR Code directly from camera
  const handleScanQRCode = async (decodedText: string) => {
    setErrorMessage("");
    setIsLoading(true);
    setAccessKeyInput(decodedText);
    try {
      const resolved = await resolveNFCe(decodedText);
      setReceipt(resolved);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Não foi possível carregar a nota fiscal pelo QR Code escaneado."
      );
      setActiveInputTab("key");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Download from Access Key / URL
  const handleDownloadNFCe = async () => {
    const target = accessKeyInput.trim() || urlInput.trim();
    if (!target) {
      setErrorMessage("Por favor, informe a Chave de Acesso de 44 dígitos ou cole o link do QR Code da NFC-e.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const resolved = await resolveNFCe(target);
      setReceipt(resolved);
    } catch (err: any) {
      setErrorMessage(err.message || "Não foi possível baixar os dados da NFC-e. Verifique a chave digitada.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle XML File Upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseNFCeXML(content);
      if (parsed && parsed.items.length > 0) {
        setReceipt(parsed);
      } else {
        setErrorMessage("O arquivo XML selecionado não pôde ser lido como uma NFC-e/NF-e válida.");
      }
    };
    reader.onerror = () => {
      setErrorMessage("Erro ao ler o arquivo XML.");
    };
    reader.readAsText(file);
  };

  // Quick Demo Loader
  const handleLoadSample = (sampleKey: "supermercado" | "hortifruti" | "farmacia") => {
    const sample = SAMPLE_NFCE_RECEIPTS[sampleKey];
    if (sample) {
      setReceipt(sample);
      setAccessKeyInput(sample.accessKey);
      if (sampleKey === "farmacia") setSelectedCategory("saude");
      else setSelectedCategory("alimentacao");
    }
  };

  // Remove single item from extracted list
  const handleRemoveItem = (index: number) => {
    if (!receipt) return;
    const newItems = [...receipt.items];
    newItems.splice(index, 1);
    const newTotal = newItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    setReceipt({
      ...receipt,
      items: newItems,
      totalAmount: Math.round(newTotal * 100) / 100,
    });
  };

  // Confirm and Save into app expenses
  const handleConfirmImport = () => {
    if (!receipt || receipt.items.length === 0) return;

    if (saveMode === "single") {
      // 1. Single consolidated expense with full itemized breakdown attached
      const singleExpense: Omit<Expense, "id"> = {
        description: `${receipt.issuerName} (${receipt.items.length} itens)`,
        category: selectedCategory,
        amount: receipt.totalAmount,
        date: receipt.date,
        paymentMethod: selectedMethod,
        cardId: selectedMethod === "credit" ? selectedCardId : undefined,
        status: "paid",
        notes: `NFC-e Chave: ${receipt.accessKey || "Chave Importada"} • CNPJ: ${receipt.cnpj || "N/D"}`,
        merchantName: receipt.issuerName,
        nfceKey: receipt.accessKey,
        items: receipt.items,
      };
      onSaveExpenses([singleExpense]);
    } else {
      // 2. Multiple individual items as expenses
      const expenseList: Omit<Expense, "id">[] = receipt.items.map((it) => ({
        description: it.name,
        category: selectedCategory,
        amount: it.totalPrice,
        date: receipt.date,
        paymentMethod: selectedMethod,
        cardId: selectedMethod === "credit" ? selectedCardId : undefined,
        status: "paid",
        notes: `Item de: ${receipt.issuerName} (Qtd: ${it.quantity} ${it.unit || "UN"})`,
        merchantName: receipt.issuerName,
        nfceKey: receipt.accessKey,
      }));
      onSaveExpenses(expenseList);
    }

    onClose();
  };

  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900";
  const bgInput = isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-6 transition-all ${bgCard}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Importar NFC-e / Nota Fiscal
              </h2>
              <p className="text-xs text-slate-400">
                Baixe e liste automaticamente todos os itens das compras do supermercado
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

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Input method choice */}
          {!receipt ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold gap-1">
                <button
                  type="button"
                  onClick={() => setActiveInputTab("qr")}
                  className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeInputTab === "qr"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-200" />
                  Escanear QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputTab("key")}
                  className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeInputTab === "key"
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Digitar Chave
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputTab("xml")}
                  className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeInputTab === "xml"
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Arquivo XML
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputTab("quick")}
                  className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeInputTab === "quick"
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Exemplos
                </button>
              </div>

              {/* TAB 0: Live QR Code Scanner */}
              {activeInputTab === "qr" && (
                <div className="space-y-3">
                  <QRScanner onScanSuccess={handleScanQRCode} isDark={isDark} />

                  {isLoading && (
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs flex items-center justify-center gap-3 animate-pulse">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="font-bold">Processando cupom e baixando os itens da compra...</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveInputTab("key")}
                      className="text-xs text-indigo-500 hover:underline cursor-pointer"
                    >
                      Prefere digitar a chave de 44 dígitos manualmente? Clique aqui
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 1: Access key / URL */}
              {activeInputTab === "key" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Chave de Acesso da NFC-e (44 dígitos) ou Link do QR Code
                    </label>
                    <textarea
                      rows={2}
                      value={accessKeyInput}
                      onChange={(e) => setAccessKeyInput(e.target.value)}
                      placeholder="Ex: 3526 0900 0123 4500 0189 6500 1000 0847 2910 8472 9184 ou cole o link do QR Code"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${bgInput}`}
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                      <span>
                        Dígitos detectados:{" "}
                        <strong
                          className={
                            keyAnalysis?.isValid
                              ? "text-emerald-500"
                              : accessKeyInput.replace(/\D/g, "").length > 0
                              ? "text-amber-400"
                              : "text-slate-400"
                          }
                        >
                          {accessKeyInput.replace(/\D/g, "").length} / 44
                        </strong>
                      </span>
                      {keyAnalysis?.isValid && (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {keyAnalysis.uf} • {keyAnalysis.modelName} • CNPJ: {keyAnalysis.formattedCnpj}
                        </span>
                      )}
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadNFCe}
                    disabled={isLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Baixando Itens da Nota na SEFAZ...</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4" />
                        Baixar Itens da Nota Fiscal
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-500/5 p-3 rounded-xl border border-slate-500/10">
                    💡 <strong>Como encontrar a chave:</strong> Na nota impressa do supermercado ou farmácia, você encontrará a "Chave de Acesso" com 44 números logo abaixo do QR Code ou no topo do cupom fiscal.
                  </p>
                </div>
              )}

              {/* TAB 2: XML upload */}
              {activeInputTab === "xml" && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
                    <input
                      type="file"
                      accept=".xml"
                      onChange={handleFileUpload}
                      id="xml-file-input"
                      className="hidden"
                    />
                    <label
                      htmlFor="xml-file-input"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Clique para selecionar o arquivo .XML da NFC-e
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Arquivos padrão SEFAZ (NFe / NFCe)
                      </span>
                    </label>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Quick Demo Samples */}
              {activeInputTab === "quick" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Experimente o download com exemplos prontos de notas fiscais residenciais:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleLoadSample("supermercado")}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all hover:scale-[1.02] cursor-pointer bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <span className="text-xl block mb-1">🛒</span>
                      <span className="text-xs font-bold block">Supermercado</span>
                      <span className="text-[10px] text-slate-400 block">10 itens • R$ 238,45</span>
                      <span className="text-[9px] text-indigo-500 font-semibold mt-2 block">Carregar Exemplo →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadSample("hortifruti")}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all hover:scale-[1.02] cursor-pointer bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <span className="text-xl block mb-1">🍎</span>
                      <span className="text-xs font-bold block">Feira & Frutas</span>
                      <span className="text-[10px] text-slate-400 block">7 itens • R$ 114,65</span>
                      <span className="text-[9px] text-indigo-500 font-semibold mt-2 block">Carregar Exemplo →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadSample("farmacia")}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all hover:scale-[1.02] cursor-pointer bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <span className="text-xl block mb-1">💊</span>
                      <span className="text-xs font-bold block">Farmácia & Remédios</span>
                      <span className="text-[10px] text-slate-400 block">4 itens • R$ 94,30</span>
                      <span className="text-[9px] text-indigo-500 font-semibold mt-2 block">Carregar Exemplo →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Extracted Receipt Preview & Save Controls */
            <div className="space-y-4">
              {/* Receipt Header Card */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[10px] font-extrabold uppercase">
                      NFC-e Baixada
                    </span>
                    <span className="text-xs text-slate-400">Data: {receipt.date}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {receipt.issuerName}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {receipt.cnpj ? `CNPJ: ${receipt.cnpj} • ` : ""}
                    {receipt.items.length} produtos listados
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Valor Total</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatBRL(receipt.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Itens Detalhados da Compra ({receipt.items.length})
                  </h4>
                  <button
                    onClick={() => setReceipt(null)}
                    className="text-xs text-indigo-500 hover:underline cursor-pointer"
                  >
                    Trocar nota fiscal
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Item / Produto</th>
                        <th className="px-2 py-2 text-center">Qtd</th>
                        <th className="px-2 py-2 text-right">Unitário</th>
                        <th className="px-3 py-2 text-right">Total</th>
                        <th className="px-2 py-2 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {receipt.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-500/5">
                          <td className="px-3 py-2 font-medium truncate max-w-[200px]" title={item.name}>
                            {item.name}
                          </td>
                          <td className="px-2 py-2 text-center text-slate-400">
                            {item.quantity} {item.unit || "UN"}
                          </td>
                          <td className="px-2 py-2 text-right text-slate-400">
                            {formatBRL(item.unitPrice)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">
                            {formatBRL(item.totalPrice)}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="Remover este item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assignment Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/20 text-xs">
                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory)}
                    className={`w-full rounded-xl px-2.5 py-2 font-semibold border ${bgInput}`}
                  >
                    {Object.entries(CATEGORY_DETAILS).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.icon} {info.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Forma de Pagamento</label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                    className={`w-full rounded-xl px-2.5 py-2 font-semibold border ${bgInput}`}
                  >
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Card selection if Credit */}
                {selectedMethod === "credit" && (
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Cartão Usado</label>
                    <select
                      value={selectedCardId}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      className={`w-full rounded-xl px-2.5 py-2 font-semibold border ${bgInput}`}
                    >
                      {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (Fecha dia {c.closingDay})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Save mode choice */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Como deseja salvar?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSaveMode("single")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      saveMode === "single"
                        ? "border-indigo-600 bg-indigo-500/10 text-indigo-500 font-bold"
                        : "border-slate-300 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    <span className="block text-sm">📦 Despesa Única Consolidada</span>
                    <span className="text-[11px] opacity-80 font-normal">
                      Cria 1 despesa com o valor total ({formatBRL(receipt.totalAmount)}) e anexa os {receipt.items.length} itens no cupom.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSaveMode("multiple")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      saveMode === "multiple"
                        ? "border-indigo-600 bg-indigo-500/10 text-indigo-500 font-bold"
                        : "border-slate-300 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    <span className="block text-sm">📑 Itens Individuais Separados</span>
                    <span className="text-[11px] opacity-80 font-normal">
                      Cria {receipt.items.length} despesas separadas na tabela, uma para cada produto comprado.
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm button */}
              <button
                type="button"
                onClick={handleConfirmImport}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar e Salvar {receipt.items.length} Itens no Aplicativo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
