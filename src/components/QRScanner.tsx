import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, RefreshCw, Zap, ZapOff, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isDark?: boolean;
}

export function QRScanner({ onScanSuccess, isDark = false }: QRScannerProps) {
  const [isStarting, setIsStarting] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedSuccess, setScannedSuccess] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerId = "qr-camera-viewfinder";

  // Initialize and start camera
  useEffect(() => {
    let mounted = true;
    let html5QrCode: Html5Qrcode | null = null;

    async function initScanner() {
      try {
        setIsStarting(true);
        setErrorMessage(null);

        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          throw new Error("Nenhuma câmera encontrada no dispositivo.");
        }

        if (mounted) {
          setCameras(devices);
          // Prefer back camera (environment)
          const backCam = devices.find((d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("traseira") ||
            d.label.toLowerCase().includes("environment")
          );
          const chosenId = backCam?.id || devices[devices.length - 1].id;
          setSelectedCameraId(chosenId);

          html5QrCode = new Html5Qrcode(containerId, {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
          });
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            chosenId,
            {
              fps: 12,
              qrbox: { width: 260, height: 260 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              if (mounted) {
                // Success!
                handleSuccessfulScan(decodedText);
              }
            },
            () => {
              // Frame without QR code: ignore silently
            }
          );

          if (mounted) {
            setIsScanning(true);
            setIsStarting(false);

            // Check if torch is available
            try {
              const capabilities = html5QrCode.getRunningTrackCapabilities() as any;
              if (capabilities && capabilities.torch) {
                setHasTorch(true);
              }
            } catch {
              // torch not available
            }
          }
        }
      } catch (err: any) {
        if (mounted) {
          console.warn("Scanner start error:", err);
          setIsStarting(false);
          setIsScanning(false);
          setErrorMessage(
            err.message?.includes("Permission") || err.name === "NotAllowedError"
              ? "Permissão de câmera negada. Você pode liberar a câmera no navegador ou carregar uma foto do QR Code."
              : err.message || "Não foi possível iniciar a câmera."
          );
        }
      }
    }

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          try {
            scannerRef.current?.clear();
          } catch {
            // ignore
          }
        }).catch((e) => console.warn("Error stopping scanner on unmount:", e));
      }
    };
  }, []);

  const handleSuccessfulScan = async (decodedText: string) => {
    setScannedSuccess(decodedText);

    // Haptic feedback if available
    try {
      if (navigator.vibrate) {
        navigator.vibrate([40, 50, 100]);
      }
    } catch {
      // ignore
    }

    // Stop scanner
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch {
        // ignore
      }
    }

    // Pass data
    setTimeout(() => {
      onScanSuccess(decodedText);
    }, 400);
  };

  // Switch camera if multiple
  const handleSwitchCamera = async () => {
    if (!scannerRef.current || cameras.length <= 1) return;

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCamera = cameras[nextIndex];
      setSelectedCameraId(nextCamera.id);

      await scannerRef.current.start(
        nextCamera.id,
        {
          fps: 12,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => handleSuccessfulScan(decodedText),
        () => {}
      );
      setIsScanning(true);
    } catch (err: any) {
      setErrorMessage("Erro ao alternar câmera: " + err.message);
    }
  };

  // Toggle Torch (Lanterna)
  const handleToggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextState = !isTorchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState }] as any,
      });
      setIsTorchOn(nextState);
    } catch (err) {
      console.warn("Torch toggle failed:", err);
    }
  };

  // Scan from photo / gallery
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      let tempScanner = scannerRef.current;
      if (!tempScanner) {
        tempScanner = new Html5Qrcode(containerId);
      }

      const result = await tempScanner.scanFile(file, true);
      handleSuccessfulScan(result);
    } catch (err: any) {
      setErrorMessage("Não foi possível detectar um QR Code nesta imagem. Tente uma foto mais aproximada e nítida.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Viewfinder frame */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[300px]">
        {/* The video element injected by Html5Qrcode */}
        <div id={containerId} className="w-full max-w-[340px] overflow-hidden" />

        {/* Loading Overlay */}
        {isStarting && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3 p-4 text-center z-10">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-200">
              Iniciando a câmera do seu celular...
            </p>
          </div>
        )}

        {/* Scanning Target Guide Box */}
        {isScanning && !scannedSuccess && (
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center">
            <div className="w-60 h-60 border-2 border-indigo-500/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
              {/* Laser line animation */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Scanned Success Overlay */}
        {scannedSuccess && (
          <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center gap-2 p-4 text-center z-20">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-white">QR Code Lido com Sucesso!</p>
            <p className="text-xs text-emerald-200">Buscando os produtos da sua compra...</p>
          </div>
        )}

        {/* Camera Controls Bar (Over the video) */}
        {isScanning && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            {hasTorch ? (
              <button
                type="button"
                onClick={handleToggleTorch}
                className="text-xs text-white flex items-center gap-1.5 hover:text-amber-300 cursor-pointer p-1"
                title="Ligar/Desligar Lanterna"
              >
                {isTorchOn ? <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> : <ZapOff className="w-4 h-4" />}
                <span className="text-[11px] font-semibold">{isTorchOn ? "Lanterna Ligada" : "Lanterna"}</span>
              </button>
            ) : <span className="text-[11px] text-slate-400">Aponte para o QR Code</span>}

            {cameras.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="text-xs text-white flex items-center gap-1 hover:text-indigo-300 cursor-pointer p-1"
                title="Trocar Câmera Traseira/Frontal"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">Virar Câmera</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center space-y-1">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
          Aponte a câmera para o QR Code quadrado impresso no cupom fiscal
        </p>
        <p className="text-[11px] text-slate-400">
          Ele fica no final da nota fiscal do supermercado ou farmácia. A leitura é instantânea!
        </p>
      </div>

      {/* Error Message if camera failed */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">{errorMessage}</span>
            <span className="text-[11px] block opacity-90">
              Dica: Você também pode tirar uma foto do QR Code e carregar pelo botão abaixo!
            </span>
          </div>
        </div>
      )}

      {/* Fallback to Photo / File upload */}
      <div className="flex items-center justify-center pt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id="qr-photo-input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-all cursor-pointer bg-slate-100/60 dark:bg-slate-800/60"
        >
          <ImageIcon className="w-4 h-4 text-indigo-500" />
          Carregar Foto do QR Code da Galeria
        </button>
      </div>
    </div>
  );
}
