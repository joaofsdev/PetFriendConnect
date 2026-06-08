import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarPets, type Pet } from "../services/pets";
import { listarCuidadores, type Cuidador } from "../services/cuidadores";
import { obterAgendaCuidador, type AgendaSlot } from "../services/cuidadores";
import { criarReserva } from "../services/reservas";

const STEPS = ["Escolher Pet", "Cuidador e Serviço", "Confirmação"];

export default function Agendamento() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Data
  const [pets, setPets] = useState<Pet[]>([]);
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [agendaSlots, setAgendaSlots] = useState<AgendaSlot[]>([]);

  // Selections
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [selectedCuidador, setSelectedCuidador] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AgendaSlot | null>(null);

  // State
  const [confirmed, setConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [petsRes, cuidadoresRes] = await Promise.all([
          listarPets(),
          listarCuidadores(),
        ]);
        setPets(petsRes.data);
        setCuidadores(cuidadoresRes.data);
      } catch { /* empty */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedCuidador) {
      obterAgendaCuidador(selectedCuidador).then((res) => {
        setAgendaSlots(res.data.filter((s) => s.disponivel));
      }).catch(() => setAgendaSlots([]));
    }
  }, [selectedCuidador]);

  const chosenPet = pets.find((p) => p.id === selectedPet);
  const chosenCuidador = cuidadores.find((c) => c.id === selectedCuidador);

  function handleNext() {
    if (step === 0 && !selectedPet) return;
    if (step === 1 && !selectedSlot) {
      setError("Selecione um horário disponível.");
      return;
    }
    setError("");
    setStep((s) => s + 1);
  }

  async function handleConfirm() {
    if (!selectedPet || !selectedSlot || !selectedCuidador) return;
    try {
      await criarReserva({
        cuidadorId: selectedCuidador,
        petId: selectedPet,
        servicoId: selectedSlot.servico.id,
        agendaId: selectedSlot.id,
      });
      window.dispatchEvent(new Event("petfriend:reservas-updated"));
      setConfirmed(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch {
      setError("Erro ao confirmar agendamento. Tente novamente.");
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
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Agendamento</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Agende um serviço para o seu pet em poucos passos.</p>
      </div>

      <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[580px] border border-slate-200 dark:border-slate-700">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">P</div>
              <span className="font-bold text-slate-800 dark:text-white tracking-tight text-sm">PetFriend Connect</span>
            </div>
            <nav>
              <ol className="space-y-6">
                {STEPS.map((label, i) => {
                  const done = i < step;
                  const current = i === step;
                  let stepBadgeClass = "bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-500";
                  if (done || current) stepBadgeClass = "bg-primary text-white";
                  return (
                    <li key={label} className="relative">
                      {i < STEPS.length - 1 && <div className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${done ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />}
                      <div className="relative flex items-center gap-4">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full z-10 font-bold text-sm transition-colors ${stepBadgeClass}`}>
                          {done ? <span className="material-icons text-sm">check</span> : i + 1}
                        </span>
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wide ${current || done ? "text-primary" : "text-slate-400"}`}>Passo {i + 1}</p>
                          <p className={`text-sm font-medium ${current || done ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{label}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{STEPS[step]}</h1>
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {/* STEP 0 — Pet */}
            {step === 0 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Qual pet será atendido?</h2>
                {pets.length === 0 ? (
                  <p className="text-sm text-slate-500">Você não tem pets cadastrados. <button onClick={() => navigate("/meus-pets")} className="text-primary hover:underline">Cadastre um pet</button></p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pets.map((pet) => (
                      <button key={pet.id} onClick={() => setSelectedPet(pet.id)} className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${selectedPet === pet.id ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                        {pet.fotoPet ? (
                          <img src={pet.fotoPet} alt={pet.nome} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center"><span className="material-icons text-primary">pets</span></div>
                        )}
                        <div>
                          <p className={`font-semibold ${selectedPet === pet.id ? "text-primary" : "text-slate-900 dark:text-white"}`}>{pet.nome}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{pet.raca}</p>
                        </div>
                        {selectedPet === pet.id && <span className="material-icons text-primary ml-auto">check_circle</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 1 — Cuidador e Horário */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Selecione o Cuidador</h2>
                  {cuidadores.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum cuidador disponível no momento.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cuidadores.map((c) => (
                        <button key={c.id} onClick={() => { setSelectedCuidador(c.id); setSelectedSlot(null); }} className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${selectedCuidador === c.id ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                          {c.fotoPerfil ? (
                            <img src={c.fotoPerfil} alt={c.nome} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><span className="material-icons text-primary">person</span></div>
                          )}
                          <div>
                            <p className={`font-semibold ${selectedCuidador === c.id ? "text-primary" : "text-slate-900 dark:text-white"}`}>{c.nome}</p>
                            <p className="text-xs text-slate-500">{c.servicosCriados.length} serviço(s)</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCuidador && (
                  <div>
                    <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Horários Disponíveis</h2>
                    {agendaSlots.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum horário disponível para este cuidador.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {agendaSlots.map((slot) => (
                          <button key={slot.id} onClick={() => setSelectedSlot(slot)} className={`p-3 rounded-lg border-2 text-left transition-all ${selectedSlot?.id === slot.id ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                            <p className="font-medium text-sm text-slate-900 dark:text-white">{new Date(slot.data).toLocaleDateString("pt-BR")} - {new Date(slot.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                            <p className="text-xs text-slate-500 mt-1">{slot.servico.nome} • R$ {Number(slot.servico.preco).toFixed(2).replace(".", ",")}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <span className="material-icons text-base">error_outline</span>
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Confirmação */}
            {step === 2 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Resumo do Agendamento</h2>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Pet</p>
                      <p className="font-medium text-slate-900 dark:text-white">{chosenPet?.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Cuidador</p>
                      <p className="font-medium text-slate-900 dark:text-white">{chosenCuidador?.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Serviço</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedSlot?.servico.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Data</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedSlot ? new Date(selectedSlot.data).toLocaleDateString("pt-BR") : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Total</span>
                    <span className="text-xl font-bold text-primary">
                      R$ {selectedSlot ? Number(selectedSlot.servico.preco).toFixed(2).replace(".", ",") : "0,00"}
                    </span>
                  </div>
                </div>

                {confirmed && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                    <span className="material-icons text-green-500 text-2xl">check_circle</span>
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">Agendamento Confirmado!</p>
                      <p className="text-sm text-green-600 dark:text-green-500">O cuidador foi notificado.</p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mt-4 flex items-center gap-2 text-red-500 text-sm">
                    <span className="material-icons text-base">error_outline</span>
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <button onClick={() => step === 0 ? navigate(-1) : setStep((s) => s - 1)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium px-4 py-2 rounded-lg transition-colors">
              {step === 0 ? "Cancelar" : "Voltar"}
            </button>
            {step < 2 ? (
              <button onClick={handleNext} disabled={step === 0 && !selectedPet} className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                Próximo <span className="material-icons text-sm">arrow_forward</span>
              </button>
            ) : (
              <button onClick={handleConfirm} disabled={confirmed} className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-primary/30 transition-all">
                {confirmed ? "Confirmado!" : "Confirmar Agendamento"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-6 right-6 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-l-4 border-green-500 p-4 z-50">
          <div className="flex items-start gap-3">
            <span className="material-icons text-green-500 text-2xl">check_circle</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Agendamento Confirmado!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Veja os detalhes no seu painel.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
