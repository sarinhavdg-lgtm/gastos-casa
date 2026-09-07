import { useState, type ChangeEvent } from "react";
import { Copy, Check, QrCode, Smartphone, Globe, Download, Upload, X, ShieldCheck } from "lucide-react";
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

  if (!isOpen) return null;

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.origin.includes("run.app")
        ? window.location.origin
        : window.location.href
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

  // Backup Export
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_financas_casa_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Backup Import
  const handleImportJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.expenses)) {
          onImportData(parsed);
          alert("Dados importados e sincronizados com sucesso!");
          onClose();
        } else {
          alert("Arquivo JSON inválido.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };

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

          {/* Sync Info */}
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Salvamento Permanente na Nuvem</span>
              <p className="text-emerald-800 mt-0.5">
                Todas as despesas, cartões de crédito e renda são salvos no servidor e sincronizados em tempo real. Você não perde suas informações ao fechar o navegador.
              </p>
            </div>
          </div>

          {/* Backup Options */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleExportJSON}
              className="flex-1 py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Baixar Backup (JSON)
            </button>

            <label className="flex-1 py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-center">
              <Upload className="w-4 h-4 text-slate-500" />
              Restaurar Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
