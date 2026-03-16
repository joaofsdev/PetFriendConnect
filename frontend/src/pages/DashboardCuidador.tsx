// Dados estáticos de exemplo — substituir por dados reais da API futuramente
const summaryCards = [
  {
    label: "Agendamentos Hoje",
    value: "2",
    sub: "Ativo agora",
    subColor: "text-green-600",
    subIcon: "trending_up",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    icon: "event_available",
  },
  {
    label: "Agendamentos na Semana",
    value: "8",
    sub: "Próximo: Amanhã às 9h",
    subColor: "text-slate-500",
    subIcon: "",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    icon: "date_range",
  },
  {
    label: "Ganhos do Mês",
    value: "R$ 1.200",
    sub: "+12% em relação ao mês anterior",
    subColor: "text-green-600",
    subIcon: "arrow_upward",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    icon: "attach_money",
  },
];

const calendarDays = [
  { key: "MON", num: "23", today: false, weekend: false },
  { key: "TER", num: "24", today: true, weekend: false },
  { key: "QUA", num: "25", today: false, weekend: false },
  { key: "QUI", num: "26", today: false, weekend: false },
  { key: "SEX", num: "27", today: false, weekend: false },
  { key: "SAB", num: "28", today: false, weekend: true },
  { key: "DOM", num: "29", today: false, weekend: true },
];

const hours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const calendarEvents = [
  {
    col: 2,
    top: 144,
    height: 108,
    color: "bg-primary/10 border-primary",
    textColor: "text-primary",
    time: "10:00 - 11:30",
    title: "Passeio",
    pet: "Thor",
  },
  {
    col: 2,
    top: 432,
    height: 144,
    color: "bg-purple-100 dark:bg-purple-900/30 border-purple-500",
    textColor: "text-purple-700 dark:text-purple-400",
    time: "14:00 - 16:00",
    title: "Pet Sitting",
    pet: "Bolinha",
  },
  {
    col: 3,
    top: 72,
    height: 72,
    color: "bg-primary/10 border-primary",
    textColor: "text-primary",
    time: "09:00 - 10:00",
    title: "Visita",
    pet: "Rex",
  },
  {
    col: 5,
    top: 504,
    height: 72,
    color: "bg-green-100 dark:bg-green-900/30 border-green-500",
    textColor: "text-green-700 dark:text-green-400",
    time: "15:00 - 16:00",
    title: "Banho e Tosa",
    pet: "Luna",
  },
];

const appointments = [
  {
    name: "Bolinha",
    day: "Hoje",
    dayColor:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    type: "Gato • Pet Sitting",
    time: "14:00",
    owner: "Maria S.",
    img: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=100&q=80",
    serviceIcon: "home",
    serviceColor: "text-purple-500",
    highlighted: true,
  },
  {
    name: "Rex",
    day: "Amanhã",
    dayColor: "bg-slate-100 text-slate-500 dark:bg-slate-800",
    type: "Cachorro • Passeio",
    time: "09:00",
    owner: "João P.",
    img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&q=80",
    serviceIcon: "directions_walk",
    serviceColor: "text-primary",
    highlighted: false,
  },
  {
    name: "Thor",
    day: "Ter",
    dayColor: "bg-slate-100 text-slate-500 dark:bg-slate-800",
    type: "Cachorro • Passeio",
    time: "10:00",
    owner: "Carlos M.",
    img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&q=80",
    serviceIcon: "directions_walk",
    serviceColor: "text-primary",
    highlighted: false,
  },
  {
    name: "Luna",
    day: "Sex",
    dayColor: "bg-slate-100 text-slate-500 dark:bg-slate-800",
    type: "Cachorro • Banho e Tosa",
    time: "15:00",
    owner: "Ana B.",
    img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&q=80",
    serviceIcon: "content_cut",
    serviceColor: "text-slate-400",
    highlighted: false,
    faded: true,
  },
];

export default function DashboardCuidador() {
  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {card.label}
              </p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {card.value}
              </h3>
              <p
                className={`text-xs font-medium mt-2 flex items-center gap-1 ${card.subColor}`}
              >
                {card.subIcon && (
                  <span className="material-icons text-[16px]">
                    {card.subIcon}
                  </span>
                )}
                {card.sub}
              </p>
            </div>
            <div
              className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center ${card.iconColor}`}
            >
              <span className="material-icons">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar + Upcoming */}
      <div className="flex flex-col xl:flex-row gap-8 min-h-[600px]">
        {/* Weekly Calendar */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                Calendário Semanal
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                23 - 29 de Outubro, 2023
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                <span className="material-icons">chevron_left</span>
              </button>
              <button className="px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                Hoje
              </button>
              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                <span className="material-icons">chevron_right</span>
              </button>
              <button className="ml-2 flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                <span className="material-icons text-[16px]">add</span>
                Bloqueio
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {/* Header dias */}
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 min-w-[700px] sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="h-12 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50" />
              {calendarDays.map((day) => (
                <div
                  key={day.key}
                  className={`h-12 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center last:border-r-0
                    ${day.today ? "bg-primary/5" : day.weekend ? "bg-slate-50/50 dark:bg-slate-800/20" : ""}`}
                >
                  <span
                    className={`text-xs font-medium ${day.today ? "text-primary" : "text-slate-500"}`}
                  >
                    {day.key}
                  </span>
                  <span
                    className={`text-sm font-bold ${day.today ? "text-primary" : "text-slate-800 dark:text-white"}`}
                  >
                    {day.num}
                  </span>
                </div>
              ))}
            </div>

            {/* Grade de horários */}
            <div className="grid grid-cols-8 min-w-[700px] relative h-[720px]">
              {/* Coluna de horas */}
              <div className="flex flex-col text-xs text-slate-400 font-medium text-right pr-2 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                {hours.map((h) => (
                  <div key={h} className="h-[72px] -mt-2.5">
                    {h}
                  </div>
                ))}
              </div>

              {/* Linhas horizontais */}
              <div className="col-span-8 absolute inset-0 w-full h-full pointer-events-none flex flex-col">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="h-[72px] border-b border-dashed border-slate-100 dark:border-slate-800 w-full"
                  />
                ))}
              </div>

              {/* Linhas verticais de colunas */}
              <div className="col-span-7 grid grid-cols-7 absolute inset-0 left-[12.5%] h-full pointer-events-none">
                {calendarDays.map((day) => (
                  <div
                    key={day.key}
                    className={`border-r border-slate-100 dark:border-slate-800 h-full
                      ${day.today ? "bg-primary/5" : day.weekend ? "bg-slate-50/30" : ""}`}
                  />
                ))}
              </div>

              {/* Eventos */}
              <div className="col-span-7 grid grid-cols-7 absolute inset-0 left-[12.5%] h-full w-[87.5%]">
                {calendarEvents.map((ev, i) => (
                  <div
                    key={i}
                    className="relative"
                    style={{ gridColumnStart: ev.col }}
                  >
                    <div
                      className={`absolute w-[95%] left-[2.5%] ${ev.color} border-l-4 rounded-r-md p-2 hover:opacity-90 cursor-pointer transition-opacity shadow-sm`}
                      style={{ top: ev.top, height: ev.height }}
                    >
                      <div
                        className={`text-xs font-bold ${ev.textColor} mb-0.5`}
                      >
                        {ev.time}
                      </div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {ev.title}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <span className="material-icons text-[12px]">pets</span>{" "}
                        {ev.pet}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="w-full xl:w-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">
              Próximos
            </h2>
            <a
              href="#"
              className="text-sm text-primary font-medium hover:underline"
            >
              Ver todos
            </a>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1">
            {appointments.map((ap) => (
              <div
                key={ap.name}
                className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
                  ap.faded ? "opacity-60" : ""
                } ${
                  ap.highlighted
                    ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-800"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={ap.img}
                    alt={ap.name}
                    className={`w-12 h-12 rounded-full object-cover shadow-sm ${ap.faded ? "grayscale" : ""}`}
                  />
                  {!ap.faded && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-0.5 rounded-full">
                      <span
                        className={`material-icons text-sm ${ap.serviceColor}`}
                      >
                        {ap.serviceIcon}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">
                      {ap.name}
                    </h4>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${ap.dayColor}`}
                    >
                      {ap.day}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {ap.type}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-[14px] text-slate-400">
                        schedule
                      </span>
                      {ap.time}
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <span className="material-icons text-[14px] text-slate-400">
                        person
                      </span>
                      {ap.owner}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <span className="material-icons text-[18px]">sync</span>
              Sincronizar Calendário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
