import { useState, type FormEvent } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Smartphone,
} from "lucide-react";
import { ThemeMode } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function LoginScreen({
  onLoginSuccess,
  theme,
  onToggleTheme,
}: LoginScreenProps) {
  const [username, setUsername] = useState("adm");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === "dark";

  const handleFillCredentials = () => {
    setUsername("adm");
    setPassword("isisadm");
    setErrorMsg("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg("Por favor, preencha o usuário e a senha.");
      return;
    }

    setIsLoading(true);

    try {
      // Check via API endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUser, password: cleanPass }),
      });

      if (response.ok) {
        const data = await response.json();
        if (rememberMe) {
          localStorage.setItem(
            "gastos_casa_auth_session",
            JSON.stringify({
              user: cleanUser,
              token: data.token || "authenticated",
              timestamp: Date.now(),
            })
          );
        } else {
          sessionStorage.setItem(
            "gastos_casa_auth_session",
            JSON.stringify({
              user: cleanUser,
              token: data.token || "authenticated",
              timestamp: Date.now(),
            })
          );
        }
        onLoginSuccess(cleanUser);
        return;
      }
    } catch {
      // Fallback offline validation in case network issue
      if (cleanUser === "adm" && cleanPass === "isisadm") {
        if (rememberMe) {
          localStorage.setItem(
            "gastos_casa_auth_session",
            JSON.stringify({
              user: cleanUser,
              token: "offline_auth",
              timestamp: Date.now(),
            })
          );
        }
        onLoginSuccess(cleanUser);
        return;
      }
    } finally {
      setIsLoading(false);
    }

    // Direct fallback check if server returned 401
    if (cleanUser === "adm" && cleanPass === "isisadm") {
      if (rememberMe) {
        localStorage.setItem(
          "gastos_casa_auth_session",
          JSON.stringify({
            user: cleanUser,
            token: "direct_auth",
            timestamp: Date.now(),
          })
        );
      }
      onLoginSuccess(cleanUser);
    } else {
      setErrorMsg("Usuário ou senha incorretos. Verifique os dados digitados.");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Bar with theme toggle */}
      <div className="w-full max-w-md mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
            $
          </div>
          <span className="font-extrabold text-base tracking-tight">
            GASTOS<span className="text-indigo-500">.CASA</span>
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isDark
              ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
          title="Alternar Modo Escuro / Claro"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Escuro</span>
            </>
          )}
        </button>
      </div>

      {/* Center Box */}
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div
          className={`rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
            isDark
              ? "bg-slate-900/90 border-slate-800 shadow-slate-950/50"
              : "bg-white border-slate-200/80 shadow-slate-200/60"
          }`}
        >
          {/* Header icon & title */}
          <div className="text-center mb-6">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 mx-auto mb-3.5 bg-slate-900">
              <img
                src="/app-icon.png"
                alt="GASTOS.CASA"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/app-icon.jpg";
                }}
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              GASTOS<span className="text-indigo-500">.CASA</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gestão financeira residencial sincronizada
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário (adm)"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isDark
                      ? "bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className={`w-full pl-10 pr-11 py-2.5 text-sm font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isDark
                      ? "bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <span>Lembrar login neste celular/computador</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Validando acesso...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar no GASTOS.CASA</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Box */}
          <div
            className={`mt-6 p-3.5 rounded-2xl border text-xs space-y-2 ${
              isDark
                ? "bg-slate-950/60 border-slate-800 text-slate-400"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-indigo-500">
                <Smartphone className="w-3.5 h-3.5" />
                Usuário e Senha Padrão
              </span>
              <button
                type="button"
                onClick={handleFillCredentials}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Preencher Auto
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span>
                Usuário: <strong className="text-indigo-500">adm</strong>
              </span>
              <span>
                Senha: <strong className="text-indigo-500">isisadm</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-xs text-slate-400">
        <p>GASTOS.CASA • Acesso Restrito e Seguro</p>
      </div>
    </div>
  );
}
