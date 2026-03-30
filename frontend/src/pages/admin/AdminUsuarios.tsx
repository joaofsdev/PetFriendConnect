import { useMemo, useState } from "react";

type UserType = "dono" | "cuidador" | "admin";
type UserStatus = "ativo" | "inativo" | "suspenso";

type UserRow = {
  id: number;
  name: string;
  email: string;
  type: UserType;
  status: UserStatus;
  createdAt: string;
};

const usersMock: UserRow[] = [
  { id: 1, name: "Sarah Jenkins", email: "sarah.j@example.com", type: "dono", status: "ativo", createdAt: "24/10/2023" },
  { id: 2, name: "Michael Chen", email: "m.chen@cuidador.net", type: "cuidador", status: "ativo", createdAt: "12/09/2023" },
  { id: 3, name: "Emily Davis", email: "emily.d@example.com", type: "dono", status: "inativo", createdAt: "01/11/2023" },
  { id: 4, name: "Marcus Admin", email: "admin@petfriend.com", type: "admin", status: "ativo", createdAt: "11/08/2023" },
  { id: 5, name: "Karen White", email: "karen.w@example.com", type: "cuidador", status: "suspenso", createdAt: "19/07/2023" },
];

function statusStyle(status: UserStatus) {
  if (status === "ativo") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (status === "inativo") return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

export default function AdminUsuarios() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"todos" | UserType>("todos");
  const [statusFilter, setStatusFilter] = useState<"todos" | UserStatus>("todos");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const filteredUsers = useMemo(() => {
    return usersMock.filter((user) => {
      const byText = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
      const byType = typeFilter === "todos" || user.type === typeFilter;
      const byStatus = statusFilter === "todos" || user.status === statusFilter;
      return byText && byType && byStatus;
    });
  }, [search, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestao de Usuarios</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitore contas, papeis e status de acesso.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600">
          <span className="material-icons text-base">person_add</span>
          Novo usuario
        </button>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou email"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as "todos" | UserType)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="todos">Todos os tipos</option>
          <option value="dono">Dono</option>
          <option value="cuidador">Cuidador</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "todos" | UserStatus)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="suspenso">Suspenso</option>
        </select>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/70">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{user.type}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusStyle(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{user.createdAt}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="rounded-md px-2 py-1 text-primary hover:bg-primary/10"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Detalhes do usuario
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Informacoes de conta e perfil.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Fechar detalhes"
              >
                <span className="material-icons text-base">close</span>
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">ID:</span> {selectedUser.id}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Nome:</span> {selectedUser.name}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Email:</span> {selectedUser.email}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Tipo:</span> <span className="capitalize">{selectedUser.type}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Status:</span> <span className="capitalize">{selectedUser.status}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Cadastro:</span> {selectedUser.createdAt}
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
