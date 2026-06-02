import { useEffect, useMemo, useState } from "react";
import type { SyntheticEvent } from "react";
import { listarCuidadores } from "../services/cuidadores";
import { criarServico, editarServico, type Servico } from "../services/servicos";
import { useAuth } from "../hooks/useAuth";

interface ServiceForm {
  nome: string;
  descricao: string;
  preco: string;
  duracao: string;
}

const defaultForm: ServiceForm = { nome: "", descricao: "", preco: "", duracao: "60" };

export default function MeusServicos() {
  const { user } = useAuth();
  const [services, setServices] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceForm>(defaultForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (!user) return;
        const res = await listarCuidadores();
        const me = res.data.find((c) => c.id === user.id);
        if (me) {
          setServices(me.servicosCriados.map((s) => ({
            id: s.id,
            nome: s.nome,
            descricao: s.descricao ?? null,
            preco: s.preco,
            duracao: s.duracao,
            cuidadorId: user.id,
            ativo: true,
            dataCriacao: s.dataCriacao ?? "",
            dataAtualizacao: "",
          })));
        }
      } catch { /* empty */ } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const activeCount = useMemo(() => services.filter((s) => s.ativo).length, [services]);

  function openCreateModal() {
    setEditingId(null);
    setForm(defaultForm);
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(service: Servico) {
    setEditingId(service.id);
    setForm({
      nome: service.nome,
      descricao: service.descricao ?? "",
      preco: String(service.preco),
      duracao: String(service.duracao),
    });
    setFormError("");
    setShowModal(true);
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nome.trim()) { setFormError("Preencha o nome."); return; }
    const parsedPrice = Number(form.preco.replace(",", "."));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) { setFormError("Informe um preço válido."); return; }
    const duracao = Number(form.duracao);
    if (!duracao || duracao <= 0) { setFormError("Informe uma duração válida."); return; }

    try {
      if (editingId) {
        const res = await editarServico(editingId, { nome: form.nome.trim(), descricao: form.descricao.trim(), preco: parsedPrice, duracao });
        setServices((prev) => prev.map((s) => s.id === editingId ? res.data : s));
      } else {
        const res = await criarServico({ nome: form.nome.trim(), descricao: form.descricao.trim(), preco: parsedPrice, duracao });
        setServices((prev) => [...prev, res.data]);
      }
      setShowModal(false);
    } catch {
      setFormError("Erro ao salvar serviço.");
    }
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
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meus Serviços</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gerencie os serviços que você oferece aos tutores de pets.</p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4 flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{activeCount} ativo{activeCount === 1 ? "" : "s"}</span>
          <button type="button" onClick={openCreateModal} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-blue-600 transition-colors">
            <span className="material-icons mr-2 text-lg">add</span>Adicionar Serviço
          </button>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <span className="material-icons text-5xl text-slate-400">inventory_2</span>
          <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">Você ainda não cadastrou nenhum serviço.</p>
          <button type="button" onClick={openCreateModal} className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-blue-600 transition-colors">Criar primeiro serviço</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300 flex flex-col">
              <div className="p-6 flex-1">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto bg-primary/10">
                  <span className="material-icons text-3xl text-primary">miscellaneous_services</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-2">{service.nome}</h3>
                {service.descricao && <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4 line-clamp-3">{service.descricao}</p>}
                <div className="text-center mb-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">R$ {Number(service.preco).toFixed(2).replace(".", ",")}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{service.duracao} min</span>
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 rounded-b-xl flex items-center justify-end gap-1">
                <button type="button" onClick={() => openEditModal(service)} className="text-slate-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-primary/10" title="Editar">
                  <span className="material-icons text-xl">edit</span>
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={openCreateModal} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 min-h-[280px]">
            <span className="material-icons text-5xl mb-2">add_circle_outline</span>
            <span className="font-medium text-lg">Novo Serviço</span>
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{editingId ? "Editar Serviço" : "Novo Serviço"}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-icons">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="service-nome">Nome</label>
                <input id="service-nome" type="text" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary p-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="service-desc">Descrição</label>
                <textarea id="service-desc" rows={3} value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary p-2.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="service-preco">Preço (R$)</label>
                  <input id="service-preco" type="number" min="1" step="0.01" value={form.preco} onChange={(e) => setForm((p) => ({ ...p, preco: e.target.value }))} className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="service-duracao">Duração (min)</label>
                  <input id="service-duracao" type="number" min="1" value={form.duracao} onChange={(e) => setForm((p) => ({ ...p, duracao: e.target.value }))} className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary p-2.5" />
                </div>
              </div>
              {formError && <div className="text-sm text-red-500 flex items-center gap-2"><span className="material-icons text-base">error_outline</span>{formError}</div>}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-medium">{editingId ? "Salvar alterações" : "Criar serviço"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
