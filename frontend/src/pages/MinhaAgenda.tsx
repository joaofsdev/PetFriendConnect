import { useEffect, useState, type SyntheticEvent } from "react";
import {
  adicionarSlot,
  deletarSlot,
  listarMinhaAgenda,
  type AgendaSlot,
} from "../services/agenda";
import { listarMeusServicos, type Servico } from "../services/servicos";

type SlotStatus = "disponivel" | "agendado";

interface DisplaySlot {
  id: number;
  data: string;
  status: SlotStatus;
  servicoNome: string;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MINUTE_OPTIONS = [0, 15, 30, 45];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toLocalDateTimeValue(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

function formatDateTimeLabel(value: string) {
  if (!value) return "Selecione data e hora";

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MinhaAgenda() {
  const now = new Date();
  const nextHour = now.getHours() + 1 > 23 ? 9 : now.getHours() + 1;

  const [slots, setSlots] = useState<DisplaySlot[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [formData, setFormData] = useState("");
  const [formServico, setFormServico] = useState<number | "">("");
  const [formError, setFormError] = useState("");

  const [visibleYear, setVisibleYear] = useState(now.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const [draftYear, setDraftYear] = useState(now.getFullYear());
  const [draftMonth, setDraftMonth] = useState(now.getMonth());
  const [draftDay, setDraftDay] = useState(now.getDate());
  const [draftHour, setDraftHour] = useState(nextHour);
  const [draftMinute, setDraftMinute] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [agendaRes, servicosRes] = await Promise.all([
          listarMinhaAgenda(),
          listarMeusServicos(),
        ]);

        setSlots(
          agendaRes.data.map((slot: AgendaSlot) => ({
            id: slot.id,
            data: slot.data,
            status: slot.disponivel ? "disponivel" : "agendado",
            servicoNome: slot.servico.nome,
          })),
        );
        setServicos(servicosRes.data.filter((servico) => servico.ativo));
      } catch {
        setFormError("Erro ao carregar agenda.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const selectedDateKey = `${visibleYear}-${pad(visibleMonth + 1)}-${pad(selectedDay)}`;
  const selectedDaySlots = slots.filter((slot) =>
    slot.data.startsWith(selectedDateKey),
  );

  function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    const prevDays = new Date(year, month, 0).getDate();
    const days: { day: number; current: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i -= 1) {
      days.push({ day: prevDays - i, current: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({ day, current: true });
    }

    return days;
  }

  function prevMonth() {
    if (visibleMonth === 0) {
      setVisibleYear((year) => year - 1);
      setVisibleMonth(11);
      return;
    }

    setVisibleMonth((month) => month - 1);
  }

  function nextMonth() {
    if (visibleMonth === 11) {
      setVisibleYear((year) => year + 1);
      setVisibleMonth(0);
      return;
    }

    setVisibleMonth((month) => month + 1);
  }

  function moveDraftMonth(direction: -1 | 1) {
    const nextDate = new Date(draftYear, draftMonth + direction, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonthValue = nextDate.getMonth();

    setDraftYear(nextYear);
    setDraftMonth(nextMonthValue);
    setDraftDay((day) =>
      Math.min(day, getDaysInMonth(nextYear, nextMonthValue)),
    );
  }

  function hasSlotsOnDay(day: number) {
    const key = `${visibleYear}-${pad(visibleMonth + 1)}-${pad(day)}`;
    return slots.some((slot) => slot.data.startsWith(key));
  }

  function openNewDateModal() {
    const baseDate = new Date(visibleYear, visibleMonth, selectedDay);
    setDraftYear(baseDate.getFullYear());
    setDraftMonth(baseDate.getMonth());
    setDraftDay(baseDate.getDate());
    setDraftHour(nextHour);
    setDraftMinute(0);
    setFormData("");
    setFormServico("");
    setFormError("");
    setDatePickerOpen(false);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setDatePickerOpen(false);
    setFormError("");
  }

  function confirmDate() {
    setFormData(
      toLocalDateTimeValue(
        draftYear,
        draftMonth,
        draftDay,
        draftHour,
        draftMinute,
      ),
    );
    setDatePickerOpen(false);
    setFormError("");
  }

  async function handleAddSlot(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formData || !formServico) {
      setFormError("Preencha todos os campos.");
      return;
    }

    try {
      const res = await adicionarSlot({
        servicoId: Number(formServico),
        data: formData,
      });
      setSlots((prev) => [
        ...prev,
        {
          id: res.data.id,
          data: res.data.data,
          status: "disponivel",
          servicoNome: res.data.servico.nome,
        },
      ]);
      closeModal();
      setFormData("");
      setFormServico("");
    } catch {
      setFormError("Erro ao adicionar data.");
    }
  }

  async function handleDeleteSlot(id: number) {
    try {
      await deletarSlot(id);
      setSlots((prev) => prev.filter((slot) => slot.id !== id));
    } catch {
      setFormError("Erro ao remover data.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons animate-spin text-primary text-4xl">
          refresh
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Minha Agenda
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gerencie seus horarios disponiveis.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewDateModal}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          <span className="material-icons mr-2 text-lg">add</span>
          Nova Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">
              {MONTH_NAMES[visibleMonth]} {visibleYear}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-icons text-sm">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {getCalendarDays(visibleYear, visibleMonth).map((day, index) => {
              const isSelected = day.current && day.day === selectedDay;
              const hasSlots = day.current && hasSlotsOnDay(day.day);

              return (
                <button
                  key={`${day.current ? "c" : "o"}-${day.day}-${index}`}
                  type="button"
                  disabled={!day.current}
                  onClick={() => day.current && setSelectedDay(day.day)}
                  className={`relative rounded p-2 transition-colors ${
                    !day.current
                      ? "text-slate-300 dark:text-slate-600"
                      : isSelected
                        ? "bg-primary text-white shadow-md"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {day.day}
                  {hasSlots && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
            {selectedDay} de {MONTH_NAMES[visibleMonth]}
          </h3>
          {selectedDaySlots.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Nenhuma data neste dia.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    slot.status === "disponivel"
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {slot.servicoNome}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(slot.data).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <span
                      className={`text-xs font-semibold ${
                        slot.status === "disponivel"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {slot.status === "disponivel" ? "Disponivel" : "Agendado"}
                    </span>
                  </div>
                  {slot.status === "disponivel" && (
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeleteSlot(slot.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remover"
                    >
                      <span className="material-icons text-lg">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Nova Data
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleAddSlot} className="space-y-4 p-6">
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="slot-data"
                >
                  Data e Hora
                </label>
                <button
                  id="slot-data"
                  type="button"
                  onClick={() => setDatePickerOpen((open) => !open)}
                  className={`flex w-full items-center justify-between rounded-lg border bg-white p-2.5 text-left text-sm dark:bg-slate-800 ${
                    formData
                      ? "border-slate-300 text-slate-900 dark:border-slate-700 dark:text-white"
                      : "border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                  }`}
                >
                  <span>{formatDateTimeLabel(formData)}</span>
                  <span className="material-icons text-lg">calendar_month</span>
                </button>

                {datePickerOpen && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {MONTH_NAMES[draftMonth]} {draftYear}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveDraftMonth(-1)}
                          className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <span className="material-icons text-base">
                            chevron_left
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDraftMonth(1)}
                          className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <span className="material-icons text-base">
                            chevron_right
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
                      {WEEKDAYS.map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
                      {getCalendarDays(draftYear, draftMonth).map(
                        (day, index) => {
                          const isDraftSelected =
                            day.current && day.day === draftDay;

                          return (
                            <button
                              key={`${day.current ? "d" : "p"}-${day.day}-${index}`}
                              type="button"
                              disabled={!day.current}
                              onClick={() => setDraftDay(day.day)}
                              className={`rounded p-2 transition-colors ${
                                !day.current
                                  ? "text-slate-300 dark:text-slate-600"
                                  : isDraftSelected
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                              }`}
                            >
                              {day.day}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Hora
                        <select
                          value={draftHour}
                          onChange={(event) =>
                            setDraftHour(Number(event.target.value))
                          }
                          className="mt-1 w-full rounded-lg border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {Array.from({ length: 24 }, (_, hour) => (
                            <option key={hour} value={hour}>
                              {pad(hour)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Minuto
                        <select
                          value={draftMinute}
                          onChange={(event) =>
                            setDraftMinute(Number(event.target.value))
                          }
                          className="mt-1 w-full rounded-lg border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {MINUTE_OPTIONS.map((minute) => (
                            <option key={minute} value={minute}>
                              {pad(minute)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={confirmDate}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                    >
                      <span className="material-icons text-base">check</span>
                      Confirmar data
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="slot-servico"
                >
                  Servico
                </label>
                <select
                  id="slot-servico"
                  value={formServico}
                  onChange={(event) =>
                    setFormServico(
                      event.target.value ? Number(event.target.value) : "",
                    )
                  }
                  className="w-full rounded-lg border-slate-300 bg-white p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Selecione...</option>
                  {servicos.map((servico) => (
                    <option key={servico.id} value={servico.id}>
                      {servico.nome}
                    </option>
                  ))}
                </select>
                {servicos.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
                    Cadastre um servico antes de criar datas na agenda.
                  </p>
                )}
              </div>

              {formError && <div className="text-sm text-red-500">{formError}</div>}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formData || !formServico}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
