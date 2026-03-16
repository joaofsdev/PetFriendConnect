import { Link } from "react-router-dom";

const summaryCards = [
  {
    label: "Meus Pets",
    value: "2",
    sub: "Ver todos os pets",
    subColor: "text-primary",
    subIcon: "arrow_forward",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    icon: "pets",
    link: "/meus-pets",
  },
  {
    label: "Reservas Ativas",
    value: "1",
    sub: "Próxima: Amanhã às 9h",
    subColor: "text-slate-500",
    subIcon: "",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    icon: "event_available",
    link: "/minhas-reservas",
  },
  {
    label: "Gasto no Mês",
    value: "R$ 280",
    sub: "2 serviços realizados",
    subColor: "text-slate-500",
    subIcon: "",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
    icon: "account_balance_wallet",
    link: null,
  },
];

const pets = [
  {
    name: "Thor",
    breed: "Husky Siberiano",
    age: "3 anos",
    img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=200&q=80",
    tag: "Cachorro",
    tagColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    nextService: "Passeio amanhã às 9h",
  },
  {
    name: "Mia",
    breed: "Persa",
    age: "2 anos",
    img: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=200&q=80",
    tag: "Gato",
    tagColor:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    nextService: "Sem serviço agendado",
  },
];

const upcomingBookings = [
  {
    petName: "Thor",
    petImg:
      "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&q=80",
    service: "Passeio",
    caregiver: "Ana Silva",
    day: "Amanhã",
    time: "09:00",
    dayColor:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    serviceIcon: "directions_walk",
    serviceColor: "text-primary",
    status: "Confirmado",
    statusColor: "text-green-600",
  },
  {
    petName: "Thor",
    petImg:
      "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&q=80",
    service: "Hospedagem",
    caregiver: "Carlos M.",
    day: "Sáb",
    time: "14:00",
    dayColor: "bg-slate-100 text-slate-500 dark:bg-slate-800",
    serviceIcon: "home",
    serviceColor: "text-orange-500",
    status: "Pendente",
    statusColor: "text-orange-500",
  },
];

const recentCaregivers = [
  {
    name: "Ana Silva",
    role: "Cuidadora Profissional",
    rating: "4.9",
    reviews: "128",
    img: "https://i.pravatar.cc/150?img=47",
    tags: ["Passeio", "Hospedagem"],
  },
  {
    name: "Carlos Mendes",
    role: "Pet Sitter",
    rating: "4.7",
    reviews: "85",
    img: "https://i.pravatar.cc/150?img=11",
    tags: ["Hospedagem", "Day Care"],
  },
  {
    name: "Julia Souza",
    role: "Veterinária",
    rating: "5.0",
    reviews: "200",
    img: "https://i.pravatar.cc/150?img=5",
    tags: ["Cuidados Especiais", "Visita"],
  },
];

export default function DashboardDono() {
  return (
    <div className="flex flex-col gap-8">
      {/* Boas vindas */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Olá, João! 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Aqui está um resumo dos seus pets e reservas.
        </p>
      </div>

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
              {card.link ? (
                <Link
                  to={card.link}
                  className={`text-xs font-medium mt-2 flex items-center gap-1 ${card.subColor}`}
                >
                  {card.sub}
                  <span className="material-icons text-[14px]">
                    {card.subIcon}
                  </span>
                </Link>
              ) : (
                <p className={`text-xs font-medium mt-2 ${card.subColor}`}>
                  {card.sub}
                </p>
              )}
            </div>
            <div
              className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center ${card.iconColor}`}
            >
              <span className="material-icons">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Meus Pets */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">
              Meus Pets
            </h2>
            <Link
              to="/meus-pets"
              className="text-sm text-primary font-medium hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-4">
            {pets.map((pet) => (
              <div
                key={pet.name}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <img
                  src={pet.img}
                  alt={pet.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {pet.name}
                    </h4>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pet.tagColor}`}
                    >
                      {pet.tag}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {pet.breed} • {pet.age}
                  </p>
                  <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                    <span className="material-icons text-[14px]">event</span>
                    {pet.nextService}
                  </p>
                </div>
                <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                  <span className="material-icons text-[20px]">
                    chevron_right
                  </span>
                </button>
              </div>
            ))}
            <button className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
              <span className="material-icons text-[18px]">add</span>
              Adicionar pet
            </button>
          </div>
        </div>

        {/* Próximas Reservas */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">
              Próximas Reservas
            </h2>
            <Link
              to="/minhas-reservas"
              className="text-sm text-primary font-medium hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingBookings.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={b.petImg}
                    alt={b.petName}
                    className="w-12 h-12 rounded-full object-cover shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-0.5 rounded-full">
                    <span
                      className={`material-icons text-sm ${b.serviceColor}`}
                    >
                      {b.serviceIcon}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {b.petName}
                    </h4>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.dayColor}`}
                    >
                      {b.day}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {b.service} • {b.caregiver}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-[14px] text-slate-400">
                        schedule
                      </span>
                      {b.time}
                    </div>
                    <span className={`font-semibold ${b.statusColor}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Link
              to="/encontrar-cuidadores"
              className="w-full py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-icons text-[18px]">search</span>
              Encontrar Cuidador
            </Link>
          </div>
        </div>
      </div>

      {/* Cuidadores Recentes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white">
            Cuidadores que você usou
          </h2>
          <Link
            to="/encontrar-cuidadores"
            className="text-sm text-primary font-medium hover:underline"
          >
            Ver mais
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentCaregivers.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
            >
              <img
                src={c.img}
                alt={c.name}
                className="w-12 h-12 rounded-full object-cover shadow-sm flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white truncate">
                  {c.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {c.role}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-icons text-yellow-400 text-[14px]">
                    star
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {c.rating}
                  </span>
                  <span className="text-xs text-slate-400">({c.reviews})</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
