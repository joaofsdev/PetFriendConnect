import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Service = {
  id: string;
  label: string;
  desc: string;
  price: string;
  priceUnit: string;
};

const services: Service[] = [
  {
    id: "walking",
    label: "Passeio",
    desc: "30 min de passeio pelo bairro",
    price: "R$ 40,00",
    priceUnit: "por passeio",
  },
  {
    id: "sitting",
    label: "Pet Sitting",
    desc: "1 hora de visita e alimentação",
    price: "R$ 60,00",
    priceUnit: "por visita",
  },
  {
    id: "boarding",
    label: "Hospedagem",
    desc: "Estadia completa na casa do cuidador",
    price: "R$ 90,00",
    priceUnit: "por noite",
  },
  {
    id: "daycare",
    label: "Day Care",
    desc: "Cuidados durante o dia todo",
    price: "R$ 75,00",
    priceUnit: "por dia",
  },
];

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "16:00",
  "18:00",
];
const checkInTimeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
];
const checkOutTimeSlots = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const pets = [
  {
    id: 1,
    name: "Buddy",
    breed: "Golden Retriever",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80",
  },
  {
    id: 2,
    name: "Luna",
    breed: "Siamesa",
    img: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=200&q=80",
  },
];

const STEPS = ["Escolher Pet", "Serviço e Data", "Confirmação"];
const DAYS_HEADER = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
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

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const days: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    days.push({ day: prevDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, current: true });
  return days;
}

export default function Agendamento() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 0
  const [selectedPet, setSelectedPet] = useState<number | null>(null);

  // Step 1
  const [selectedService, setSelectedService] = useState("walking");
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Data simples
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Intervalo hospedagem
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  // Validação e confirmação
  const [dateError, setDateError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isBoarding = selectedService === "boarding";
  const calDays = getCalendarDays(calYear, calMonth);
  const chosenService = services.find((s) => s.id === selectedService);
  const chosenPet = pets.find((p) => p.id === selectedPet);
  const nights = rangeStart && rangeEnd ? rangeEnd - rangeStart : 0;
  const totalPrice =
    isBoarding && nights > 0
      ? `R$ ${nights * 90},00`
      : (chosenService?.price ?? "");

  function prevMonth() {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else setCalMonth((m) => m + 1);
  }

  function handleDayClick(day: number) {
    setDateError(false);
    if (!isBoarding) {
      setSelectedDay(day);
      return;
    }
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day);
      setRangeEnd(null);
      setCheckInTime(null);
      setCheckOutTime(null);
    } else {
      if (day <= rangeStart) {
        setRangeStart(day);
        setRangeEnd(null);
      } else setRangeEnd(day);
    }
  }

  function getDayStyle(day: number) {
    if (!isBoarding) {
      return selectedDay === day
        ? "bg-primary text-white shadow-md"
        : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300";
    }
    if (rangeStart === day || rangeEnd === day)
      return "bg-primary text-white shadow-md";
    if (rangeStart && rangeEnd && day > rangeStart && day < rangeEnd)
      return "bg-primary/20 text-primary font-medium";
    return "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300";
  }

  function hasValidDate() {
    if (isBoarding)
      return !!(rangeStart && rangeEnd && checkInTime && checkOutTime);
    return !!(selectedDay && selectedTime);
  }

  function handleNext() {
    if (step === 1 && !hasValidDate()) {
      setDateError(true);
      return;
    }
    setDateError(false);
    setStep((s) => s + 1);
  }

  function handleConfirm() {
    setConfirmed(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  }

  function dateLabel() {
    if (isBoarding) {
      if (rangeStart && rangeEnd)
        return `${rangeStart} a ${rangeEnd} de ${MONTH_NAMES[calMonth]} (${nights} noite${nights > 1 ? "s" : ""})`;
      return "Não selecionado";
    }
    return selectedDay
      ? `${selectedDay} de ${MONTH_NAMES[calMonth]} de ${calYear}`
      : "Não selecionada";
  }

  // Mensagem de erro contextual
  function errorMsg() {
    if (!isBoarding)
      return "Por favor, selecione uma data e horário para continuar.";
    if (!rangeStart || !rangeEnd)
      return "Por favor, selecione o período de hospedagem.";
    if (!checkInTime) return "Por favor, selecione o horário de check-in.";
    if (!checkOutTime) return "Por favor, selecione o horário de check-out.";
    return "";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Agendamento
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Agende um serviço para o seu pet em poucos passos.
        </p>
      </div>

      <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[580px] border border-slate-200 dark:border-slate-700">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <span className="font-bold text-slate-800 dark:text-white tracking-tight text-sm">
                PetFriend Connect
              </span>
            </div>
            <nav>
              <ol className="space-y-6">
                {STEPS.map((label, i) => {
                  const done = i < step;
                  const current = i === step;
                  return (
                    <li key={label} className="relative">
                      {i < STEPS.length - 1 && (
                        <div
                          className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${done ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}
                        />
                      )}
                      <div className="relative flex items-center gap-4">
                        <span
                          className={`w-8 h-8 flex items-center justify-center rounded-full z-10 font-bold text-sm transition-colors ${
                            done
                              ? "bg-primary text-white"
                              : current
                                ? "bg-primary text-white"
                                : "bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-500"
                          }`}
                        >
                          {done ? (
                            <span className="material-icons text-sm">
                              check
                            </span>
                          ) : (
                            i + 1
                          )}
                        </span>
                        <div>
                          <p
                            className={`text-xs font-semibold uppercase tracking-wide ${current || done ? "text-primary" : "text-slate-400"}`}
                          >
                            Passo {i + 1}
                          </p>
                          <p
                            className={`text-sm font-medium ${current || done ? "text-slate-900 dark:text-white" : "text-slate-400"}`}
                          >
                            {label}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
          <p className="text-xs text-slate-400 mt-8">
            Precisa de ajuda?{" "}
            <a href="#" className="text-primary hover:underline">
              Fale conosco
            </a>
          </p>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col">
          <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {STEPS[step]}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {/* STEP 0 — Pet */}
            {step === 0 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Qual pet será atendido?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPet(pet.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        selectedPet === pet.id
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={pet.img}
                        alt={pet.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-sm"
                      />
                      <div>
                        <p
                          className={`font-semibold ${selectedPet === pet.id ? "text-primary" : "text-slate-900 dark:text-white"}`}
                        >
                          {pet.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {pet.breed}
                        </p>
                      </div>
                      {selectedPet === pet.id && (
                        <span className="material-icons text-primary ml-auto">
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1 — Serviço e Data */}
            {step === 1 && (
              <div className="space-y-8">
                {/* Serviços */}
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                    Selecione o Serviço
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedService(s.id);
                          setSelectedDay(null);
                          setSelectedTime(null);
                          setRangeStart(null);
                          setRangeEnd(null);
                          setCheckInTime(null);
                          setCheckOutTime(null);
                          setDateError(false);
                        }}
                        className={`relative flex flex-col text-left p-4 rounded-xl border-2 transition-all ${
                          selectedService === s.id
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`text-sm font-semibold ${selectedService === s.id ? "text-primary" : "text-slate-900 dark:text-white"}`}
                        >
                          {s.label}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {s.desc}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                          {s.price}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            {s.priceUnit}
                          </span>
                        </span>
                        {selectedService === s.id && (
                          <span className="material-icons text-primary absolute top-3 right-3 text-xl">
                            check_circle
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      {isBoarding ? "Período de Hospedagem" : "Data e Horário"}
                    </h2>
                    {isBoarding && (
                      <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        Clique no dia de entrada e depois no de saída
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Calendário */}
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                          {MONTH_NAMES[calMonth]} {calYear}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={prevMonth}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          >
                            <span className="material-icons text-sm">
                              chevron_left
                            </span>
                          </button>
                          <button
                            onClick={nextMonth}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          >
                            <span className="material-icons text-sm">
                              chevron_right
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400">
                        {DAYS_HEADER.map((d) => (
                          <div key={d}>{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {calDays.map((d, i) => (
                          <button
                            key={i}
                            disabled={!d.current}
                            onClick={() => d.current && handleDayClick(d.day)}
                            className={`p-2 rounded transition-colors ${!d.current ? "text-slate-300 dark:text-slate-600 pointer-events-none" : getDayStyle(d.day)}`}
                          >
                            {d.day}
                          </button>
                        ))}
                      </div>

                      {/* Legenda hospedagem */}
                      {isBoarding && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500">
                          {!rangeStart && (
                            <span>Clique no primeiro dia da hospedagem</span>
                          )}
                          {rangeStart && !rangeEnd && (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                              Entrada: dia {rangeStart} — selecione o dia de
                              saída
                            </span>
                          )}
                          {rangeStart && rangeEnd && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <span className="material-icons text-sm">
                                date_range
                              </span>
                              {rangeStart} a {rangeEnd} de{" "}
                              {MONTH_NAMES[calMonth]} — {nights} noite
                              {nights > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Horários */}
                    {!isBoarding && (
                      <div className="w-full lg:w-44">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          Horários Disponíveis
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                          {timeSlots.map((t) => (
                            <button
                              key={t}
                              onClick={() => setSelectedTime(t)}
                              className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                                selectedTime === t
                                  ? "bg-primary text-white border-primary shadow-md ring-2 ring-primary/30"
                                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Check-in / Check-out para hospedagem */}
                  {isBoarding && rangeStart && rangeEnd && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Check-in */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                            <span className="material-icons text-white text-sm">
                              login
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              Horário de Check-in
                            </p>
                            <p className="text-xs text-slate-500">
                              Dia {rangeStart} de {MONTH_NAMES[calMonth]}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {checkInTimeSlots.map((t) => (
                            <button
                              key={t}
                              onClick={() => setCheckInTime(t)}
                              className={`py-1.5 px-2 text-xs rounded-lg border transition-colors ${
                                checkInTime === t
                                  ? "bg-primary text-white border-primary shadow-sm"
                                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Check-out */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="material-icons text-white text-sm">
                              logout
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              Horário de Check-out
                            </p>
                            <p className="text-xs text-slate-500">
                              Dia {rangeEnd} de {MONTH_NAMES[calMonth]}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {checkOutTimeSlots.map((t) => (
                            <button
                              key={t}
                              onClick={() => setCheckOutTime(t)}
                              className={`py-1.5 px-2 text-xs rounded-lg border transition-colors ${
                                checkOutTime === t
                                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-400 hover:text-orange-500"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Erro */}
                  {dateError && !hasValidDate() && (
                    <div className="flex items-center gap-2 mt-4 text-red-500 text-sm">
                      <span className="material-icons text-base">
                        error_outline
                      </span>
                      {errorMsg()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 — Confirmação */}
            {step === 2 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
                  Resumo do Agendamento
                </h2>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                  {chosenPet && (
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                      <img
                        src={chosenPet.img}
                        alt={chosenPet.name}
                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                      />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Pet
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {chosenPet.name}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Serviço
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {chosenService?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cuidador
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Ana Silva
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isBoarding ? "Período" : "Data"}
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {dateLabel()}
                      </p>
                    </div>
                    {!isBoarding ? (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Horário
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {selectedTime}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span className="material-icons text-sm text-primary">
                              login
                            </span>{" "}
                            Check-in
                          </p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            Dia {rangeStart} às {checkInTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span className="material-icons text-sm text-orange-500">
                              logout
                            </span>{" "}
                            Check-out
                          </p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            Dia {rangeEnd} às {checkOutTime}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Total
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">
                        {totalPrice}
                      </span>
                      {isBoarding && nights > 0 && (
                        <p className="text-xs text-slate-400">
                          {nights} noite{nights > 1 ? "s" : ""} × R$ 90,00
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {confirmed && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                    <span className="material-icons text-green-500 text-2xl">
                      check_circle
                    </span>
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        Agendamento Confirmado!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        Ana Silva foi notificada.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <button
              onClick={() =>
                step === 0 ? navigate(-1) : setStep((s) => s - 1)
              }
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {step === 0 ? "Cancelar" : "Voltar"}
            </button>
            {step < 2 ? (
              <button
                onClick={handleNext}
                disabled={step === 0 && !selectedPet}
                className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
              >
                Próximo{" "}
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={confirmed}
                className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-primary/30 transition-all"
              >
                {confirmed ? "Confirmado!" : "Confirmar Agendamento"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-l-4 border-green-500 p-4 z-50">
          <div className="flex items-start gap-3">
            <span className="material-icons text-green-500 text-2xl">
              check_circle
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Agendamento Confirmado!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ana Silva foi notificada. Veja os detalhes no seu painel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function errorMsg() {
    if (!isBoarding)
      return "Por favor, selecione uma data e horário para continuar.";
    if (!rangeStart || !rangeEnd)
      return "Por favor, selecione o período de hospedagem.";
    if (!checkInTime) return "Por favor, selecione o horário de check-in.";
    if (!checkOutTime) return "Por favor, selecione o horário de check-out.";
    return "";
  }
}
