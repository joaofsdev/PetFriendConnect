import { useCallback, useEffect, useState } from "react";
import { listarUsuarios, desativarUsuario, ativarUsuario, editarUsuario, type UsuarioAdmin } from "../../services/admin";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal de edição
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [formEdit, setFormEdit] = useState({ nome: "", email: "", tipo: "" as string });
  const [editErro, setEditErro] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const carregar = useCallback((p: number) => {
    setLoading(true);
    const params: Record<string, string> = { page: String(p), limit: "15" };
    if (filtroTipo) params.tipo = filtroTipo;
    if (buscaAplicada) params.busca = buscaAplicada;

    listarUsuarios(params)
      .then((res) => {
        setUsuarios(res.data.usuarios);
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [buscaAplicada, filtroTipo]);

  useEffect(() => {
    const timer = window.setTimeout(() => carregar(1), 0);
    return () => window.clearTimeout(timer);
  }, [carregar]);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (buscaAplicada === busca) {
      carregar(1);
      return;
    }
    setBuscaAplicada(busca);
  };

  const toggleAtivo = async (u: UsuarioAdmin) => {
    try {
      if (u.ativo) await desativarUsuario(u.id);
      else await ativarUsuario(u.id);
      carregar(page);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  };

  const abrirEdicao = (u: UsuarioAdmin) => {
    setEditando(u);
    setFormEdit({ nome: u.nome, email: u.email, tipo: u.tipo });
    setEditErro("");
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setEditLoading(true);
    setEditErro("");
    try {
      const dados: Record<string, string> = {};
      if (formEdit.nome !== editando.nome) dados.nome = formEdit.nome;
      if (formEdit.email !== editando.email) dados.email = formEdit.email;
      if (formEdit.tipo !== editando.tipo) dados.tipo = formEdit.tipo;
      if (Object.keys(dados).length === 0) { setEditando(null); return; }
      await editarUsuario(editando.id, dados);
      setEditando(null);
      carregar(page);
    } catch (err: unknown) {
      setEditErro(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Usuários</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Monitore contas, papéis e status de acesso.</p>
      </section>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleBusca} className="flex gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Buscar</button>
        </form>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">Todos os tipos</option>
          <option value="DONO">Dono</option>
          <option value="CUIDADOR">Cuidador</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {erro && <p className="text-sm text-red-500">{erro}</p>}

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="material-icons animate-spin text-3xl text-slate-400">progress_activity</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.nome}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">{u.tipo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${u.ativo ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.dataCriacao).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => abrirEdicao(u)}
                      className="rounded px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleAtivo(u)}
                      className={`rounded px-2 py-1 text-xs font-medium ${u.ativo ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400" : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"}`}
                    >
                      {u.ativo ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => carregar(page - 1)} disabled={page <= 1} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-700">Anterior</button>
          <span className="text-sm text-slate-600 dark:text-slate-400">Página {page} de {totalPages}</span>
          <button onClick={() => carregar(page + 1)} disabled={page >= totalPages} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-700">Próxima</button>
        </div>
      )}

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditando(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Editar Usuário</h3>
            {editErro && <p className="mb-3 text-sm text-red-500">{editErro}</p>}
            <form onSubmit={salvarEdicao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                <input
                  value={formEdit.nome}
                  onChange={(e) => setFormEdit((f) => ({ ...f, nome: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={formEdit.email}
                  onChange={(e) => setFormEdit((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                <select
                  value={formEdit.tipo}
                  onChange={(e) => setFormEdit((f) => ({ ...f, tipo: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  disabled={editando.tipo === "ADMIN"}
                >
                  <option value="DONO">Dono</option>
                  <option value="CUIDADOR">Cuidador</option>
                  {editando.tipo === "ADMIN" && <option value="ADMIN">Admin</option>}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditando(null)} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Cancelar</button>
                <button type="submit" disabled={editLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  {editLoading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
