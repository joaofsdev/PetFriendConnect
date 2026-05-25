import { Link } from "react-router-dom";

export default function DashboardAdmin() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Admin</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visão geral da operação da plataforma.</p>
        </div>
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center">
        <span className="material-icons text-5xl text-slate-300">construction</span>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Em desenvolvimento</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Os endpoints de administração ainda não foram implementados no backend. Os dados serão exibidos aqui quando a API estiver disponível.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/admin/usuarios" className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Usuários</Link>
          <Link to="/admin/logs" className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Logs</Link>
          <Link to="/admin/denuncias" className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Denúncias</Link>
        </div>
      </div>
    </div>
  );
}
