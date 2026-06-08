import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type NavItem = {
  icon: string;
  label: string;
  to: string;
  badge?: number;
};

const navItemsDono: NavItem[] = [
  { icon: "dashboard", label: "Painel", to: "/dashboard/dono" },
  { icon: "pets", label: "Meus Pets", to: "/meus-pets" },
  { icon: "search", label: "Cuidadores", to: "/encontrar-cuidadores" },
  { icon: "assignment", label: "Minhas Reservas", to: "/minhas-reservas" },
  { icon: "settings", label: "Configurações", to: "/configuracoes" },
];

const navItemsCuidador: NavItem[] = [
  { icon: "dashboard", label: "Painel", to: "/dashboard/cuidador" },
  { icon: "calendar_today", label: "Agenda", to: "/minha-agenda" },
  {
    icon: "assignment",
    label: "Minhas Reservas",
    to: "/minhas-reservas",
    badge: 2,
  },
  { icon: "medical_services", label: "Meus Serviços", to: "/meus-servicos" },
  { icon: "settings", label: "Configurações", to: "/configuracoes" },
];

const navItemsAdmin: NavItem[] = [
  { icon: "dashboard", label: "Painel", to: "/admin" },
  { icon: "people", label: "Usuários", to: "/admin/usuarios" },
  { icon: "flag", label: "Denúncias", to: "/admin/denuncias" },
  { icon: "receipt_long", label: "Logs", to: "/admin/logs" },
  { icon: "settings", label: "Configurações", to: "/admin/configuracoes" },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = user?.tipo === "ADMIN";

  let navItems = navItemsDono;
  if (isAdmin) navItems = navItemsAdmin;
  if (!isAdmin && user?.tipo === "CUIDADOR") navItems = navItemsCuidador;

  let roleLabel = "Dono de Pet";
  if (!isAdmin && user?.tipo === "CUIDADOR") {
    roleLabel = "Cuidador(a) Profissional";
  }
  if (isAdmin) roleLabel = "Administrador";

  const homeDestination = isAdmin ? "/admin" : "/";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 h-screen overflow-hidden flex font-display">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu lateral"
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setSidebarOpen(false);
            }
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        flex flex-col justify-between h-full shadow-sm
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
            <Link
              to={homeDestination}
              className="flex items-center gap-2 text-primary font-bold text-xl"
            >
              <span className="material-icons">pets</span>
              <span>PetFriend</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="material-icons text-[20px]">
                    {item.icon}
                  </span>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          {profileMenuOpen && (
            <div className="mb-2 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <Link
                to="/configuracoes"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setSidebarOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="material-icons text-base">settings</span>
                Configuracoes
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                <span className="material-icons text-base">logout</span>
                Sair
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setProfileMenuOpen((open) => !open)}
            aria-expanded={profileMenuOpen}
            className="flex w-full items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-left"
          >
            {user?.fotoPerfil ? (
              <img
                src={user.fotoPerfil}
                alt="Foto de perfil"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <span
                aria-label="Perfil sem foto"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-200 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              >
                <span className="material-icons text-2xl">person</span>
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.nome ?? "Usuário"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                {roleLabel}
              </p>
            </div>
            <span className="material-icons text-slate-400 text-sm">
              {profileMenuOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-8">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            {navItems.find((i) => i.to === location.pathname)?.label ??
              "Painel"}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
              <span className="material-icons">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900" />
            </button>
            <button
              className="lg:hidden p-2 text-slate-600"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-icons">menu</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
