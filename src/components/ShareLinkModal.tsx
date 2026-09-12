import { useState, type ChangeEvent } from "react";
import { Copy, Check, Smartphone, Globe, Download, Upload, X, ShieldCheck, Share2, FileText, RotateCcw } from "lucide-react";
import { FinanceData } from "../types";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FinanceData;
  onImportData: (data: FinanceData) => void;
}

export function ShareLinkModal({
  isOpen,
  onClose,
  data,
  onImportData,
}: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.origin.includes("run.app")
        ? window.location.origin
        : "https://ais-dev-bwcuvdb7r7lesa4suecnxf-128520403152.us-east1.run.app"
      : "https://ais-dev-bwcuvdb7r7lesa4suecnxf-128520403152.us-east1.run.app";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const whatsappMessage = `Aqui está o link do aplicativo GASTOS.CASA:\n${currentUrl}\n\nUsuário: adm\nSenha: isisadm`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  // Generate QR Code via standard dynamic QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    currentUrl
  )}`;

  // Backup Export as File
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_gastos_casa_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage("✅ Arquivo de backup baixado para a sua pasta de Downloads!");
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Share Backup via WhatsApp or Drive
  const handleShareBackup = async () => {
    const jsonStr = JSON.stringify(data, null, 2);
    if (navigator.share) {
      try {
        const file = new File([jsonStr], `backup_gastos_casa.json`, { type: "application/json" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Backup GASTOS.CASA",
            text: "Arquivo de backup das contas e cartões do GASTOS.CASA",
            files: [file],
          });
          return;
        }
      } catch (e) {
        console.warn("File sharing not supported, falling back to text share:", e);
      }
    }
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(jsonStr);
    setCopiedBackup(true);
    setStatusMessage("✅ Código de backup copiado! Cole no WhatsApp ou em um bloco de notas.");
    setTimeout(() => {
      setCopiedBackup(false);
      setStatusMessage(null);
    }, 4000);
  };

  // Copy Backup as Text
  const handleCopyBackupText = () => {
    const jsonStr = JSON.stringify(data);
    navigator.clipboard.writeText(jsonStr);
    setCopiedBackup(true);
    setStatusMessage("✅ Código de backup copiado para a memória!");
    setTimeout(() => {
      setCopiedBackup(false);
      setStatusMessage(null);
    }, 4000);
  };

  // Restore from pasted text
  const handleRestoreFromText = () => {
    try {
      const parsed = JSON.parse(pasteText.trim());
      if (parsed && (Array.isArray(parsed.expenses) || Array.isArray(parsed.cards))) {
        onImportData(parsed);
        setStatusMessage("✅ Backup restaurado com sucesso!");
        setShowPasteBox(false);
        setPasteText("");
        setTimeout(() => onClose(), 1200);
      } else {
        alert("O texto colado não contém um formato de backup válido.");
      }
    } catch {
      alert("Texto de backup inválido. Certifique-se de colar o código completo.");
    }
  };

  // Restore from Auto-Backup in localStorage
  const handleRestoreAutoBackup = () => {
    try {
      const raw = localStorage.getItem("gastos_casa_backup_auto") || localStorage.getItem("gastos_casa_data_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.cards?.length > 0 || parsed.expenses?.length > 0)) {
          onImportData(parsed);
          setStatusMessage("✅ Ponto de segurança restaurado com sucesso!");
          setTimeout(() => onClose(), 1200);
          return;
        }
      }
      alert("Nenhum ponto de backup automático encontrado na memória deste navegador.");
    } catch (e) {
      alert("Erro ao ler ponto de restauração automático.");
    }
  };

  // Backup Import from File
  const handleImportJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (Array.isArray(parsed.expenses) || Array.isArray(parsed.cards))) {
          onImportData(parsed);
          setStatusMessage("✅ Dados importados e sincronizados com sucesso!");
          setTimeout(() => onClose(), 1200);
        } else {
          alert("Arquivo inválido. Escolha um arquivo de backup do GASTOS.CASA.");
        }
      } catch {
        alert("Erro ao ler o arquivo. Certifique-se de escolher o arquivo .json baixado.");
      }
    };
    reader.readAsText(file);
  };

  const autoBackupRaw = typeof window !== "undefined" ? localStorage.getItem("gastos_casa_backup_auto") : null;
  const hasAutoBackup = !!autoBackupRaw;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="share-link-modal-dialog"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Acessar em Qualquer Lugar</h2>
              <p className="text-xs text-slate-300">
                Acesse seu controle financeiro de qualquer celular ou computador
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Link Box */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 text-xs uppercase tracking-wider">
              Seu Link Exclusivo de Acesso:
            </label>
            <div className="flex items-center gap-2">
              <input
                id="share-link-url-input"
                type="text"
                readOnly
                value={currentUrl}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 select-all"
              />
              <button
                id="btn-copy-share-link"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>

              <a
                id="btn-send-whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shrink-0 transition-all shadow-xs cursor-pointer"
                title="Mandar o link para o seu próprio WhatsApp"
              >
                <Smartphone className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
            {copied && (
              <p className="text-xs text-emerald-700 font-medium mt-1.5">
                ✅ Link copiado para a área de transferência! Envie pelo WhatsApp ou abra no navegador.
              </p>
            )}
          </div>

          {/* QR Code Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code de Acesso"
                className="w-28 h-28 object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <Smartphone className="w-3 h-3" /> Abrir no Celular
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                Aponte a câmera do seu celular
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Escaneie o QR Code acima para abrir instantaneamente esta aplicação no seu smartphone sem precisar digitar o link!
              </p>
            </div>
          </div>

          {/* Instruções para Sincronização entre 2 celulares */}
          <div className="p-3.5 bg-emerald-50/90 border border-emerald-300/80 rounded-xl text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sincronização entre dois celulares:</span>
            </div>
            <p className="text-emerald-900/90 leading-relaxed">
              Para os dois celulares compartilharem as mesmas contas e sincronizarem em tempo real, <strong>ambos devem acessar o mesmo link oficial acima</strong>. Envie pelo <strong>WhatsApp</strong> para o outro celular para abrirem juntos!
            </p>
          </div>

          {/* Dica para liberar para outros celulares */}
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Como liberar para qualquer celular sem pedir conta Google:</span>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              No topo da tela do Google AI Studio (no seu computador), clique no botão <strong>"Share" (Compartilhar)</strong>. Isso gera o link público oficial que qualquer pessoa consegue abrir no celular sem precisar de login do Google!
            </p>
          </div>

          {/* Status Notification Message */}
          {statusMessage && (
            <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold text-center shadow-md animate-pulse">
              {statusMessage}
            </div>
          )}

          {/* Sync Info */}
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Proteção e Salvamento Inteligente</span>
              <p className="text-emerald-800 mt-0.5">
                Seus dados ficam gravados com segurança no servidor e também no armazenamento permanente deste celular. Atualizações do app nunca mais apagarão seus cartões.
              </p>
            </div>
          </div>

          {/* Backup & Restore Central Area */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Backup & Restauração dos Seus Dados
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">
                {data.cards?.length || 0} cartões • {data.expenses?.length || 0} despesas
              </span>
            </div>

            {/* Step 1: Salvar / Exportar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>1. Baixar Arquivo de Backup</span>
              </button>

              <button
                type="button"
                onClick={handleShareBackup}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar para o WhatsApp</span>
              </button>
            </div>

            {/* Extra: Copiar Código */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCopyBackupText}
                className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedBackup ? "Copiado!" : "Copiar código de backup como texto"}</span>
              </button>
            </div>

            {/* Step 2: Restaurar Opções */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Opções para Restaurar:
                </span>
              </div>

              {/* Botão A: Ponto de segurança automático 1-clique */}
              {hasAutoBackup && (
                <button
                  type="button"
                  onClick={handleRestoreAutoBackup}
                  className="w-full py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-700" />
                  <span>Restaurar do Backup Automático do Celular (1 Toque)</span>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Botão B: Escolher arquivo do aparelho */}
                <label className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Escolher Arquivo (.json)</span>
                  <input
                    type="file"
                    accept="*/*,.json,application/json,text/plain"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>

                {/* Botão C: Colar texto de backup */}
                <button
                  type="button"
                  onClick={() => setShowPasteBox(!showPasteBox)}
                  className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Colar Texto de Backup</span>
                </button>
              </div>

              {/* Caixa de colar código */}
              {showPasteBox && (
                <div className="pt-2 space-y-2">
                  <textarea
                    rows={3}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Cole aqui o código de backup gerado..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasteBox(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreFromText}
                      disabled={!pasteText.trim()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      Restaurar Agora
                    </button>
                  </div>
                </div>
              )}

              {/* Instrução Amigável para o Android (Mostrando como resolver o 'Nenhum Item') */}
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold block">💡 Dica para Celular Android (como na sua foto):</span>
                Quando a tela de arquivos abrir mostrando <em>"Recentes: Nenhum item"</em>:
                <ol className="list-decimal ml-4 mt-1 space-y-0.5">
                  <li>Toque nas <strong>3 barrinhas (☰)</strong> no canto superior esquerdo daquela tela.</li>
                  <li>Selecione a pasta <strong>"Downloads"</strong> ou <strong>"Download"</strong>.</li>
                  <li>O arquivo <strong>backup_gastos_casa.json</strong> estará lá!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
