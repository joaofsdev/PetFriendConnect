export default function AdminUsuarios() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Usuários</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Monitore contas, papéis e status de acesso.</p>
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center">
        <span className="material-icons text-5xl text-slate-300">group</span>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Nenhum dado disponível</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          O endpoint de listagem de usuários para administração ainda não foi implementado no backend.
        </p>
      </div>
    </div>
  );
}
