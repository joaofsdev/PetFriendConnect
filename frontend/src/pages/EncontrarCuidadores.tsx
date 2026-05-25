import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarCuidadores, type Cuidador } from "../services/cuidadores";

export default function EncontrarCuidadores() {
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCuidadores();
  }, []);

  async function fetchCuidadores() {
    try {
      setLoading(true);
      const res = await listarCuidadores();
      setCuidadores(res.data);
    } catch {
      setError("Nenhum cuidador disponível no momento.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = cuidadores.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.endereco ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons animate-spin text-primary text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de busca */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-slate-400 text-xl">search</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou localização..."
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="mx-auto h-24 w-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="material-icons text-5xl text-slate-400">person_search</span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">{error}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tente novamente mais tarde.
          </p>
        </div>
      )}

      {!error && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Mostrando{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span>{" "}
              cuidadores
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <span className="material-icons text-5xl text-slate-400 mb-4">search_off</span>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum resultado</h3>
              <p className="mt-1 text-sm text-slate-500">Tente outra busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
                >
                  {/* Avatar + Info */}
                  <div className="p-5 flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {c.fotoPerfil ? (
                        <img src={c.fotoPerfil} alt={c.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-icons text-3xl text-slate-400">person</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{c.nome}</h3>
                      {c.endereco && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="material-icons text-xs">location_on</span>
                          {c.endereco}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Descrição */}
                  {c.descricao && (
                    <div className="px-5 pb-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                        "{c.descricao}"
                      </p>
                    </div>
                  )}

                  {/* Serviços */}
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {c.servicosCriados.length > 0 ? (
                      c.servicosCriados.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-1 text-xs font-medium rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        >
                          {s.nome} - R$ {Number(s.preco).toFixed(2)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sem serviços cadastrados</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to={`/perfil-cuidador/${c.id}`}
                      className="block w-full py-2.5 text-center bg-white dark:bg-transparent border border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
