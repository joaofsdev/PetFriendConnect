import { useState } from "react";

interface Pet {
  id: number;
  name: string;
  breed: string;
  age: string;
  img: string;
  badges: { label: string; icon: string; color: string }[];
}

const initialPets: Pet[] = [
  {
    id: 1,
    name: "Buddy",
    breed: "Golden Retriever",
    age: "3 anos",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80",
    badges: [
      {
        label: "Medicação",
        icon: "medical_services",
        color:
          "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
      },
    ],
  },
  {
    id: 2,
    name: "Luna",
    breed: "Siamesa",
    age: "2 anos",
    img: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80",
    badges: [
      {
        label: "Cuidados Especiais",
        icon: "star",
        color:
          "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
      },
    ],
  },
  {
    id: 3,
    name: "Max",
    breed: "Beagle",
    age: "5 anos",
    img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80",
    badges: [],
  },
  {
    id: 4,
    name: "Oliver",
    breed: "SRD",
    age: "1 ano",
    img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
    badges: [
      {
        label: "Vacinas Pendentes",
        icon: "vaccines",
        color:
          "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      },
    ],
  },
];

export default function MeusPets() {
  const [pets, setPets] = useState<Pet[]>(initialPets);

  function handleDelete(id: number) {
    setPets((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-slate-400 mb-2">
            <span className="material-icons text-xl">home</span>
            <span className="material-icons text-xl">chevron_right</span>
            <span className="hover:text-slate-600 cursor-pointer">Perfil</span>
            <span className="material-icons text-xl">chevron_right</span>
            <span className="text-slate-900 dark:text-white font-medium">
              Meus Pets
            </span>
          </nav>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Meus Pets
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie os perfis dos seus amigos peludos.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm self-start sm:self-auto">
          <span className="material-icons text-lg">add</span>
          Adicionar Pet
        </button>
      </div>

      {/* Pet Grid */}
      {pets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Imagem */}
              <div className="relative h-48 w-full bg-slate-200">
                <img
                  src={pet.img}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
                {/* Botões de ação no hover */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-primary shadow-sm backdrop-blur-sm">
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

              {/* Info */}
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {pet.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {pet.breed}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300">
                    {pet.age}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {pet.badges.length > 0 ? (
                    pet.badges.map((badge) => (
                      <span
                        key={badge.label}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${badge.color}`}
                      >
                        <span className="material-icons text-[14px]">
                          {badge.icon}
                        </span>
                        {badge.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Sem observações especiais
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center max-w-2xl mx-auto w-full">
          <div className="mx-auto h-32 w-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <span className="material-icons text-6xl text-slate-400 dark:text-slate-500">
              pets
            </span>
          </div>
          <h3 className="text-xl font-medium text-slate-900 dark:text-white">
            Nenhum pet cadastrado
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Você ainda não adicionou nenhum amigo. Comece cadastrando seu
            primeiro pet para encontrar cuidadores ideais.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
            <span className="material-icons text-lg">add_circle</span>
            Cadastrar meu primeiro pet
          </button>
        </div>
      )}
    </div>
  );
}
