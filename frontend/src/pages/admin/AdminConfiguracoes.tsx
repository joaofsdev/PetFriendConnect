import { useState } from "react";

type SettingsState = {
  platformFee: number;
  cancellationHours: number;
  maxPetsPerBooking: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

export default function AdminConfiguracoes() {
  const [settings, setSettings] = useState<SettingsState>({
    platformFee: 15,
    cancellationHours: 24,
    maxPetsPerBooking: 4,
    emailNotifications: true,
    smsNotifications: false,
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configuracoes Globais</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ajuste parametros financeiros e operacionais da plataforma.</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600">Salvar alteracoes</button>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Configuracao Financeira</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600 dark:text-slate-300">Taxa da plataforma (%)</span>
              <input
                type="number"
                value={settings.platformFee}
                onChange={(event) => setSettings((prev) => ({ ...prev, platformFee: Number(event.target.value) }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600 dark:text-slate-300">Janela de cancelamento (horas)</span>
              <input
                type="number"
                value={settings.cancellationHours}
                onChange={(event) => setSettings((prev) => ({ ...prev, cancellationHours: Number(event.target.value) }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Limites Operacionais</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600 dark:text-slate-300">Maximo de pets por reserva</span>
              <input
                type="number"
                value={settings.maxPetsPerBooking}
                onChange={(event) => setSettings((prev) => ({ ...prev, maxPetsPerBooking: Number(event.target.value) }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notificacoes</h3>
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
            <span>Email transacional</span>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(event) => setSettings((prev) => ({ ...prev, emailNotifications: event.target.checked }))}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
            <span>Alertas SMS criticos</span>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(event) => setSettings((prev) => ({ ...prev, smsNotifications: event.target.checked }))}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
