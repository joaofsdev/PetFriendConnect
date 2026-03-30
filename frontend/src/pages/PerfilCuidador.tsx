import { Link, useNavigate, useParams } from "react-router-dom";

interface CaregiverProfile {
  id: number;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  tags: string[];
  avatar: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    unit: string;
    icon: string;
  }>;
  reviewHighlights: Array<{
    id: number;
    author: string;
    date: string;
    comment: string;
  }>;
}

const caregiverProfiles: CaregiverProfile[] = [
  {
    id: 1,
    name: "Ana Silva",
    specialty: "Especialista em caes de grande porte",
    location: "Vila Madalena, SP",
    rating: 4.9,
    reviews: 124,
    description:
      "Oi, eu sou a Ana! Tenho 5 anos de experiencia com pets e foco em caes energeticos. Sou certificada em primeiros socorros para animais e trabalho com uma rotina segura e divertida.",
    tags: ["Confiavel", "Ativa", "Experiente"],
    avatar: "https://i.pravatar.cc/300?img=47",
    services: [
      {
        id: "walking",
        name: "Passeio de Caes (1h)",
        description:
          "Passeio completo com hidratacao, brincadeiras e percurso adaptado ao porte do pet.",
        price: "R$ 40,00",
        unit: "por passeio",
        icon: "directions_walk",
      },
      {
        id: "visit",
        name: "Visita em Casa",
        description:
          "Visita de 30 minutos com alimentacao, companhia e cuidados basicos.",
        price: "R$ 30,00",
        unit: "por visita",
        icon: "home",
      },
      {
        id: "overnight",
        name: "Hospedagem",
        description:
          "Estadia noturna em ambiente monitorado, com rotina de bem-estar e descanso.",
        price: "R$ 80,00",
        unit: "por noite",
        icon: "nightlight",
      },
    ],
    reviewHighlights: [
      {
        id: 1,
        author: "Sarah Jenkins",
        date: "24 Out 2023",
        comment:
          "A Ana foi incrivel com meu cachorro! Muito cuidadosa, pontual e me atualizou com fotos durante todo o passeio.",
      },
      {
        id: 2,
        author: "Mike Ross",
        date: "10 Out 2023",
        comment:
          "Profissional e muito atenciosa. Meu pet adorou e ficou super tranquilo.",
      },
    ],
  },
  {
    id: 2,
    name: "Carlos Mendes",
    specialty: "Treinador e passeios de alta energia",
    location: "Pinheiros, SP",
    rating: 5,
    reviews: 42,
    description:
      "Sou o Carlos, treinador comportamental e cuidador. Trabalho com foco em disciplina positiva e rotina estruturada para caes ativos.",
    tags: ["Treinador", "Passeio", "Alta energia"],
    avatar: "https://i.pravatar.cc/300?img=11",
    services: [
      {
        id: "walking",
        name: "Passeio de Caes (1h)",
        description:
          "Passeio dinamico com atividades para gasto de energia e socializacao.",
        price: "R$ 55,00",
        unit: "por passeio",
        icon: "directions_walk",
      },
      {
        id: "daycare",
        name: "Day Care",
        description:
          "Cuidado durante o dia com atividades guiadas e monitoramento.",
        price: "R$ 70,00",
        unit: "por dia",
        icon: "wb_sunny",
      },
    ],
    reviewHighlights: [
      {
        id: 3,
        author: "Julia Lima",
        date: "02 Nov 2023",
        comment:
          "Excelente profissional. Meu cachorro voltou cansado e feliz todos os dias.",
      },
    ],
  },
];

const availabilityDays = [
  { day: 3, available: true },
  { day: 4, available: true },
  { day: 5, available: false },
  { day: 6, available: true },
  { day: 7, available: true },
  { day: 8, available: true },
  { day: 9, available: false },
  { day: 10, available: false },
  { day: 11, available: true },
  { day: 12, available: true },
  { day: 13, available: true },
  { day: 14, available: true },
  { day: 15, available: true },
  { day: 16, available: false },
  { day: 17, available: false },
  { day: 18, available: true },
  { day: 19, available: true },
  { day: 20, available: true },
  { day: 21, available: true },
  { day: 22, available: true },
  { day: 23, available: true },
  { day: 24, available: true },
  { day: 25, available: true },
  { day: 26, available: true },
  { day: 27, available: true },
  { day: 28, available: true },
  { day: 29, available: true },
  { day: 30, available: true },
];

function stars(rate: number) {
  const full = Math.round(rate);
  return Array.from({ length: 5 }, (_, i) => i < full);
}

export default function PerfilCuidador() {
  const navigate = useNavigate();
  const { id } = useParams();
  const caregiverId = Number(id);

  const caregiver = caregiverProfiles.find((item) => item.id === caregiverId);

  if (!caregiver) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center">
        <span className="material-icons text-5xl text-slate-400">
          person_off
        </span>
        <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
          Cuidador nao encontrado
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Este perfil nao existe ou nao esta mais disponivel.
        </p>
        <Link
          to="/encontrar-cuidadores"
          className="inline-flex mt-5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Voltar para busca
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative shrink-0">
            <img
              src={caregiver.avatar}
              alt={caregiver.name}
              className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
            />
            <div className="absolute bottom-1 right-1 bg-green-500 border-2 border-white dark:border-slate-900 h-6 w-6 rounded-full flex items-center justify-center">
              <span className="material-icons text-white text-[14px]">
                verified
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white truncate">
                {caregiver.name}
              </h1>
              <div className="inline-flex items-center bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-primary">
                  {caregiver.specialty}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
              <div className="flex items-center text-yellow-500">
                {stars(caregiver.rating).map((filled, index) => (
                  <span
                    key={`${caregiver.id}-star-${index}`}
                    className="material-icons text-xl"
                  >
                    {filled ? "star" : "star_outline"}
                  </span>
                ))}
                <span className="ml-1 font-bold text-slate-900 dark:text-white text-base">
                  {caregiver.rating.toFixed(1)}
                </span>
                <span className="ml-1 text-slate-500 dark:text-slate-400">
                  ({caregiver.reviews} avaliacoes)
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div className="flex items-center text-slate-500 dark:text-slate-400">
                <span className="material-icons text-lg mr-1">location_on</span>
                {caregiver.location}
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-3xl">
              {caregiver.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {caregiver.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  <span className="material-icons text-sm mr-1">
                    check_circle
                  </span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Servicos e Precos
              </h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {caregiver.services.map((service) => (
                <div
                  key={service.id}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-slate-800 text-primary">
                      <span className="material-icons text-2xl">
                        {service.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">
                      {service.price}
                    </span>
                    <span className="text-xs text-slate-400">
                      {service.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Avaliacoes recentes
              </h2>
              <button
                type="button"
                className="text-primary font-medium text-sm hover:text-blue-600"
              >
                Ver todas {caregiver.reviews}
              </button>
            </div>

            <div className="space-y-6">
              {caregiver.reviewHighlights.map((review) => (
                <article
                  key={review.id}
                  className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {review.author}
                      </p>
                      <p className="text-xs text-slate-500">{review.date}</p>
                    </div>
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span
                          key={`${review.id}-rate-${index}`}
                          className="material-icons text-sm"
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 sticky top-24 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Disponibilidade
              </h2>

              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Novembro 2023
                </span>
                <button
                  type="button"
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(
                  (weekday) => (
                    <div
                      key={weekday}
                      className="text-slate-400 font-medium py-1"
                    >
                      {weekday}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                <div className="p-2" />
                <div className="p-2" />
                <div className="p-2" />
                <div className="p-2 rounded-lg text-slate-400 bg-slate-100 dark:bg-slate-800 line-through">
                  1
                </div>
                <div className="p-2 rounded-lg text-slate-400 bg-slate-100 dark:bg-slate-800 line-through">
                  2
                </div>

                {availabilityDays.map((dayInfo) => {
                  const isSelected = dayInfo.day === 7;

                  if (!dayInfo.available) {
                    return (
                      <div
                        key={`day-${dayInfo.day}`}
                        className="p-2 rounded-lg text-slate-400 bg-slate-100 dark:bg-slate-800"
                      >
                        {dayInfo.day}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`day-${dayInfo.day}`}
                      className={`p-2 rounded-lg text-center font-medium relative ${
                        isSelected
                          ? "bg-primary text-white shadow-md"
                          : "text-slate-900 dark:text-white hover:bg-primary/20 dark:hover:bg-primary/30"
                      }`}
                    >
                      {dayInfo.day}
                      {!isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />{" "}
                  Disponivel
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Ocupado
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Data selecionada
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  07 Nov 2023
                </span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Estimativa inicial
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-lg">
                  {caregiver.services[0]?.price ?? "R$ 0,00"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/agendamento")}
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                Agendar Servico
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Cancelamento gratuito ate 24h antes.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
