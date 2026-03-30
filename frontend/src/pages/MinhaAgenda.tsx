import { useMemo, useState } from "react";
import type { SyntheticEvent } from "react";

type SlotStatus = "disponivel" | "agendado" | "indisponivel";

interface DaySlot {
  id: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  petName?: string;
}

interface CalendarCell {
  day: number;
  monthOffset: -1 | 0 | 1;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
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

const statusConfig: Record<
  SlotStatus,
  {
    label: string;
    badgeClass: string;
    stripeClass: string;
  }
> = {
  disponivel: {
    label: "Disponivel",
    badgeClass:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    stripeClass: "bg-green-500",
  },
  agendado: {
    label: "Agendado",
    badgeClass: "bg-primary/10 text-primary",
    stripeClass: "bg-primary",
  },
  indisponivel: {
    label: "Indisponivel",
    badgeClass:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    stripeClass: "bg-slate-400",
  },
};

function normalizeTime(raw: string): string {
  return raw.length === 5 ? raw : "09:00";
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getMonthGrid(year: number, month: number): CalendarCell[] {
  const firstWeekDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = firstWeekDay - 1; i >= 0; i -= 1) {
    cells.push({ day: daysInPreviousMonth - i, monthOffset: -1 });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, monthOffset: 0 });
  }

  const nextMonthDaysToFill = 42 - cells.length;
  for (let day = 1; day <= nextMonthDaysToFill; day += 1) {
    cells.push({ day, monthOffset: 1 });
  }

  return cells;
}

function buildInitialSlots(today: Date): Record<string, DaySlot[]> {
  const year = today.getFullYear();
  const month = today.getMonth();

  return {
    [toDateKey(year, month, 2)]: [
      { id: 1, startTime: "09:00", endTime: "10:00", status: "disponivel" },
    ],
    [toDateKey(year, month, 3)]: [
      {
        id: 2,
        startTime: "14:00",
        endTime: "15:00",
        status: "agendado",
        petName: "Thor",
      },
    ],
    [toDateKey(year, month, 5)]: [
      {
        id: 3,
        startTime: "08:00",
        endTime: "18:00",
        status: "indisponivel",
      },
    ],
    [toDateKey(year, month, 9)]: [
      { id: 4, startTime: "08:00", endTime: "09:00", status: "disponivel" },
      { id: 5, startTime: "13:00", endTime: "15:00", status: "disponivel" },
    ],
    [toDateKey(year, month, 10)]: [
      { id: 6, startTime: "08:00", endTime: "09:00", status: "disponivel" },
      {
        id: 7,
        startTime: "10:00",
        endTime: "11:00",
        status: "agendado",
        petName: "Luna",
      },
      { id: 8, startTime: "13:00", endTime: "17:00", status: "disponivel" },
    ],
    [toDateKey(year, month, 12)]: [
      {
        id: 9,
        startTime: "00:00",
        endTime: "23:59",
        status: "indisponivel",
      },
    ],
  };
}

export default function MinhaAgenda() {
  const now = new Date();

  const [visibleYear, setVisibleYear] = useState(now.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const [slotsByDate, setSlotsByDate] = useState<Record<string, DaySlot[]>>(
    () => buildInitialSlots(now),
  );

  const [rangeStart, setRangeStart] = useState(
    toDateKey(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const [rangeEnd, setRangeEnd] = useState(
    toDateKey(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("12:00");
  const [selectedStatus, setSelectedStatus] =
    useState<SlotStatus>("disponivel");
  const [repeatWeekly, setRepeatWeekly] = useState(false);

  const monthGrid = useMemo(
    () => getMonthGrid(visibleYear, visibleMonth),
    [visibleYear, visibleMonth],
  );

  const selectedDateKey = useMemo(
    () => toDateKey(visibleYear, visibleMonth, selectedDay),
    [visibleYear, visibleMonth, selectedDay],
  );

  const selectedDate = useMemo(
    () => new Date(visibleYear, visibleMonth, selectedDay),
    [visibleYear, visibleMonth, selectedDay],
  );

  const selectedDaySlots = slotsByDate[selectedDateKey] ?? [];

  function getDayPreview(day: number): DaySlot[] {
    return slotsByDate[toDateKey(visibleYear, visibleMonth, day)] ?? [];
  }

  function goToPreviousMonth() {
    if (visibleMonth === 0) {
      setVisibleMonth(11);
      setVisibleYear((prev) => prev - 1);
      return;
    }
    setVisibleMonth((prev) => prev - 1);
  }

  function goToNextMonth() {
    if (visibleMonth === 11) {
      setVisibleMonth(0);
      setVisibleYear((prev) => prev + 1);
      return;
    }
    setVisibleMonth((prev) => prev + 1);
  }

  function goToToday() {
    setVisibleYear(now.getFullYear());
    setVisibleMonth(now.getMonth());
    setSelectedDay(now.getDate());
    const todayKey = toDateKey(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    setRangeStart(todayKey);
    setRangeEnd(todayKey);
  }

  function getRangeDates(startKey: string, endKey: string): Date[] {
    const start = new Date(startKey);
    const end = new Date(endKey);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    )
      return [];

    const days: Date[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }

  function resetFormToSelectedDay() {
    const key = toDateKey(visibleYear, visibleMonth, selectedDay);
    setRangeStart(key);
    setRangeEnd(key);
    setTimeStart("09:00");
    setTimeEnd("12:00");
    setSelectedStatus("disponivel");
    setRepeatWeekly(false);
  }

  function handleSaveAvailability(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (timeEnd <= timeStart) return;

    const targetDates = getRangeDates(rangeStart, rangeEnd).filter(
      (date) =>
        date.getFullYear() === visibleYear && date.getMonth() === visibleMonth,
    );

    if (targetDates.length === 0) return;

    setSlotsByDate((prev) => {
      const next = { ...prev };
      const allTargetDates = [...targetDates];

      if (repeatWeekly) {
        for (const date of targetDates) {
          const repeated = new Date(date);
          repeated.setDate(repeated.getDate() + 7);
          if (
            repeated.getFullYear() === visibleYear &&
            repeated.getMonth() === visibleMonth
          ) {
            allTargetDates.push(repeated);
          }
        }
      }

      for (const date of allTargetDates) {
        const key = toDateKey(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );
        const slots = next[key] ?? [];

        const newSlot: DaySlot = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          startTime: normalizeTime(timeStart),
          endTime: normalizeTime(timeEnd),
          status: selectedStatus,
        };

        next[key] = [...slots, newSlot].sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        );
      }

      return next;
    });

    resetFormToSelectedDay();
  }

  function removeSlot(slotId: number) {
    setSlotsByDate((prev) => {
      const slots = prev[selectedDateKey] ?? [];
      const remaining = slots.filter((slot) => slot.id !== slotId);

      if (remaining.length === 0) {
        const cloned = { ...prev };
        delete cloned[selectedDateKey];
        return cloned;
      }

      return {
        ...prev,
        [selectedDateKey]: remaining,
      };
    });
  }

  function countByStatus(slots: DaySlot[]): Record<SlotStatus, number> {
    return slots.reduce(
      (acc, slot) => {
        acc[slot.status] += 1;
        return acc;
      },
      { disponivel: 0, agendado: 0, indisponivel: 0 },
    );
  }

  const daySummary = countByStatus(selectedDaySlots);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Minha Agenda
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gerencie seus horarios disponiveis e acompanhe seus atendimentos.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-0">
        <section className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {MONTH_NAMES[visibleMonth]} {visibleYear}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <span className="material-icons text-sm">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday}
                  className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >
                  {weekday}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 bg-slate-200 dark:bg-slate-700 gap-px">
              {monthGrid.map((cell, index) => {
                const isCurrentMonth = cell.monthOffset === 0;
                const isSelected = isCurrentMonth && selectedDay === cell.day;
                const isToday =
                  isCurrentMonth &&
                  visibleYear === now.getFullYear() &&
                  visibleMonth === now.getMonth() &&
                  cell.day === now.getDate();
                let dayNumberClass = "text-slate-400 dark:text-slate-600";

                if (isCurrentMonth) {
                  dayNumberClass = "text-slate-700 dark:text-slate-300";
                }

                if (isToday) {
                  dayNumberClass =
                    "w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white";
                }

                const previews = isCurrentMonth ? getDayPreview(cell.day) : [];
                const summary = countByStatus(previews);

                return (
                  <button
                    key={`${cell.monthOffset}-${cell.day}-${index}`}
                    type="button"
                    onClick={() => {
                      if (!isCurrentMonth) return;
                      setSelectedDay(cell.day);
                      const key = toDateKey(
                        visibleYear,
                        visibleMonth,
                        cell.day,
                      );
                      setRangeStart(key);
                      setRangeEnd(key);
                    }}
                    className={`min-h-[100px] p-2 text-left transition-colors bg-white dark:bg-slate-900 ${
                      isCurrentMonth
                        ? "hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                        : "text-slate-400 dark:text-slate-600"
                    } ${isSelected ? "ring-2 ring-primary ring-inset z-10" : ""}`}
                    disabled={!isCurrentMonth}
                  >
                    <span className={`text-sm font-medium ${dayNumberClass}`}>
                      {cell.day}
                    </span>

                    {isCurrentMonth && previews.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {summary.disponivel > 0 && (
                          <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 truncate border-l-2 border-green-500">
                            {summary.disponivel} livre
                            {summary.disponivel > 1 ? "s" : ""}
                          </div>
                        )}
                        {summary.agendado > 0 && (
                          <div className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary truncate border-l-2 border-primary">
                            {summary.agendado} agendado
                            {summary.agendado > 1 ? "s" : ""}
                          </div>
                        )}
                        {summary.indisponivel > 0 && (
                          <div className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 truncate border-l-2 border-slate-400">
                            Bloqueado
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm px-1">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <span className="text-slate-600 dark:text-slate-400">
                Disponivel
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-primary mr-2" />
              <span className="text-slate-600 dark:text-slate-400">
                Agendado
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-slate-400 mr-2" />
              <span className="text-slate-600 dark:text-slate-400">
                Indisponivel
              </span>
            </div>
          </div>
        </section>

        <aside className="w-full lg:w-[380px] space-y-6 flex flex-col">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center mb-6">
              <span className="material-icons text-primary mr-2">
                edit_calendar
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Definir Disponibilidade
              </h3>
            </div>

            <form className="space-y-4" onSubmit={handleSaveAvailability}>
              <div>
                <label
                  htmlFor="range-start"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Intervalo de Datas
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="range-start"
                    type="date"
                    value={rangeStart}
                    onChange={(event) => setRangeStart(event.target.value)}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    id="range-end"
                    type="date"
                    value={rangeEnd}
                    onChange={(event) => setRangeEnd(event.target.value)}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="time-start"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Horario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="time-start"
                    type="time"
                    value={timeStart}
                    onChange={(event) => setTimeStart(event.target.value)}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    id="time-end"
                    type="time"
                    value={timeEnd}
                    onChange={(event) => setTimeEnd(event.target.value)}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="status-disponivel"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      id="status-disponivel"
                      type="radio"
                      name="status"
                      checked={selectedStatus === "disponivel"}
                      onChange={() => setSelectedStatus("disponivel")}
                      className="form-radio text-green-500 focus:ring-green-500 border-slate-300"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      Disponivel
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      id="status-indisponivel"
                      type="radio"
                      name="status"
                      checked={selectedStatus === "indisponivel"}
                      onChange={() => setSelectedStatus("indisponivel")}
                      className="form-radio text-slate-500 focus:ring-slate-500 border-slate-300"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      Indisponivel
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center pt-2">
                <input
                  id="repeat-weekly"
                  type="checkbox"
                  checked={repeatWeekly}
                  onChange={(event) => setRepeatWeekly(event.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label
                  htmlFor="repeat-weekly"
                  className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
                >
                  Repetir semanalmente
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-4">
                <button
                  type="button"
                  onClick={resetFormToSelectedDay}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col min-h-[360px]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Detalhes do dia: {selectedDate.toLocaleDateString("pt-BR")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {daySummary.disponivel} disponivel, {daySummary.agendado}{" "}
                agendado, {daySummary.indisponivel} indisponivel
              </p>
            </div>

            {selectedDaySlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
                <span className="material-icons text-slate-300 dark:text-slate-600 text-4xl mb-2">
                  event_busy
                </span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Nenhum horario definido para este dia.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3 overflow-y-auto max-h-[420px]">
                {selectedDaySlots.map((slot) => {
                  const cfg = statusConfig[slot.status];

                  return (
                    <div
                      key={slot.id}
                      className={`group flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm ${
                        slot.status === "agendado"
                          ? "border-primary/20 bg-primary/5 dark:bg-primary/10"
                          : "border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1.5 h-10 rounded-full ${cfg.stripeClass}`}
                        />
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badgeClass}`}
                            >
                              {cfg.label}
                            </span>
                            {slot.petName && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Pet: {slot.petName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {slot.status === "agendado" ? (
                        <button
                          type="button"
                          className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-400 hover:text-primary transition-colors"
                          title="Ver detalhes"
                        >
                          <span className="material-icons text-lg">
                            visibility
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeSlot(slot.id)}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-slate-600 text-slate-400 hover:text-red-500 transition-all"
                          title="Remover horario"
                        >
                          <span className="material-icons text-lg">delete</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
