import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navItemsDono = [
  { icon: "dashboard", label: "Painel", to: "/dashboard/dono" },
  { icon: "pets", label: "Meus Pets", to: "/meus-pets" },
  { icon: "search", label: "Cuidadores", to: "/encontrar-cuidadores" },
  { icon: "assignment", label: "Minhas Reservas", to: "/minhas-reservas" },
  { icon: "settings", label: "Configurações", to: "/configuracoes" },
];

const navItemsCuidador = [
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

const navItemsAdmin = [
  { icon: "dashboard", label: "Painel", to: "/admin" },
  { icon: "people", label: "Usuários", to: "/admin/usuarios" },
  { icon: "flag", label: "Denúncias", to: "/admin/denuncias" },
  { icon: "receipt_long", label: "Logs", to: "/admin/logs" },
  { icon: "settings", label: "Configurações", to: "/admin/configuracoes" },
];

export default function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const navItems =
    user?.role === "admin"
      ? navItemsAdmin
      : user?.role === "cuidador"
        ? navItemsCuidador
        : navItemsDono;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 h-screen overflow-hidden flex font-display">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
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
              to="/"
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
                  {"badge" in item && item.badge && (
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
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <img
              src="https://i.pravatar.cc/150?img=47"
              alt="Foto de perfil"
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.name ?? "Usuário"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                {user?.role === "cuidador"
                  ? "Cuidador(a) Profissional"
                  : user?.role === "admin"
                    ? "Administrador"
                    : "Dono de Pet"}
              </p>
            </div>
            <span className="material-icons text-slate-400 text-sm">
              expand_more
            </span>
          </div>
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
