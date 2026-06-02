import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserType } from "../services/auth";

function getDashboardPath(tipo?: UserType) {
  if (tipo === "ADMIN") return "/admin";
  if (tipo === "CUIDADOR") return "/dashboard/cuidador";
  return "/dashboard/dono";
}

export default function ProtectedRoute({
  allowedTypes,
}: {
  allowedTypes?: UserType[];
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600 dark:text-slate-300">
        Carregando sessão...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && (!user || !allowedTypes.includes(user.tipo))) {
    return <Navigate to={getDashboardPath(user?.tipo)} replace />;
  }

  return <Outlet />;
}
