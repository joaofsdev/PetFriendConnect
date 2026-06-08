import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  listarPets,
  criarPet,
  atualizarPet,
  removerPet,
  type Pet,
  type CriarPetPayload,
} from "../services/pets";

export default function MeusPets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listarPets();
      setPets(res.data);
    } catch {
      setError("Erro ao carregar pets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPets();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchPets]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover este pet?")) return;
    try {
      await removerPet(id);
      setPets((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Erro ao remover pet.");
    }
  }

  function openEdit(pet: Pet) {
    setEditingPet(pet);
    setShowForm(true);
  }

  function openCreate() {
    setEditingPet(null);
    setShowForm(true);
  }

  async function handleSubmit(data: CriarPetPayload) {
    try {
      if (editingPet) {
        const res = await atualizarPet(editingPet.id, data);
        setPets((prev) => prev.map((p) => (p.id === editingPet.id ? res.data : p)));
      } else {
        const res = await criarPet(data);
        setPets((prev) => [...prev, res.data]);
      }
      setShowForm(false);
      setEditingPet(null);
    } catch {
      setError("Erro ao salvar pet.");
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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-sm text-slate-400 mb-2">
            <span className="material-icons text-xl">home</span>
            <span className="material-icons text-xl">chevron_right</span>
            <span className="text-slate-900 dark:text-white font-medium">Meus Pets</span>
          </nav>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meus Pets</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie os perfis dos seus amigos peludos.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm self-start sm:self-auto"
        >
          <span className="material-icons text-lg">add</span>
          Adicionar Pet
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Modal/Form */}
      {showForm && (
        <PetForm
          pet={editingPet}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingPet(null); }}
        />
      )}

      {/* Pet Grid */}
      {pets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="relative h-48 w-full bg-slate-200 flex items-center justify-center">
                {pet.fotoPet ? (
                  <img src={pet.fotoPet} alt={pet.nome} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-icons text-6xl text-slate-400">pets</span>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(pet)}
                    className="bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-primary shadow-sm backdrop-blur-sm"
                  >
                    <span className="material-icons text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-red-500 shadow-sm backdrop-blur-sm"
                  >
                    <span className="material-icons text-sm">delete</span>
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pet.nome}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{pet.raca || "Sem raça definida"}</p>
                  </div>
                  {pet.idade != null && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300">
                      {pet.idade} {pet.idade === 1 ? "ano" : "anos"}
                    </span>
                  )}
                </div>
                {pet.descricao && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{pet.descricao}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center max-w-2xl mx-auto w-full">
          <div className="mx-auto h-32 w-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <span className="material-icons text-6xl text-slate-400 dark:text-slate-500">pets</span>
          </div>
          <h3 className="text-xl font-medium text-slate-900 dark:text-white">Nenhum pet cadastrado</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Comece cadastrando seu primeiro pet para encontrar cuidadores ideais.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            <span className="material-icons text-lg">add_circle</span>
            Cadastrar meu primeiro pet
          </button>
        </div>
      )}
    </div>
  );
}

function PetForm({
  pet,
  onSubmit,
  onCancel,
}: {
  pet: Pet | null;
  onSubmit: (data: CriarPetPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [nome, setNome] = useState(pet?.nome ?? "");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState(pet?.raca ?? "");
  const [idade, setIdade] = useState(pet?.idade?.toString() ?? "");
  const [observacoes, setObservacoes] = useState(pet?.descricao ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({
      nome,
      especie: especie || "Não informada",
      raca: raca || undefined,
      idade: idade ? parseInt(idade) : undefined,
      observacoes: observacoes || undefined,
    });
    setSubmitting(false);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        {pet ? "Editar Pet" : "Novo Pet"}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Espécie *</label>
          <input required value={especie} onChange={(e) => setEspecie(e.target.value)} placeholder="Cachorro, Gato..." className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Raça</label>
          <input value={raca} onChange={(e) => setRaca(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Idade</label>
          <input type="number" min="0" value={idade} onChange={(e) => setIdade(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações</label>
          <textarea rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 disabled:opacity-70">
            {submitting ? "Salvando..." : pet ? "Atualizar" : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
