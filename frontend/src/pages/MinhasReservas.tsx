import { useState } from "react";

type Status = "confirmada" | "pendente" | "concluida" | "cancelada";

interface Booking {
  id: number;
  status: Status;
  date: string;
  price: string;
  caregiver: {
    name: string;
    role: string;
    rating: string;
    avatar: string;
    verified: boolean;
  };
  service: { label: string; icon: string };
  pet: { name: string; breed: string };
}

const bookings: Booking[] = [
  {
    id: 1,
    status: "confirmada",
    date: "15 a 17 de Outubro",
    price: "R$ 150,00",
    caregiver: {
      name: "Ana Silva",
      role: "Cuidadora",
      rating: "4.9",
      avatar: "https://i.pravatar.cc/150?img=47",
      verified: true,
    },
    service: { label: "Hospedagem", icon: "home" },
    pet: { name: "Rex", breed: "Golden Retriever" },
  },
  {
    id: 2,
    status: "pendente",
    date: "Amanhã, 14:00",
    price: "R$ 40,00",
    caregiver: {
      name: "Bruno Santos",
      role: "Passeador",
      rating: "5.0",
      avatar: "https://i.pravatar.cc/150?img=11",
      verified: false,
    },
    service: { label: "Passeio (1h)", icon: "directions_walk" },
    pet: { name: "Luna", breed: "SRD" },
  },
  {
    id: 3,
    status: "confirmada",
    date: "22 de Outubro, 09:00",
    price: "R$ 60,00",
    caregiver: {
      name: "Carla Mendez",
      role: "Veterinária",
      rating: "5.0",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: false,
    },
    service: { label: "Visita Veterinária", icon: "medical_services" },
    pet: { name: "Thor", breed: "Bulldog" },
  },
  {
    id: 4,
    status: "concluida",
    date: "10 de Outubro, 10:00",
    price: "R$ 40,00",
    caregiver: {
      name: "Bruno Santos",
      role: "Passeador",
      rating: "5.0",
      avatar: "https://i.pravatar.cc/150?img=11",
      verified: false,
    },
    service: { label: "Passeio (1h)", icon: "directions_walk" },
    pet: { name: "Rex", breed: "Golden Retriever" },
  },
  {
    id: 5,
    status: "cancelada",
    date: "5 de Outubro, 15:00",
    price: "R$ 60,00",
    caregiver: {
      name: "Ana Silva",
      role: "Cuidadora",
      rating: "4.9",
      avatar: "https://i.pravatar.cc/150?img=47",
      verified: true,
    },
    service: { label: "Pet Sitting", icon: "home" },
    pet: { name: "Luna", breed: "SRD" },
  },
];

type Tab = "proximas" | "concluidas" | "canceladas" | "todas";

const tabs: { key: Tab; label: string }[] = [
  { key: "proximas", label: "Próximas" },
  { key: "concluidas", label: "Concluídas" },
  { key: "canceladas", label: "Canceladas" },
  { key: "todas", label: "Todas" },
];

const statusConfig: Record<
  Status,
  { label: string; dot: string; badge: string }
> = {
  confirmada: {
    label: "Confirmada",
    dot: "bg-green-500",
    badge:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  },
  pendente: {
    label: "Pendente",
    dot: "bg-yellow-500 animate-pulse",
    badge:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  },
  concluida: {
    label: "Concluída",
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  cancelada: {
    label: "Cancelada",
    dot: "bg-red-500",
    badge:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  },
};

function filterByTab(tab: Tab): Booking[] {
  if (tab === "proximas")
    return bookings.filter(
      (b) => b.status === "confirmada" || b.status === "pendente",
    );
  if (tab === "concluidas")
    return bookings.filter((b) => b.status === "concluida");
  if (tab === "canceladas")
    return bookings.filter((b) => b.status === "cancelada");
  return bookings;
}

export default function MinhasReservas() {
  const [activeTab, setActiveTab] = useState<Tab>("proximas");
  const [canceledIds, setCanceledIds] = useState<number[]>([]);

  const proximasCount = filterByTab("proximas").length;
  const filtered = filterByTab(activeTab).filter(
    (b) =>
      !canceledIds.includes(b.id) ||
      activeTab === "todas" ||
      activeTab === "canceladas",
  );

  function handleCancel(id: number) {
    setCanceledIds((prev) => [...prev, id]);
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Meus Agendamentos
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
          Gerencie seus próximos serviços e histórico de cuidados.
        </p>
      </div>

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
                <span className="bg-primary text-white py-0.5 px-2 rounded-full text-xs">
                  {proximasCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="mx-auto h-24 w-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="material-icons text-5xl text-slate-400">
              event_busy
            </span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            Nenhum agendamento encontrado
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Não há agendamentos nesta categoria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const st =
              statusConfig[
                canceledIds.includes(booking.id) ? "cancelada" : booking.status
              ];
            const isCanceled =
              canceledIds.includes(booking.id) ||
              booking.status === "cancelada";
            const isDone = booking.status === "concluida";

            return (
              <div
                key={booking.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  isCanceled
                    ? "border-slate-200 dark:border-slate-800 opacity-60"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${st.dot}`}
                        />
                        {st.label}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="material-icons text-sm">
                          {booking.status === "pendente" ? "schedule" : "event"}
                        </span>
                        {booking.date}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {booking.price}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    {/* Cuidador */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <img
                          src={booking.caregiver.avatar}
                          alt={booking.caregiver.name}
                          className="h-14 w-14 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                        />
                        {booking.caregiver.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 border-2 border-white dark:border-slate-800">
                            <span className="material-icons text-[12px] block">
                              verified
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          {booking.caregiver.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {booking.caregiver.role} • {booking.caregiver.rating}{" "}
                          <span className="text-yellow-400 text-xs">★</span>
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

                    {/* Serviço e pet */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="material-icons text-primary text-lg">
                          {booking.service.icon}
                        </span>
                        <span className="font-medium">
                          {booking.service.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="material-icons text-slate-400 text-lg">
                          pets
                        </span>
                        <span>
                          Para:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {booking.pet.name}
                          </span>{" "}
                          ({booking.pet.breed})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    {!isCanceled && !isDone && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 dark:bg-transparent dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    {isDone && (
                      <button className="px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400 transition-colors flex items-center gap-1">
                        <span className="material-icons text-sm">star</span>
                        Avaliar
                      </button>
                    )}
                    <button className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-transparent rounded-lg hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Carregar mais */}
      {filtered.length > 0 && (
        <div className="flex justify-center">
          <button className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
            Carregar mais agendamentos
            <span className="material-icons text-sm">expand_more</span>
          </button>
        </div>
      )}
    </div>
  );
}
