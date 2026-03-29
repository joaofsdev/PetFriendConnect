import { useState } from "react";
import { Link } from "react-router-dom";

interface Caregiver {
  id: number;
  name: string;
  location: string;
  price: string;
  priceUnit: string;
  rating: string;
  reviews: number;
  verified: boolean;
  bio: string;
  services: { label: string; color: string }[];
  img: string;
  avatar: string;
}

const caregivers: Caregiver[] = [
  {
    id: 1,
    name: "Ana Silva",
    location: "Vila Madalena, SP",
    price: "R$ 50",
    priceUnit: "por noite",
    rating: "4.9",
    reviews: 124,
    verified: true,
    bio: "Amo cachorros e tenho um grande quintal cercado para eles correrem à vontade...",
    services: [
      {
        label: "Passeio",
        color:
          "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
      },
      {
        label: "Hospedagem",
        color:
          "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
      },
      {
        label: "+2",
        color:
          "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
      },
    ],
    img: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: 2,
    name: "Carlos Mendes",
    location: "Pinheiros, SP",
    price: "R$ 65",
    priceUnit: "por noite",
    rating: "5.0",
    reviews: 42,
    verified: false,
    bio: "Treinador profissional com 5 anos de experiência. Especializado em cães agitados...",
    services: [
      {
        label: "Passeio",
        color:
          "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
      },
      {
        label: "Day Care",
        color:
          "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
      },
    ],
    img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 3,
    name: "Mariana Costa",
    location: "Jardins, SP",
    price: "R$ 90",
    priceUnit: "por noite",
    rating: "4.7",
    reviews: 89,
    verified: true,
    bio: "Estudante de veterinária oferecendo cuidados amorosos. Sei administrar medicamentos...",
    services: [
      {
        label: "Hospedagem",
        color:
          "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
      },
      {
        label: "Visita",
        color:
          "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300",
      },
    ],
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 4,
    name: "Pedro Santos",
    location: "Moema, SP",
    price: "R$ 45",
    priceUnit: "por passeio",
    rating: "4.8",
    reviews: 15,
    verified: false,
    bio: "Corredor ávido procurando companhia para os treinos matinais no Ibirapuera...",
    services: [
      {
        label: "Passeio",
        color:
          "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
      },
    ],
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: 5,
    name: "Julia Lima",
    location: "Itaim Bibi, SP",
    price: "R$ 70",
    priceUnit: "por visita",
    rating: "5.0",
    reviews: 210,
    verified: true,
    bio: "Especialista em gatos tímidos ou ansiosos. Faço eles se sentirem seguros e amados...",
    services: [
      {
        label: "Visita",
        color:
          "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300",
      },
      {
        label: "Gatos",
        color:
          "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300",
      },
    ],
    img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    id: 6,
    name: "Roberto Jr.",
    location: "Perdizes, SP",
    price: "R$ 55",
    priceUnit: "por passeio",
    rating: "4.6",
    reviews: 34,
    verified: false,
    bio: "Apaixonado por comportamento animal e passeios estruturados para cães de alta energia.",
    services: [
      {
        label: "Passeio",
        color:
          "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
      },
      {
        label: "Day Care",
        color:
          "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
      },
    ],
    img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

export default function EncontrarCuidadores() {
  const [search, setSearch] = useState("São Paulo, SP");
  const [sortBy, setSortBy] = useState("Recomendados");
  const [favorites, setFavorites] = useState<number[]>([]);

  function toggleFavorite(id: number) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de busca */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Localização */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-slate-400 text-xl">
                location_on
              </span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Bairro ou cidade"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>

          {/* Tipo de serviço */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-slate-400 text-xl">
                pets
              </span>
            </div>
            <select className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary text-sm">
              <option>Todos os serviços</option>
              <option>Passeio</option>
              <option>Hospedagem</option>
              <option>Day Care</option>
              <option>Visita</option>
            </select>
          </div>

          {/* Data */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-slate-400 text-xl">
                date_range
              </span>
            </div>
            <input
              type="date"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          {/* Botão buscar */}
          <button className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="material-icons text-sm">search</span>
            Buscar
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtros */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Filtros
              </h2>
              <button className="text-sm text-primary hover:underline">
                Limpar
              </button>
            </div>

            {/* Preço */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-icons text-primary text-base">
                  payments
                </span>
                Faixa de Preço (por noite)
              </h3>
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>R$ 20</span>
                <span>R$ 200+</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                defaultValue="80"
                className="w-full accent-primary"
              />
              <div className="mt-3 flex gap-3">
                <div className="w-1/2">
                  <label className="text-xs text-slate-400">Mín</label>
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-slate-400 text-sm">
                      R$
                    </span>
                    <input
                      type="number"
                      defaultValue="20"
                      className="w-full pl-8 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="text-xs text-slate-400">Máx</label>
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-slate-400 text-sm">
                      R$
                    </span>
                    <input
                      type="number"
                      defaultValue="120"
                      className="w-full pl-8 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Avaliação */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-icons text-primary text-base">
                  star
                </span>
                Avaliação
              </h3>
              <div className="space-y-2">
                {[
                  "5 estrelas",
                  "4.5 estrelas ou mais",
                  "4 estrelas ou mais",
                ].map((label, i) => (
                  <label
                    key={label}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={i === 1}
                      className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <span className="flex items-center text-sm text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
                      <span className="material-icons text-yellow-400 text-sm mr-1">
                        star
                      </span>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mais filtros */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-icons text-primary text-base">
                  add_circle_outline
                </span>
                Mais Filtros
              </h3>
              <div className="space-y-2">
                {[
                  "Tem quintal cercado",
                  "Sem outros pets",
                  "Experiência com filhotes",
                ].map((label) => (
                  <label
                    key={label}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid de resultados */}
        <div className="lg:col-span-3">
          {/* Header resultados */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Mostrando{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {caregivers.length}
              </span>{" "}
              cuidadores perto de{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                São Paulo
              </span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Ordenar:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-transparent font-medium text-slate-900 dark:text-white focus:ring-0 cursor-pointer border-none"
              >
                <option>Recomendados</option>
                <option>Menor preço</option>
                <option>Maior preço</option>
                <option>Avaliação</option>
              </select>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {caregivers.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
              >
                {/* Imagem */}
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(c.id)}
                    className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full transition-colors shadow-sm"
                  >
                    <span
                      className={`material-icons text-xl ${favorites.includes(c.id) ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
                    >
                      {favorites.includes(c.id)
                        ? "favorite"
                        : "favorite_border"}
                    </span>
                  </button>
                  {/* Avatar */}
                  <div className="absolute -bottom-10 left-4">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-sm"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 pt-12 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        {c.name}
                        {c.verified && (
                          <span className="material-icons text-green-500 text-base">
                            verified
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="material-icons text-xs">
                          location_on
                        </span>
                        {c.location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-bold text-primary">
                        {c.price}
                      </div>
                      <div className="text-xs text-slate-500">
                        {c.priceUnit}
                      </div>
                    </div>
                  </div>

                  {/* Avaliação */}
                  <div className="flex items-center mb-3">
                    <span className="material-icons text-yellow-400 text-lg">
                      star
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white ml-1">
                      {c.rating}
                    </span>
                    <span className="text-slate-400 text-sm ml-1">
                      ({c.reviews} avaliações)
                    </span>
                  </div>

                  {/* Tags de serviço */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.services.map((s) => (
                      <span
                        key={s.label}
                        className={`px-2 py-1 text-xs font-medium rounded ${s.color}`}
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>

                  {/* Bio + botão */}
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 italic">
                      "{c.bio}"
                    </p>
                    <Link
                      to={`/perfil-cuidador/${c.id}`}
                      className="block w-full py-2.5 text-center bg-white dark:bg-transparent border border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-10 pt-6">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Mostrando <span className="font-medium">1</span> a{" "}
              <span className="font-medium">6</span> de{" "}
              <span className="font-medium">142</span> resultados
            </p>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm">
              <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-icons text-sm">chevron_left</span>
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-slate-300 dark:ring-slate-700 ${
                    page === 1
                      ? "bg-primary text-white z-10"
                      : "text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700">
                ...
              </span>
              <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-200 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                12
              </button>
              <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
