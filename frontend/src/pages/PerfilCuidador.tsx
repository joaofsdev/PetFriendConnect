import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  obterPerfilCuidador,
  obterAgendaCuidador,
  type CuidadorPerfil,
  type AgendaSlot,
} from "../services/cuidadores";

export default function PerfilCuidador() {
  const navigate = useNavigate();
  const { id } = useParams();
  const caregiverId = Number(id);

  const [caregiver, setCaregiver] = useState<CuidadorPerfil | null>(null);
  const [agenda, setAgenda] = useState<AgendaSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const perfilRes = await obterPerfilCuidador(caregiverId);
        setCaregiver(perfilRes.data);
        try {
          const agendaRes = await obterAgendaCuidador(caregiverId);
          setAgenda(agendaRes.data);
        } catch { /* agenda may be empty */ }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (caregiverId) load();
  }, [caregiverId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons animate-spin text-primary text-4xl">refresh</span>
      </div>
    );
  }

  if (error || !caregiver) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center">
        <span className="material-icons text-5xl text-slate-400">person_off</span>
        <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Cuidador não encontrado</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Este perfil não existe ou não está mais disponível.</p>
        <Link to="/encontrar-cuidadores" className="inline-flex mt-5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors">
          Voltar para busca
        </Link>
      </div>
    );
  }

  const slotsDisponiveis = agenda.filter((s) => s.disponivel);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative shrink-0">
            {caregiver.fotoPerfil ? (
              <img src={caregiver.fotoPerfil} alt={caregiver.nome} className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" />
            ) : (
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md">
                <span className="material-icons text-primary text-5xl">person</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white truncate">{caregiver.nome}</h1>
            {caregiver.endereco && (
              <div className="flex items-center text-slate-500 dark:text-slate-400 mt-2">
                <span className="material-icons text-lg mr-1">location_on</span>
                {caregiver.endereco}
              </div>
            )}
            {caregiver.descricao && (
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-3xl mt-4">{caregiver.descricao}</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Serviços */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Serviços e Preços</h2>
            </div>
            {caregiver.servicosCriados.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Este cuidador ainda não cadastrou serviços.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {caregiver.servicosCriados.map((service) => (
                  <div key={service.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-slate-800 text-primary">
                        <span className="material-icons text-2xl">miscellaneous_services</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{service.nome}</h3>
                        {service.descricao && (
                          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{service.descricao}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{service.duracao} min</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-xl font-bold text-slate-900 dark:text-white">
                        R$ {Number(service.preco).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar - Disponibilidade */}
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 sticky top-24 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Disponibilidade</h2>
              {slotsDisponiveis.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhum horário disponível no momento.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {slotsDisponiveis.slice(0, 10).map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {new Date(slot.data).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-slate-500">{slot.servico.nome}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate("/agendamento")}
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                Agendar Serviço
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">Cancelamento gratuito até 24h antes.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
