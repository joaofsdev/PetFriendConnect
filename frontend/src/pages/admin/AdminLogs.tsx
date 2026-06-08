import { useEffect, useState } from "react";
import { listarLogs, type LogAdmin } from "../../services/admin";

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroAcao, setFiltroAcao] = useState("");

  const carregar = (p = page) => {
    setLoading(true);
    const params: Record<string, string> = { page: String(p), limit: "30" };
    if (filtroAcao) params.acao = filtroAcao;

    listarLogs(params)
      .then((res) => {
        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(1); }, [filtroAcao]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Logs de Auditoria</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Histórico de ações sensíveis executadas na plataforma.</p>
      </section>

      <div className="flex items-center gap-3">
        <input
          value={filtroAcao}
          onChange={(e) => setFiltroAcao(e.target.value)}
          placeholder="Filtrar por ação..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </div>

      {erro && <p className="text-sm text-red-500">{erro}</p>}

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="material-icons animate-spin text-3xl text-slate-400">progress_activity</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <span className="material-icons text-5xl text-slate-300">receipt_long</span>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Nenhum log encontrado</h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Ação</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(l.dataLog).toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white">{l.usuario.nome}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-700">{l.acao}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{l.descricao ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => carregar(page - 1)} disabled={page <= 1} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-700">Anterior</button>
          <span className="text-sm text-slate-600 dark:text-slate-400">Página {page} de {totalPages}</span>
          <button onClick={() => carregar(page + 1)} disabled={page >= totalPages} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-700">Próxima</button>
        </div>
      )}
    </div>
  );
}
