import { Link } from "react-router-dom";

type StatCard = {
  title: string;
  value: string;
  trend: string;
  trendColor: string;
  icon: string;
  iconWrap: string;
};

type AlertItem = {
  title: string;
  subtitle: string;
  value: string;
  icon: string;
  accent: string;
};

const statCards: StatCard[] = [
  {
    title: "Total de Usuários",
    value: "1.234",
    trend: "+12% no mês",
    trendColor: "text-emerald-600 dark:text-emerald-400",
    icon: "group",
    iconWrap: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    title: "Pets Cadastrados",
    value: "856",
    trend: "+8% no mês",
    trendColor: "text-emerald-600 dark:text-emerald-400",
    icon: "pets",
    iconWrap:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  {
    title: "Reservas",
    value: "342",
    trend: "+15% no mês",
    trendColor: "text-emerald-600 dark:text-emerald-400",
    icon: "event",
    iconWrap:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    title: "Receita Total",
    value: "R$ 45.670",
    trend: "+22% no mês",
    trendColor: "text-emerald-600 dark:text-emerald-400",
    icon: "payments",
    iconWrap:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
];

const alerts: AlertItem[] = [
  {
    title: "Denúncias pendentes",
    subtitle: "Requer revisão imediata",
    value: "12",
    icon: "report_problem",
    accent: "border-l-red-500 text-red-600 dark:text-red-400",
  },
  {
    title: "Reservas em análise",
    subtitle: "Aguardando confirmação",
    value: "25",
    icon: "schedule",
    accent: "border-l-amber-500 text-amber-600 dark:text-amber-400",
  },
];

const recentActivities = [
  {
    title: "Novo cuidador aprovado",
    detail: "Ana Silva passou na validação de perfil",
    when: "há 12 min",
    icon: "verified",
  },
  {
    title: "Denúncia resolvida",
    detail: "Conta #8821 foi revisada pela moderação",
    when: "há 35 min",
    icon: "gavel",
  },
  {
    title: "Pico de reservas",
    detail: "14 novas reservas na última hora",
    when: "há 1 h",
    icon: "insights",
  },
  {
    title: "Backup concluído",
    detail: "Rotina diária executada com sucesso",
    when: "há 2 h",
    icon: "cloud_done",
  },
];

const topCaregivers = [
  {
    name: "Julia Souza",
    score: "4.9",
    jobs: "312 atendimentos",
    avatar: "https://i.pravatar.cc/120?img=5",
  },
  {
    name: "Carlos Mendes",
    score: "4.8",
    jobs: "278 atendimentos",
    avatar: "https://i.pravatar.cc/120?img=11",
  },
  {
    name: "Ana Silva",
    score: "4.9",
    jobs: "249 atendimentos",
    avatar: "https://i.pravatar.cc/120?img=47",
  },
];

export default function DashboardAdmin() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard Admin
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visão geral da operação da plataforma nas últimas 24 horas.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <span className="material-icons text-base">calendar_today</span>
          Últimos 30 dias
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex items-start justify-between">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.iconWrap}`}
              >
                <span className="material-icons">{card.icon}</span>
              </span>
              <span className={`text-xs font-semibold ${card.trendColor}`}>
                {card.trend}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {alerts.map((alert) => (
          <article
            key={alert.title}
            className={`rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${alert.accent}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-icons">{alert.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {alert.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {alert.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold">{alert.value}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Atividade Recente
            </h3>
            <Link
              to="/admin/logs"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver logs completos
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivities.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
              >
                <span className="material-icons text-primary">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.detail}
                  </p>
                </div>
                <span className="text-xs text-slate-400">{item.when}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Top Cuidadores
            </h3>
            <Link
              to="/admin/usuarios"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="space-y-4">
            {topCaregivers.map((caregiver) => (
              <div key={caregiver.name} className="flex items-center gap-3">
                <img
                  src={caregiver.avatar}
                  alt={caregiver.name}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">
                    {caregiver.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {caregiver.jobs}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {caregiver.score}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
