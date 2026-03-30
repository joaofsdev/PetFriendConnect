import { useMemo, useState } from "react";

type ReportStatus = "pendente" | "analise" | "resolvido";

type ReportItem = {
  id: number;
  reporter: string;
  target: string;
  category: string;
  status: ReportStatus;
  date: string;
};

const reportsMock: ReportItem[] = [
  { id: 62, reporter: "Sarah Jenkins", target: "Mike Thompson", category: "Comportamento abusivo", status: "pendente", date: "24/10/2023" },
  { id: 56, reporter: "Alice Miller", target: "Bob Davidson", category: "Fraude", status: "analise", date: "23/10/2023" },
  { id: 55, reporter: "John Doe", target: "Emily Stone", category: "Atraso", status: "resolvido", date: "22/10/2023" },
  { id: 52, reporter: "Karen White", target: "Sistema", category: "Erro tecnico", status: "resolvido", date: "20/10/2023" },
];

function statusStyle(status: ReportStatus) {
  if (status === "pendente") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (status === "analise") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
}

export default function AdminDenuncias() {
  const [statusFilter, setStatusFilter] = useState<"todas" | ReportStatus>("todas");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const rows = useMemo(() => {
    if (statusFilter === "todas") return reportsMock;
    return reportsMock.filter((item) => item.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestao de Denuncias</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe moderacao e prioridade de analise.</p>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter("todas")}
          className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === "todas" ? "bg-primary text-white" : "bg-white dark:bg-slate-900"}`}
        >
          Todas
        </button>
        <button
          onClick={() => setStatusFilter("pendente")}
          className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === "pendente" ? "bg-primary text-white" : "bg-white dark:bg-slate-900"}`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setStatusFilter("analise")}
          className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === "analise" ? "bg-primary text-white" : "bg-white dark:bg-slate-900"}`}
        >
          Em analise
        </button>
        <button
          onClick={() => setStatusFilter("resolvido")}
          className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === "resolvido" ? "bg-primary text-white" : "bg-white dark:bg-slate-900"}`}
        >
          Resolvidas
        </button>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/70">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Denunciante</th>
                <th className="px-4 py-3">Denunciado</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">#{item.id}</td>
                  <td className="px-4 py-3">{item.reporter}</td>
                  <td className="px-4 py-3">{item.target}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(item)}
                      className="rounded-md px-2 py-1 text-primary hover:bg-primary/10"
                    >
                      Analisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedReport && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Denuncia #{selectedReport.id}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Detalhes para moderacao da ocorrencia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Fechar denuncia"
              >
                <span className="material-icons text-base">close</span>
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Denunciante:</span> {selectedReport.reporter}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Denunciado:</span> {selectedReport.target}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Categoria:</span> {selectedReport.category}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Status:</span> <span className="capitalize">{selectedReport.status}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Data:</span> {selectedReport.date}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedReport((prev) => (prev ? { ...prev, status: "analise" } : prev))}
                className="rounded-lg border border-blue-300 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
              >
                Marcar em analise
              </button>
              <button
                type="button"
                onClick={() => setSelectedReport((prev) => (prev ? { ...prev, status: "resolvido" } : prev))}
                className="rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
              >
                Marcar resolvido
              </button>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
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
