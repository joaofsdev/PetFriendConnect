import { useCallback, useEffect, useState } from "react";
import {
  listarReservas,
  cancelarReserva,
  type Reserva,
  type StatusReserva,
} from "../services/reservas";

type Tab = "proximas" | "concluidas" | "canceladas" | "todas";

const tabs: { key: Tab; label: string }[] = [
  { key: "proximas", label: "Próximas" },
  { key: "concluidas", label: "Concluídas" },
  { key: "canceladas", label: "Canceladas" },
  { key: "todas", label: "Todas" },
];

const statusConfig: Record<StatusReserva, { label: string; dot: string; badge: string }> = {
  CONFIRMADA: {
    label: "Confirmada",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  },
  PENDENTE: {
    label: "Pendente",
    dot: "bg-yellow-500 animate-pulse",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  },
  CONCLUIDA: {
    label: "Concluída",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  CANCELADA: {
    label: "Cancelada",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  },
};

function filterByTab(reservas: Reserva[], tab: Tab): Reserva[] {
  if (tab === "proximas") return reservas.filter((r) => r.status === "CONFIRMADA" || r.status === "PENDENTE");
  if (tab === "concluidas") return reservas.filter((r) => r.status === "CONCLUIDA");
  if (tab === "canceladas") return reservas.filter((r) => r.status === "CANCELADA");
  return reservas;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Data não definida";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MinhasReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("proximas");

  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listarReservas();
      setReservas(res.data);
    } catch {
      setError("Erro ao carregar reservas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchReservas();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchReservas]);

  async function handleCancel(id: number) {
    if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;
    try {
      const res = await cancelarReserva(id);
      setReservas((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    } catch {
      setError("Erro ao cancelar reserva.");
    }
  }

  const filtered = filterByTab(reservas, activeTab);
  const proximasCount = filterByTab(reservas, "proximas").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons animate-spin text-primary text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meus Agendamentos</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
          Gerencie seus próximos serviços e histórico de cuidados.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
              {tab.key === "proximas" && proximasCount > 0 && (
                <span className="bg-primary text-white py-0.5 px-2 rounded-full text-xs">{proximasCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="mx-auto h-24 w-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="material-icons text-5xl text-slate-400">event_busy</span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum agendamento encontrado</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Não há agendamentos nesta categoria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reserva) => {
            const st = statusConfig[reserva.status];
            const isCanceled = reserva.status === "CANCELADA";
            const isDone = reserva.status === "CONCLUIDA";

            return (
              <div
                key={reserva.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  isCanceled ? "border-slate-200 dark:border-slate-800 opacity-60" : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${st.dot}`} />
                        {st.label}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="material-icons text-sm">event</span>
                        {formatDate(reserva.dataInicio)}
                      </span>
                    </div>
                    {reserva.servico && (
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        R$ {Number(reserva.servico.preco).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    {/* Cuidador */}
                    {reserva.cuidador && (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                          {reserva.cuidador.fotoPerfil ? (
                            <img src={reserva.cuidador.fotoPerfil} alt={reserva.cuidador.nome} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-icons text-2xl text-slate-400">person</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{reserva.cuidador.nome}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Cuidador</p>
                        </div>
                      </div>
                    )}

                    <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

                    {/* Serviço e pet */}
                    <div className="flex-1 space-y-1">
                      {reserva.servico && (
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className="material-icons text-primary text-lg">miscellaneous_services</span>
                          <span className="font-medium">{reserva.servico.nome}</span>
                        </div>
                      )}
                      {reserva.pet && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="material-icons text-slate-400 text-lg">pets</span>
                          <span>
                            Para: <span className="font-medium text-slate-700 dark:text-slate-300">{reserva.pet.nome}</span>{" "}
                            ({reserva.pet.raca})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    {!isCanceled && !isDone && (
                      <button
                        onClick={() => handleCancel(reserva.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 dark:bg-transparent dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
