import { useEffect, useState } from "react";
import { listarConfiguracoes, atualizarConfiguracao, type Configuracao } from "../../services/admin";

export default function AdminConfiguracoes() {
  const [configs, setConfigs] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [editados, setEditados] = useState<Record<string, string>>({});

  const carregar = () => {
    setLoading(true);
    listarConfiguracoes()
      .then((res) => {
        setConfigs(res.data);
        setEditados(Object.fromEntries(res.data.map((c) => [c.chave, c.valor])));
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    setErro("");
    setSucesso("");
    try {
      const alterados = configs.filter((c) => editados[c.chave] !== c.valor);
      for (const c of alterados) {
        await atualizarConfiguracao(c.chave, editados[c.chave]);
      }
      setSucesso(`${alterados.length} configuração(ões) salva(s) com sucesso.`);
      carregar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons animate-spin text-4xl text-slate-400">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações Globais</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ajuste parâmetros financeiros e operacionais da plataforma.</p>
        </div>
        <button onClick={salvar} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Salvar alterações</button>
      </section>

      {erro && <p className="text-sm text-red-500">{erro}</p>}
      {sucesso && <p className="text-sm text-green-600">{sucesso}</p>}

      {configs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <span className="material-icons text-5xl text-slate-300">settings</span>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Nenhuma configuração cadastrada</h3>
          <p className="mt-2 text-sm text-slate-500">Adicione configurações ao banco de dados para gerenciá-las aqui.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {configs.map((c) => (
              <div key={c.chave} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{c.chave}</p>
                  {c.descricao && <p className="text-xs text-slate-500">{c.descricao}</p>}
                </div>
                <input
                  value={editados[c.chave] ?? ""}
                  onChange={(e) => setEditados((prev) => ({ ...prev, [c.chave]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-64 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
