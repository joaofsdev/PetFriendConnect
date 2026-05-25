import { useState } from "react";
import type { SyntheticEvent } from "react";
import { useAuth } from "../contexts/AuthContext";

type Section = "perfil" | "seguranca" | "preferencias";

function Toggle({ enabled, onChange }: { readonly enabled: boolean; readonly onChange: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={enabled} onClick={onChange} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

const inputClass = "shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white rounded-lg p-2.5 bg-white";

export default function Configuracoes() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("perfil");
  const [savedMsg, setSavedMsg] = useState("");

  // Perfil - initialized from user context
  const [nome, setNome] = useState(user?.nome ?? "");
  const [email] = useState(user?.email ?? "");
  const [telefone, setTelefone] = useState(user?.telefone ?? "");
  const [endereco, setEndereco] = useState(user?.endereco ?? "");

  // Segurança
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaError, setSenhaError] = useState("");

  // Preferências
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  function showSaved(msg: string) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 3000);
  }

  function handleSavePerfil(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: call API to update profile
    showSaved("Dados pessoais salvos com sucesso!");
  }

  function handleSaveSenha(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) { setSenhaError("As senhas não coincidem."); return; }
    if (novaSenha.length < 8) { setSenhaError("A senha deve ter no mínimo 8 caracteres."); return; }
    setSenhaError("");
    // TODO: call API to change password
    showSaved("Senha alterada com sucesso!");
    setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
  }

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: "perfil", label: "Dados Pessoais", icon: "person" },
    { key: "seguranca", label: "Segurança", icon: "lock" },
    { key: "preferencias", label: "Preferências", icon: "tune" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie suas informações pessoais e preferências.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Nav */}
        <nav className="w-full lg:w-56 shrink-0">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.key}>
                <button type="button" onClick={() => setActiveSection(item.key)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === item.key ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                  <span className="material-icons text-lg">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          {activeSection === "perfil" && (
            <form onSubmit={handleSavePerfil} className="space-y-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Dados Pessoais</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cfg-nome">Nome</label>
                <input id="cfg-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cfg-email">Email</label>
                <input id="cfg-email" type="email" value={email} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
                <p className="text-xs text-slate-400 mt-1">O email não pode ser alterado.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cfg-telefone">Telefone</label>
                <input id="cfg-telefone" type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cfg-endereco">Endereço</label>
                <input id="cfg-endereco" type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-medium">Salvar</button>
            </form>
          )}

          {activeSection === "seguranca" && (
            <form onSubmit={handleSaveSenha} className="space-y-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Alterar Senha</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cfg-senha-atual">Senha Atual</label>
                <input id="cfg-senha-atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cfg-nova-senha">Nova Senha</label>
                <input id="cfg-nova-senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cfg-confirmar-senha">Confirmar Nova Senha</label>
                <input id="cfg-confirmar-senha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className={inputClass} />
              </div>
              {senhaError && <p className="text-sm text-red-500">{senhaError}</p>}
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-medium">Alterar Senha</button>
            </form>
          )}

          {activeSection === "preferencias" && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Preferências de Notificação</h3>
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Notificações por email</p>
                  <p className="text-xs text-slate-500">Receba atualizações sobre reservas e mensagens.</p>
                </div>
                <Toggle enabled={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Notificações por SMS</p>
                  <p className="text-xs text-slate-500">Receba lembretes de agendamentos por SMS.</p>
                </div>
                <Toggle enabled={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {savedMsg && (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-l-4 border-green-500 p-4 z-50">
          <div className="flex items-center gap-3">
            <span className="material-icons text-green-500">check_circle</span>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{savedMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
