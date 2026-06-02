import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { parseOAuthCallback } from "../../services/oauth";
import type { UserType } from "../../services/auth";
import type { AuthData } from "../../services/auth";

function getDashboardPath(tipo: UserType) {
  if (tipo === "ADMIN") return "/admin";
  if (tipo === "CUIDADOR") return "/dashboard/cuidador";
  return "/dashboard/dono";
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { completeSocialLogin } = useAuth();
  const [authData] = useState<AuthData | null>(() => {
    try {
      return parseOAuthCallback(window.location.hash);
    } catch {
      return null;
    }
  });
  const errorMessage = authData
    ? ""
    : "Não foi possível concluir o login social.";

  useEffect(() => {
    if (authData) {
      const user = completeSocialLogin(authData);
      navigate(getDashboardPath(user.tipo), { replace: true });
    }
  }, [authData, completeSocialLogin, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {errorMessage ? (
          <>
            <span className="material-icons text-5xl text-red-500">
              error_outline
            </span>
            <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Login não concluído
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {errorMessage}
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Voltar ao login
            </Link>
          </>
        ) : (
          <>
            <span className="material-icons animate-spin text-5xl text-primary">
              refresh
            </span>
            <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Concluindo login...
            </h1>
          </>
        )}
      </div>
    </main>
  );
}
