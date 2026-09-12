import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Expense, CreditCard, CategoryItem } from "../types";
import { formatBRL, formatDateBR, getCategoryDetails, PAYMENT_METHOD_LABELS } from "../utils/formatters";
import {
  FileText,
  Download,
  Share2,
  Copy,
  Check,
  X,
  Smartphone,
  Calendar,
  CreditCard as CardIcon,
  DollarSign,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  cards: CreditCard[];
  selectedMonth: string;
  categories?: CategoryItem[];
  isDark?: boolean;
}

export function PdfExportModal({
  isOpen,
  onClose,
  expenses,
  cards,
  selectedMonth,
  categories,
  isDark = false,
}: PdfExportModalProps) {
  // Scope: "all" (todos os gastos) vs "month" (mês selecionado)
  const [scope, setScope] = useState<"all" | "month">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">("all");
  const [filterCardId, setFilterCardId] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Map cards for quick lookup
  const cardMap = useMemo(() => {
    const map = new Map<string, CreditCard>();
    cards.forEach((c) => map.set(c.id, c));
    return map;
  }, [cards]);

  // Filtered expenses based on options
  const targetExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        // Scope filter
        if (scope === "month") {
          const expenseMonth = e.date ? e.date.substring(0, 7) : "";
          if (expenseMonth !== selectedMonth) return false;
        }

        // Status filter
        if (filterStatus === "paid" && e.status !== "paid") return false;
        if (filterStatus === "pending" && e.status !== "pending") return false;

        // Card filter
        if (filterCardId !== "all") {
          if (filterCardId === "no-card" && e.cardId) return false;
          if (filterCardId !== "no-card" && e.cardId !== filterCardId) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, scope, selectedMonth, filterStatus, filterCardId]);

  // Financial calculations
  const totals = useMemo(() => {
    const totalAmount = targetExpenses.reduce((sum, e) => sum + e.amount, 0);
    const paidAmount = targetExpenses
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = targetExpenses
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + e.amount, 0);

    // Totals by card
    const byCard: Record<string, { name: string; amount: number }> = {};
    let noCardAmount = 0;

    targetExpenses.forEach((e) => {
      if (e.cardId && cardMap.has(e.cardId)) {
        const card = cardMap.get(e.cardId)!;
        if (!byCard[card.id]) {
          byCard[card.id] = { name: card.name, amount: 0 };
        }
        byCard[card.id].amount += e.amount;
      } else {
        noCardAmount += e.amount;
      }
    });

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      count: targetExpenses.length,
      byCard: Object.values(byCard),
      noCardAmount,
    };
  }, [targetExpenses, cardMap]);

  if (!isOpen) return null;

  // Generate jsPDF Document
  const buildPdfDoc = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const formattedNow = `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    const scopeTitle =
      scope === "all"
        ? "Histórico Geral Completo (Todos os Gastos)"
        : `Mês de Referência: ${selectedMonth}`;

    // --- Header Background ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("GASTOS.CASA", 14, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240); // slate-200
    doc.text("GESTÃO FINANCEIRA RESIDENCIAL & CARTÕES", 14, 18);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Gerado em: ${formattedNow}`, pageWidth - 14, 18, { align: "right" });

    // --- Report Metadata Subtitle ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("Relatório Detalhado de Gastos e Compras", 14, 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Filtro: ${scopeTitle} • Total de Registros: ${totals.count}`, 14, 42);

    // --- Financial Summary Cards Box ---
    const boxY = 46;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, boxY, pageWidth - 28, 22, 2, 2, "FD");

    const colWidth = (pageWidth - 28) / 3;

    // Col 1: Total
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL GERAL", 18, boxY + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(formatBRL(totals.totalAmount), 18, boxY + 16);

    // Col 2: Pago
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL PAGO", 18 + colWidth, boxY + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(formatBRL(totals.paidAmount), 18 + colWidth, boxY + 16);

    // Col 3: A Pagar (Pendente)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("A PAGAR (PENDENTE)", 18 + colWidth * 2, boxY + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(245, 158, 11); // amber-500
    doc.text(formatBRL(totals.pendingAmount), 18 + colWidth * 2, boxY + 16);

    // --- Cards breakdown row if any ---
    let startTableY = boxY + 28;
    if (totals.byCard.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const cardBreakdownText = totals.byCard
        .map((c) => `${c.name}: ${formatBRL(c.amount)}`)
        .join("  |  ");
      doc.text(`Divisão por Cartão: ${cardBreakdownText}`, 14, startTableY);
      startTableY += 5;
    }

    // --- AutoTable of Expenses ---
    const tableHeaders = [
      "Data",
      "Descrição / Estabelecimento",
      "Categoria",
      "Pagamento",
      "Parcela",
      "Status",
      "Valor",
    ];

    const tableRows = targetExpenses.map((e) => {
      const dateStr = formatDateBR(e.date);
      const categoryLabel = getCategoryDetails(e.category, categories).label;
      
      let payDesc = PAYMENT_METHOD_LABELS[e.paymentMethod] || e.paymentMethod;
      if (e.cardId && cardMap.has(e.cardId)) {
        payDesc = cardMap.get(e.cardId)!.name;
      }

      const installmentStr = e.installments && e.installments.total > 1
        ? `${e.installments.current}/${e.installments.total}`
        : "-";

      const statusStr = e.status === "paid" ? "Pago" : "Pendente";
      const amountStr = formatBRL(e.amount);

      return [
        dateStr,
        e.description + (e.notes ? `\nObs: ${e.notes}` : ""),
        categoryLabel,
        payDesc,
        installmentStr,
        statusStr,
        amountStr,
      ];
    });

    autoTable(doc, {
      startY: startTableY,
      head: [tableHeaders],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        halign: "left",
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 18 }, // Data
        1: { cellWidth: "auto" }, // Descrição
        2: { cellWidth: 24 }, // Categoria
        3: { cellWidth: 30 }, // Pagamento
        4: { cellWidth: 15, halign: "center" }, // Parcela
        5: { cellWidth: 18, halign: "center" }, // Status
        6: { cellWidth: 24, halign: "right", fontStyle: "bold" }, // Valor
      },
      didParseCell: (data) => {
        // Highlight status cell
        if (data.section === "body" && data.column.index === 5) {
          if (data.cell.raw === "Pago") {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      foot: [
        [
          "TOTAL",
          `${totals.count} compras registradas`,
          "",
          "",
          "",
          "",
          formatBRL(totals.totalAmount),
        ],
      ],
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 8.5,
        halign: "right",
      },
      margin: { left: 14, right: 14, bottom: 18 },
      didDrawPage: (data) => {
        // Page footer
        const totalPages = doc.getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `GASTOS.CASA • Página ${data.pageNumber} de ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      },
    });

    return doc;
  };

  // 1. Download PDF file
  const handleDownloadPdf = () => {
    try {
      setIsGenerating(true);
      const doc = buildPdfDoc();
      const fileName = `gastos_casa_${scope === "all" ? "todos" : selectedMonth}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      setStatusMessage("✅ Arquivo PDF gerado e baixado com sucesso!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Share PDF file or link
  const handleSharePdf = async () => {
    try {
      setIsGenerating(true);
      const doc = buildPdfDoc();
      const fileName = `gastos_casa_relatorio_${new Date().toISOString().split("T")[0]}.pdf`;
      const blob = doc.output("blob");
      const file = new File([blob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Relatório de Gastos - GASTOS.CASA",
          text: `📊 Aqui está o relatório de gastos da casa:\nTotal Geral: ${formatBRL(totals.totalAmount)} (${totals.count} compras)`,
        });
        setStatusMessage("✅ PDF compartilhado com sucesso!");
      } else if (navigator.share) {
        // Share text summary if files not supported
        await navigator.share({
          title: "Relatório de Gastos - GASTOS.CASA",
          text: generateFormattedText(),
          url: window.location.href,
        });
        setStatusMessage("✅ Resumo compartilhado com sucesso!");
      } else {
        // Fallback: download PDF and open WhatsApp
        doc.save(fileName);
        const textMsg = encodeURIComponent(generateFormattedText());
        window.open(`https://api.whatsapp.com/send?text=${textMsg}`, "_blank");
        setStatusMessage("✅ PDF baixado e WhatsApp aberto!");
      }
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.warn("Share cancelled or not supported:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Format as clean text for copying or WhatsApp
  const generateFormattedText = () => {
    const period = scope === "all" ? "Todos os Gastos Registrados" : `Mês ${selectedMonth}`;
    const dateStr = new Date().toLocaleDateString("pt-BR");

    let text = `📊 *GASTOS.CASA - RELATÓRIO DE COMPRAS*\n`;
    text += `📅 Período: ${period}\n`;
    text += `🕒 Gerado em: ${dateStr}\n\n`;
    text += `💰 *TOTAL GERAL: ${formatBRL(totals.totalAmount)}*\n`;
    text += `✅ Total Pago: ${formatBRL(totals.paidAmount)}\n`;
    text += `⏳ A Pagar: ${formatBRL(totals.pendingAmount)}\n`;
    text += `📦 Total de Compras: ${totals.count}\n\n`;

    if (totals.byCard.length > 0) {
      text += `💳 *Gastos por Cartão:*\n`;
      totals.byCard.forEach((c) => {
        text += `• ${c.name}: ${formatBRL(c.amount)}\n`;
      });
      if (totals.noCardAmount > 0) {
        text += `• Pix / Dinheiro / Débito: ${formatBRL(totals.noCardAmount)}\n`;
      }
      text += `\n`;
    }

    text += `📝 *Lista de Despesas:*\n`;
    targetExpenses.forEach((e) => {
      const cardName = e.cardId && cardMap.has(e.cardId) ? cardMap.get(e.cardId)!.name : "Pix/Dinheiro";
      const statusIcon = e.status === "paid" ? "✅" : "⏳";
      const parcelas = e.installments && e.installments.total > 1 ? ` (${e.installments.current}/${e.installments.total}x)` : "";
      const catLabel = getCategoryDetails(e.category, categories).label;
      text += `${statusIcon} ${formatDateBR(e.date)} - *${e.description}* (${catLabel}): ${formatBRL(e.amount)} [${cardName}${parcelas}]\n`;
    });

    return text;
  };

  // 4. Copy to clipboard
  const handleCopyReport = async () => {
    try {
      const text = generateFormattedText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setStatusMessage("✅ Relatório copiado para a área de transferência!");
      setTimeout(() => {
        setCopied(false);
        setStatusMessage(null);
      }, 4000);
    } catch {
      alert("Não foi possível copiar automaticamente. Tente selecionar o texto.");
    }
  };

  // 5. Send via WhatsApp directly
  const handleWhatsApp = () => {
    const text = encodeURIComponent(generateFormattedText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const bgModal = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900";
  const bgCard = isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="pdf-export-modal-dialog"
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-auto max-h-[94vh] flex flex-col ${bgModal}`}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Relatório de Gastos em PDF
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-900/60 text-red-300 border border-red-700">
                  PDF & Compartilhamento
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Visualize, baixe em PDF, copie ou envie todos os gastos pelo WhatsApp
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
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Status Message Notification */}
          {statusMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 rounded-xl font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Quick Filters */}
          <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Opções do Relatório
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Scope filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Período:
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as "all" | "month")}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="all">Todos os Gastos (Histórico Completo)</option>
                  <option value="month">Apenas Mês Atual ({selectedMonth})</option>
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as "all" | "paid" | "pending")}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="all">Todos os Status</option>
                  <option value="paid">Somente Pagos</option>
                  <option value="pending">Somente Pendentes / A Pagar</option>
                </select>
              </div>

              {/* Card filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Cartão / Pagamento:
                </label>
                <select
                  value={filterCardId}
                  onChange={(e) => setFilterCardId(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="all">Todas as Formas / Cartões</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="no-card">Pix / Dinheiro / Outros</option>
                </select>
              </div>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className={`p-3 rounded-xl border ${bgCard}`}>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Geral</div>
              <div className="text-base sm:text-lg font-black mt-0.5">{formatBRL(totals.totalAmount)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{totals.count} compras</div>
            </div>

            <div className={`p-3 rounded-xl border ${bgCard}`}>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Total Pago
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatBRL(totals.paidAmount)}
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-0.5">Quitado</div>
            </div>

            <div className={`p-3 rounded-xl border ${bgCard}`}>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                A Pagar
              </div>
              <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {formatBRL(totals.pendingAmount)}
              </div>
              <div className="text-[10px] text-amber-500/80 mt-0.5">Fatura aberta</div>
            </div>

            <div className={`p-3 rounded-xl border ${bgCard}`}>
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Cartões
              </div>
              <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {totals.byCard.length}
              </div>
              <div className="text-[10px] text-indigo-500/80 mt-0.5">Utilizados</div>
            </div>
          </div>

          {/* Action Buttons: Download PDF, Share, Copy, WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Download PDF Button */}
            <button
              id="btn-download-pdf"
              onClick={handleDownloadPdf}
              disabled={isGenerating || totals.count === 0}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo PDF (.pdf)</span>
            </button>

            {/* Share PDF Button */}
            <button
              id="btn-share-pdf"
              onClick={handleSharePdf}
              disabled={isGenerating || totals.count === 0}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartilhar Arquivo PDF</span>
            </button>

            {/* Copy Formatted Text Button */}
            <button
              id="btn-copy-pdf-report"
              onClick={handleCopyReport}
              disabled={totals.count === 0}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                copied
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copiado para Área de Transferência!" : "Copiar Relatório Formatado"}</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              id="btn-whatsapp-pdf-report"
              onClick={handleWhatsApp}
              disabled={totals.count === 0}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Enviar Resumo pelo WhatsApp</span>
            </button>
          </div>

          {/* Expenses Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Pré-Visualização das Compras no PDF ({targetExpenses.length})
              </span>
            </div>

            {targetExpenses.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border border-dashed text-slate-400 ${bgCard}`}>
                Nenhuma compra encontrada com os filtros selecionados.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="p-2">Data</th>
                      <th className="p-2">Descrição</th>
                      <th className="p-2">Pagamento</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {targetExpenses.map((e) => {
                      const card = e.cardId ? cardMap.get(e.cardId) : null;
                      return (
                        <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="p-2 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {formatDateBR(e.date)}
                          </td>
                          <td className="p-2 font-medium">
                            <div>{e.description}</div>
                            {e.notes && <div className="text-[10px] text-slate-400 truncate max-w-xs">{e.notes}</div>}
                          </td>
                          <td className="p-2 text-slate-500 whitespace-nowrap">
                            {card ? card.name : PAYMENT_METHOD_LABELS[e.paymentMethod] || e.paymentMethod}
                          </td>
                          <td className="p-2 text-center whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                e.status === "paid"
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                              }`}
                            >
                              {e.status === "paid" ? "Pago" : "Pendente"}
                            </span>
                          </td>
                          <td className="p-2 text-right font-bold whitespace-nowrap">
                            {formatBRL(e.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Dica: O PDF é gerado em alta definição A4 pronto para impressão ou arquivamento.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
