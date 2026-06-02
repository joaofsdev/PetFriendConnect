import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { listarPets, type Pet } from "../services/pets";
import { listarReservas, type Reserva } from "../services/reservas";

export default function DashboardDono() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [petsRes, reservasRes] = await Promise.all([
          listarPets(),
          listarReservas(),
        ]);
        setPets(petsRes.data);
        setReservas(reservasRes.data);
      } catch { /* empty */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const reservasAtivas = reservas.filter(
    (r) => r.status === "PENDENTE" || r.status === "CONFIRMADA",
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons animate-spin text-primary text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Olá, {user?.nome ?? "Usuário"}! 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Aqui está um resumo dos seus pets e reservas.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Meus Pets</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{pets.length}</h3>
            <Link to="/meus-pets" className="text-xs font-medium mt-2 flex items-center gap-1 text-primary">
              Ver todos os pets
              <span className="material-icons text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <span className="material-icons">pets</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Reservas Ativas</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{reservasAtivas.length}</h3>
            <Link to="/minhas-reservas" className="text-xs font-medium mt-2 flex items-center gap-1 text-primary">
              Ver reservas
              <span className="material-icons text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
            <span className="material-icons">event_available</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total de Reservas</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{reservas.length}</h3>
            <p className="text-xs font-medium mt-2 text-slate-500">{reservas.filter((r) => r.status === "CONCLUIDA").length} concluídas</p>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600">
            <span className="material-icons">account_balance_wallet</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Meus Pets */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Meus Pets</h2>
            <Link to="/meus-pets" className="text-sm text-primary font-medium hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-4">
            {pets.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhum pet cadastrado ainda.</p>
            ) : (
              pets.slice(0, 3).map((pet) => (
                <div key={pet.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  {pet.fotoPet ? (
                    <img src={pet.fotoPet} alt={pet.nome} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-icons text-primary text-2xl">pets</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white">{pet.nome}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{pet.raca} • {pet.idade} {pet.idade === 1 ? "ano" : "anos"}</p>
                  </div>
                </div>
              ))
            )}
            <Link to="/meus-pets" className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
              <span className="material-icons text-[18px]">add</span>
              Adicionar pet
            </Link>
          </div>
        </div>

        {/* Próximas Reservas */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Próximas Reservas</h2>
            <Link to="/minhas-reservas" className="text-sm text-primary font-medium hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-4">
            {reservasAtivas.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma reserva ativa no momento.</p>
            ) : (
              reservasAtivas.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-start gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-primary text-sm">event</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white">{r.pet?.nome ?? "Pet"}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {r.servico?.nome ?? "Serviço"} • {r.cuidador?.nome ?? "Cuidador"}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className={`font-semibold ${r.status === "CONFIRMADA" ? "text-green-600" : "text-orange-500"}`}>
                        {r.status === "CONFIRMADA" ? "Confirmado" : "Pendente"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            <Link to="/encontrar-cuidadores" className="w-full py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <span className="material-icons text-[18px]">search</span>
              Encontrar Cuidador
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
