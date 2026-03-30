import { useMemo, useState } from "react";

type LogSeverity = "low" | "medium" | "high";

type LogEntry = {
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  severity: LogSeverity;
};

const logsMock: LogEntry[] = [
  { timestamp: "2023-10-24 14:32:01", actor: "Sarah J.", action: "USER_DEACTIVATED", target: "USR-99281", ip: "192.168.1.42", severity: "high" },
  { timestamp: "2023-10-24 13:15:45", actor: "Marcus A.", action: "PAYMENT_REFUNDED", target: "TXN-88120", ip: "10.0.0.51", severity: "medium" },
  { timestamp: "2023-10-24 11:05:12", actor: "Admin Bot", action: "SYSTEM_CONFIG_UPDATED", target: "CFG-PAYMENTS", ip: "10.0.0.10", severity: "low" },
  { timestamp: "2023-10-23 22:08:10", actor: "Julia M.", action: "REPORT_RESOLVED", target: "RPT-00056", ip: "172.16.0.11", severity: "medium" },
];

function severityStyle(severity: LogSeverity) {
  if (severity === "high") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (severity === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
}

export default function AdminLogs() {
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const rows = useMemo(() => {
    return logsMock.filter((item) => {
      const text = `${item.actor} ${item.action} ${item.target}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [search]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Logs de Auditoria</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Historico de acoes sensiveis executadas na plataforma.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Exportar CSV</button>
          <button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600">Atualizar</button>
        </div>
      </section>

      <section>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por ator, acao ou alvo"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/70">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Ator</th>
                <th className="px-4 py-3">Acao</th>
                <th className="px-4 py-3">Alvo</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Severidade</th>
                <th className="px-4 py-3 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={`${item.timestamp}-${item.target}`} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3 font-mono text-xs">{item.timestamp}</td>
                  <td className="px-4 py-3">{item.actor}</td>
                  <td className="px-4 py-3 font-medium">{item.action}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{item.target}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.ip}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${severityStyle(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(item)}
                      className="rounded-md px-2 py-1 text-primary hover:bg-primary/10"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedLog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Evento de auditoria
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Dados completos do registro selecionado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Fechar log"
              >
                <span className="material-icons text-base">close</span>
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Timestamp:</span> {selectedLog.timestamp}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Ator:</span> {selectedLog.actor}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Acao:</span> {selectedLog.action}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Alvo:</span> {selectedLog.target}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">IP:</span> {selectedLog.ip}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Severidade:</span> <span className="uppercase">{selectedLog.severity}</span>
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
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
