import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../../services/api";
import { resetarSenha } from "../../services/auth";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Token de recuperacao ausente.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErrorMessage("As senhas nao coincidem.");
      return;
    }

    if (novaSenha.length < 8) {
      setErrorMessage("A senha deve ter no minimo 8 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetarSenha(token, novaSenha);
      setSuccessMessage("Senha redefinida com sucesso.");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel redefinir sua senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex grow items-center justify-center bg-[url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2500&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-background-light/90 backdrop-blur-sm dark:bg-background-dark/95" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Defina uma nova senha
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Use uma senha forte e diferente da anterior.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-xl dark:border-slate-700 dark:bg-[#1A2332]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
                {successMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="novaSenha"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Nova senha
              </label>
              <input
                id="novaSenha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={novaSenha}
                onChange={(event) => setNovaSenha(event.target.value)}
                className="mt-1 block w-full rounded-lg border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800/50 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="confirmarSenha"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Confirmar nova senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmarSenha}
                onChange={(event) => setConfirmarSenha(event.target.value)}
                className="mt-1 block w-full rounded-lg border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800/50 dark:text-white sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Salvando..." : "Redefinir senha"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          <Link
            to="/login"
            className="font-semibold text-primary transition-colors hover:text-blue-500"
          >
            Voltar ao login
          </Link>
        </p>
      </div>
    </main>
  );
}
