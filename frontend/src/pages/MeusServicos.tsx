import { useMemo, useState } from "react";
import type { SyntheticEvent } from "react";

type Accent = "primary" | "orange" | "green" | "violet";

interface ServiceItem {
  id: number;
  title: string;
  description: string;
  price: number;
  unit: string;
  icon: string;
  accent: Accent;
  active: boolean;
}

interface ServiceForm {
  title: string;
  description: string;
  price: string;
  unit: string;
  icon: string;
  accent: Accent;
  active: boolean;
}

const accentStyles: Record<
  Accent,
  { iconWrap: string; iconColor: string; badge: string }
> = {
  primary: {
    iconWrap: "bg-primary/10 dark:bg-blue-900/30",
    iconColor: "text-primary dark:text-blue-400",
    badge: "bg-primary/10 text-primary",
  },
  orange: {
    iconWrap: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500 dark:text-orange-400",
    badge:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  },
  green: {
    iconWrap: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    badge:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  violet: {
    iconWrap: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
};

const initialServices: ServiceItem[] = [
  {
    id: 1,
    title: "Passeio de Caes",
    description:
      "Passeio de 1 hora no parque local ou vizinhanca, incluindo hidratacao e brincadeiras.",
    price: 40,
    unit: "por hora",
    icon: "directions_walk",
    accent: "primary",
    active: true,
  },
  {
    id: 2,
    title: "Hospedagem",
    description:
      "Cuidado noturno em minha casa com ambiente seguro e confortavel para seu pet.",
    price: 80,
    unit: "por noite",
    icon: "house",
    accent: "orange",
    active: true,
  },
  {
    id: 3,
    title: "Visita a Gatos",
    description:
      "Visita de 30 min para alimentacao, limpeza da caixa de areia e interacao.",
    price: 30,
    unit: "por visita",
    icon: "pets",
    accent: "primary",
    active: false,
  },
  {
    id: 4,
    title: "Creche (Daycare)",
    description:
      "Dia de diversao e socializacao com outros caes em ambiente supervisionado.",
    price: 65,
    unit: "por dia",
    icon: "wb_sunny",
    accent: "orange",
    active: true,
  },
];

const defaultForm: ServiceForm = {
  title: "",
  description: "",
  price: "",
  unit: "por hora",
  icon: "pets",
  accent: "primary",
  active: true,
};

function serviceToForm(service: ServiceItem): ServiceForm {
  return {
    title: service.title,
    description: service.description,
    price: String(service.price),
    unit: service.unit,
    icon: service.icon,
    accent: service.accent,
    active: service.active,
  };
}

export default function MeusServicos() {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceForm>(defaultForm);
  const [formError, setFormError] = useState("");

  const activeCount = useMemo(
    () => services.filter((service) => service.active).length,
    [services],
  );

  function openCreateModal() {
    setEditingId(null);
    setForm(defaultForm);
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(service: ServiceItem) {
    setEditingId(service.id);
    setForm(serviceToForm(service));
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError("");
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.unit.trim()) {
      setFormError("Preencha titulo, descricao e unidade.");
      return;
    }

    const parsedPrice = Number(form.price.replace(",", "."));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Informe um preco valido maior que zero.");
      return;
    }

    const payload: Omit<ServiceItem, "id"> = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: parsedPrice,
      unit: form.unit.trim(),
      icon: form.icon.trim() || "pets",
      accent: form.accent,
      active: form.active,
    };

    if (editingId) {
      setServices((prev) =>
        prev.map((service) =>
          service.id === editingId ? { ...service, ...payload } : service,
        ),
      );
    } else {
      setServices((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...payload,
        },
      ]);
    }

    closeModal();
  }

  function toggleServiceStatus(id: number) {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, active: !service.active } : service,
      ),
    );
  }

  function removeService(id: number) {
    setServices((prev) => prev.filter((service) => service.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Meus Servicos
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gerencie os servicos que voce oferece aos tutores de pets.
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4 flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {activeCount} ativo{activeCount === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-blue-600 transition-colors"
          >
            <span className="material-icons mr-2 text-lg">add</span>
            Adicionar Servico
          </button>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <span className="material-icons text-5xl text-slate-400">
            inventory_2
          </span>
          <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
            Voce ainda nao cadastrou nenhum servico.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-blue-600 transition-colors"
          >
            Criar primeiro servico
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => {
            const style = accentStyles[service.accent];
            const statusLabel = service.active ? "Ativo" : "Inativo";

            return (
              <div
                key={service.id}
                className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300 flex flex-col ${
                  service.active ? "opacity-100" : "opacity-80"
                }`}
              >
                <div className="p-6 flex-1">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto ${style.iconWrap}`}
                  >
                    <span
                      className={`material-icons text-3xl ${style.iconColor}`}
                    >
                      {service.icon}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-2">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4 line-clamp-3">
                    {service.description}
                  </p>

                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      R$ {service.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                      {service.unit}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 rounded-b-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={service.active}
                      onClick={() => toggleServiceStatus(service.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        service.active
                          ? "bg-green-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          service.active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(service)}
                      className="text-slate-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-primary/10"
                      title="Editar"
                    >
                      <span className="material-icons text-xl">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeService(service.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Excluir"
                    >
                      <span className="material-icons text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={openCreateModal}
            className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 min-h-[280px]"
          >
            <span className="material-icons text-5xl mb-2">
              add_circle_outline
            </span>
            <span className="font-medium text-lg">Novo Servico</span>
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingId ? "Editar Servico" : "Novo Servico"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  htmlFor="service-title"
                >
                  Titulo
                </label>
                <input
                  id="service-title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  htmlFor="service-description"
                >
                  Descricao
                </label>
                <textarea
                  id="service-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    htmlFor="service-price"
                  >
                    Preco (R$)
                  </label>
                  <input
                    id="service-price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    htmlFor="service-unit"
                  >
                    Unidade
                  </label>
                  <input
                    id="service-unit"
                    type="text"
                    value={form.unit}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, unit: event.target.value }))
                    }
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    htmlFor="service-icon"
                  >
                    Icone (material icon)
                  </label>
                  <input
                    id="service-icon"
                    type="text"
                    value={form.icon}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, icon: event.target.value }))
                    }
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                    htmlFor="service-accent"
                  >
                    Cor
                  </label>
                  <select
                    id="service-accent"
                    value={form.accent}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        accent: event.target.value as Accent,
                      }))
                    }
                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                  >
                    <option value="primary">Primaria</option>
                    <option value="orange">Laranja</option>
                    <option value="green">Verde</option>
                    <option value="violet">Violeta</option>
                  </select>
                </div>
              </div>

              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      active: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Servico ativo
                </span>
              </label>

              {formError && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <span className="material-icons text-base">
                    error_outline
                  </span>
                  {formError}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-medium"
                >
                  {editingId ? "Salvar alteracoes" : "Criar servico"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
