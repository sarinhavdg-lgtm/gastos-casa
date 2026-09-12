import React, { useState, useRef, ChangeEvent } from "react";
import {
  Image,
  Upload,
  RotateCcw,
  Check,
  X,
  Smartphone,
  Sparkles,
  AlertCircle,
  Eye,
} from "lucide-react";

interface CustomLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo?: string;
  onSaveLogo: (logoDataUrl?: string) => void;
  isDark?: boolean;
}

export function CustomLogoModal({
  isOpen,
  onClose,
  currentLogo,
  onSaveLogo,
  isDark = false,
}: CustomLogoModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process file upload and compress via canvas
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          // Max dimensions: 512x512 square crop / scale
          const canvas = document.createElement("canvas");
          const maxDim = 512;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/png", 0.9);
            setSelectedImage(dataUrl);
          } else {
            setSelectedImage(event.target?.result as string);
          }
        } catch {
          setSelectedImage(event.target?.result as string);
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMessage("Erro ao processar a imagem. Tente outra foto.");
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!selectedImage) return;
    onSaveLogo(selectedImage);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToDefault = () => {
    if (confirm("Deseja restaurar a imagem original padrão do aplicativo?")) {
      onSaveLogo(undefined);
      setSelectedImage(null);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    }
  };

  const effectivePreview = selectedImage || currentLogo || "/app-icon.png";

  const bgModal = isDark
    ? "bg-slate-900 border-slate-800 text-white"
    : "bg-white border-slate-200 text-slate-900";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all ${bgModal}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Personalizar Imagem & Logo
              </h2>
              <p className="text-xs text-slate-400">
                Altere a foto da casa, logo ou ícone do aplicativo
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Informação explicativa sobre por que não mudou antes (Cache do Navegador) */}
          <div className="p-3.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 text-xs space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Por que a imagem não havia atualizado?</span>
            </div>
            <p>
              Navegadores como o <strong>Safari do iPhone</strong> e o <strong>Google Chrome</strong> guardam a imagem antiga na memória interna (cache).
            </p>
            <p>
              Ao escolher sua foto por esta tela, a nova imagem é <strong>gravada no banco de dados e sincronizada na hora</strong> em todos os seus celulares sem depender do cache do navegador!
            </p>
          </div>

          {/* Seletor de Arquivo */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Escolher Foto do seu Celular ou Computador:
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-400/50 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {isProcessing ? "Processando imagem..." : "Toque aqui para escolher a foto"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Foto da sua galeria, logo personalizada, PNG ou JPG
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pré-visualização ao vivo */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                Como vai aparecer no app:
              </span>
              {selectedImage && (
                <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  Nova foto selecionada
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
              {/* Preview 1: Splash Screen / Abertura */}
              <div className="p-3 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center gap-1.5 text-center">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 shadow-md">
                  <img
                    src={effectivePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-300">Tela de Abertura</span>
              </div>

              {/* Preview 2: Barra de Navegação */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-1.5 text-center">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={effectivePreview}
                      alt="Logo Topo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-800 dark:text-white">
                    GASTOS<span className="text-indigo-500">.CASA</span>
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Topo do Menu</span>
              </div>

              {/* Preview 3: Ícone Celular */}
              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-850 flex flex-col items-center justify-center gap-1.5 text-center">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-slate-300 dark:border-slate-700">
                  <img
                    src={effectivePreview}
                    alt="Ícone Celular"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Ícone no iPhone</span>
              </div>
            </div>
          </div>

          {/* Status de Sucesso */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center shadow-md animate-pulse flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Imagem atualizada e sincronizada com sucesso!</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            {currentLogo ? (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-500 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Imagem Padrão</span>
              </button>
            ) : (
              <div />
            )}

            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedImage || isProcessing}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Nova Imagem</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
