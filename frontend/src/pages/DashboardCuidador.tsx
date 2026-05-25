import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listarReservas, type Reserva } from "../services/reservas";
import { listarMinhaAgenda, type AgendaSlot } from "../services/agenda";

export default function DashboardCuidador() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [agenda, setAgenda] = useState<AgendaSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [reservasRes, agendaRes] = await Promise.all([
          listarReservas(),
          listarMinhaAgenda(),
        ]);
        setReservas(reservasRes.data);
        setAgenda(agendaRes.data);
      } catch { /* empty */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const reservasAtivas = reservas.filter(
    (r) => r.status === "PENDENTE" || r.status === "CONFIRMADA",
  );
  const slotsDisponiveis = agenda.filter((s) => s.disponivel);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons animate-spin text-primary text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Olá, {user?.nome ?? "Cuidador"}! 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Aqui está um resumo da sua agenda e atendimentos.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Agendamentos Ativos</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{reservasAtivas.length}</h3>
            <p className="text-xs font-medium mt-2 text-green-600 flex items-center gap-1">
              <span className="material-icons text-[16px]">trending_up</span>
              Em andamento
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <span className="material-icons">event_available</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Slots Disponíveis</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{slotsDisponiveis.length}</h3>
            <p className="text-xs font-medium mt-2 text-slate-500">Na sua agenda</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600">
            <span className="material-icons">date_range</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total de Reservas</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{reservas.length}</h3>
            <p className="text-xs font-medium mt-2 text-slate-500">{reservas.filter((r) => r.status === "CONCLUIDA").length} concluídas</p>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600">
            <span className="material-icons">attach_money</span>
          </div>
        </div>
      </div>

      {/* Próximos Atendimentos */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white">Próximos Atendimentos</h2>
        </div>

        {reservasAtivas.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons text-4xl text-slate-300">event_busy</span>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nenhum atendimento agendado no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservasAtivas.map((r) => (
              <div key={r.id} className="flex items-start gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-primary">pets</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{r.pet?.nome ?? "Pet"}</h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === "CONFIRMADA" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {r.status === "CONFIRMADA" ? "Confirmado" : "Pendente"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {r.servico?.nome ?? "Serviço"} • Dono: {r.dono?.nome ?? "—"}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-[14px] text-slate-400">schedule</span>
                      {r.agenda?.data ? new Date(r.agenda.data).toLocaleDateString("pt-BR") : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
