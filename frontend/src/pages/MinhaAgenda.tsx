import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { listarMinhaAgenda, adicionarSlot, deletarSlot, type AgendaSlot } from "../services/agenda";
import { listarCuidadores, type Servico } from "../services/cuidadores";
import { useAuth } from "../contexts/AuthContext";

type SlotStatus = "disponivel" | "agendado";

interface DisplaySlot {
  id: number;
  data: string;
  status: SlotStatus;
  servicoNome: string;
}

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function MinhaAgenda() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<DisplaySlot[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState("");
  const [formServico, setFormServico] = useState<number | "">("");
  const [formError, setFormError] = useState("");

  const now = new Date();
  const [visibleYear, setVisibleYear] = useState(now.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  useEffect(() => {
    async function load() {
      try {
        const [agendaRes, cuidadoresRes] = await Promise.all([
          listarMinhaAgenda(),
          listarCuidadores(),
        ]);
        const agendaData = agendaRes.data;
        setSlots(agendaData.map((s: AgendaSlot) => ({
          id: s.id,
          data: s.data,
          status: s.disponivel ? "disponivel" : "agendado",
          servicoNome: s.servico.nome,
        })));
        if (user) {
          const me = cuidadoresRes.data.find((c) => c.id === user.id);
          if (me) setServicos(me.servicosCriados);
        }
      } catch { /* empty */ } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const selectedDateKey = `${visibleYear}-${String(visibleMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  const selectedDaySlots = slots.filter((s) => s.data.startsWith(selectedDateKey));

  function getCalendarDays() {
    const firstDay = new Date(visibleYear, visibleMonth, 1).getDay();
    const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
    const prevDays = new Date(visibleYear, visibleMonth, 0).getDate();
    const days: { day: number; current: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevDays - i, current: false });
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, current: true });
    return days;
  }

  function prevMonth() {
    if (visibleMonth === 0) { setVisibleYear((y) => y - 1); setVisibleMonth(11); }
    else setVisibleMonth((m) => m - 1);
  }
  function nextMonth() {
    if (visibleMonth === 11) { setVisibleYear((y) => y + 1); setVisibleMonth(0); }
    else setVisibleMonth((m) => m + 1);
  }

  function hasSlotsOnDay(day: number) {
    const key = `${visibleYear}-${String(visibleMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return slots.some((s) => s.data.startsWith(key));
  }

  async function handleAddSlot(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData || !formServico) { setFormError("Preencha todos os campos."); return; }
    try {
      const res = await adicionarSlot({ servicoId: Number(formServico), data: formData });
      setSlots((prev) => [...prev, { id: res.data.id, data: res.data.data, status: "disponivel", servicoNome: res.data.servico.nome }]);
      setShowModal(false);
      setFormData("");
      setFormServico("");
      setFormError("");
    } catch {
      setFormError("Erro ao adicionar slot.");
    }
  }

  async function handleDeleteSlot(id: number) {
    try {
      await deletarSlot(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch { /* empty */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons animate-spin text-primary text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Minha Agenda</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie seus horários disponíveis.</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-blue-600 transition-colors">
          <span className="material-icons mr-2 text-lg">add</span>Novo Slot
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-slate-900 dark:text-white">{MONTH_NAMES[visibleMonth]} {visibleYear}</span>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><span className="material-icons text-sm">chevron_left</span></button>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><span className="material-icons text-sm">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400">
            {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {getCalendarDays().map((d) => {
              const isSelected = d.current && d.day === selectedDay;
              const hasSlots = d.current && hasSlotsOnDay(d.day);
              return (
                <button
                  key={`${d.current ? "c" : "o"}-${d.day}`}
                  disabled={!d.current}
                  onClick={() => d.current && setSelectedDay(d.day)}
                  className={`p-2 rounded relative transition-colors ${!d.current ? "text-slate-300 dark:text-slate-600" : isSelected ? "bg-primary text-white shadow-md" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"}`}
                >
                  {d.day}
                  {hasSlots && !isSelected && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">{selectedDay} de {MONTH_NAMES[visibleMonth]}</h3>
          {selectedDaySlots.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhum slot neste dia.</p>
          ) : (
            <div className="space-y-3">
              {selectedDaySlots.map((slot) => (
                <div key={slot.id} className={`flex items-center justify-between p-3 rounded-lg border ${slot.status === "disponivel" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{slot.servicoNome}</p>
                    <p className="text-xs text-slate-500">{new Date(slot.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                    <span className={`text-xs font-semibold ${slot.status === "disponivel" ? "text-green-600" : "text-blue-600"}`}>
                      {slot.status === "disponivel" ? "Disponível" : "Agendado"}
                    </span>
                  </div>
                  {slot.status === "disponivel" && (
                    <button onClick={() => handleDeleteSlot(slot.id)} className="text-red-400 hover:text-red-600 p-1" title="Remover">
                      <span className="material-icons text-lg">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Novo Slot</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><span className="material-icons">close</span></button>
            </div>
            <form onSubmit={handleAddSlot} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="slot-data">Data e Hora</label>
                <input id="slot-data" type="datetime-local" value={formData} onChange={(e) => setFormData(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="slot-servico">Serviço</label>
                <select id="slot-servico" value={formServico} onChange={(e) => setFormServico(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-2.5">
                  <option value="">Selecione...</option>
                  {servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              {formError && <div className="text-sm text-red-500">{formError}</div>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-medium">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
