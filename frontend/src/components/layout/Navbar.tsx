import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="w-full bg-white dark:bg-[#1A2332] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-icons text-primary text-3xl">pets</span>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              PetFriend Connect
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/#como-funciona"
              className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
            >
              Como funciona
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
            >
              Início
            </Link>
            <Link
              to="/registro"
              className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
            >
              Cadastrar
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={
                    user?.tipo === "ADMIN"
                      ? "/admin"
                      : user?.tipo === "CUIDADOR"
                        ? "/dashboard/cuidador"
                        : "/dashboard/dono"
                  }
                  className="text-sm font-semibold text-primary hover:text-blue-500 transition-colors"
                >
                  Meu painel
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-primary hover:text-blue-500 transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
