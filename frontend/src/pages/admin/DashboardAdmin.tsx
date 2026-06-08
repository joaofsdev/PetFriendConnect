import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obterDashboard, type DashboardData } from "../../services/admin";

export default function DashboardAdmin() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    obterDashboard()
      .then((res) => setData(res.data))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons animate-spin text-4xl text-slate-400">progress_activity</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
        <p className="text-red-600 dark:text-red-400">{erro}</p>
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { label: "Total Usuários", value: data.totalUsuarios, icon: "group", color: "text-blue-600" },
    { label: "Donos", value: data.totalDonos, icon: "person", color: "text-green-600" },
    { label: "Cuidadores", value: data.totalCuidadores, icon: "volunteer_activism", color: "text-purple-600" },
    { label: "Pets", value: data.totalPets, icon: "pets", color: "text-orange-600" },
    { label: "Reservas", value: data.totalReservas, icon: "calendar_month", color: "text-indigo-600" },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Admin</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visão geral da operação da plataforma.</p>
        </div>
      </section>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className={`material-icons text-2xl ${c.color}`}>{c.icon}</span>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Reservas por status */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reservas por Status</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(data.reservasPorStatus).map(([status, count]) => (
            <div key={status} className="rounded-lg border border-slate-100 p-3 text-center dark:border-slate-700">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
              <p className="text-xs text-slate-500 capitalize">{status.toLowerCase().replace("_", " ")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Usuários recentes */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Usuários Recentes</h3>
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {data.usuariosRecentes.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{u.nome}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{u.tipo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Links rápidos */}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/usuarios" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Usuários</Link>
        <Link to="/admin/logs" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Logs</Link>
        <Link to="/admin/denuncias" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Denúncias</Link>
        <Link to="/admin/configuracoes" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Configurações</Link>
      </div>
    </div>
  );
}
