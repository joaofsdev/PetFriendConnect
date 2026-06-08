import { useEffect, useState } from "react";
import { listarDenuncias, atualizarDenuncia, type Denuncia } from "../../services/admin";

const STATUS_OPTIONS = ["PENDENTE", "EM_ANALISE", "RESOLVIDA", "REJEITADA"] as const;
const STATUS_COLORS: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  EM_ANALISE: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  RESOLVIDA: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJEITADA: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function AdminDenuncias() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editando, setEditando] = useState<Denuncia | null>(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [resolucao, setResolucao] = useState("");

  const carregar = (p = page) => {
    setLoading(true);
    const params: Record<string, string> = { page: String(p), limit: "15" };
    if (filtroStatus) params.status = filtroStatus;

    listarDenuncias(params)
      .then((res) => {
        setDenuncias(res.data.denuncias);
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(1); }, [filtroStatus]);

  const abrirEdicao = (d: Denuncia) => {
    setEditando(d);
    setNovoStatus(d.status);
    setResolucao(d.resolucao ?? "");
  };

  const salvar = async () => {
    if (!editando) return;
    try {
      await atualizarDenuncia(editando.id, { status: novoStatus, resolucao: resolucao || undefined });
      setEditando(null);
      carregar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Denúncias</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe moderação e prioridade de análise.</p>
      </section>

      <div className="flex items-center gap-3">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {erro && <p className="text-sm text-red-500">{erro}</p>}

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="material-icons animate-spin text-3xl text-slate-400">progress_activity</span>
        </div>
      ) : denuncias.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <span className="material-icons text-5xl text-slate-300">report</span>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Nenhuma denúncia encontrada</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {denuncias.map((d) => (
            <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{d.motivo}</p>
                  {d.descricao && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d.descricao}</p>}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>De: <strong>{d.denunciante.nome}</strong></span>
                    <span>Contra: <strong>{d.denunciado.nome}</strong></span>
                    <span>{new Date(d.dataCriacao).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[d.status] ?? ""}`}>{d.status.replace("_", " ")}</span>
                  <button onClick={() => abrirEdicao(d)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                    <span className="material-icons text-lg">edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => carregar(page - 1)} disabled={page <= 1} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-700">Anterior</button>
          <span className="text-sm text-slate-600 dark:text-slate-400">Página {page} de {totalPages}</span>
          <button onClick={() => carregar(page + 1)} disabled={page >= totalPages} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-700">Próxima</button>
        </div>
      )}

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Atualizar Denúncia #{editando.id}</h3>
            <div className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600 dark:text-slate-300">Status</span>
                <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600 dark:text-slate-300">Resolução</span>
                <textarea value={resolucao} onChange={(e) => setResolucao(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditando(null)} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Cancelar</button>
              <button onClick={salvar} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
