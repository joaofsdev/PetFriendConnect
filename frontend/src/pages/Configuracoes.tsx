import { useState, useRef } from "react";
import type { SyntheticEvent } from "react";

type Section = "perfil" | "seguranca" | "preferencias";

function Toggle({
  enabled,
  onChange,
}: {
  readonly enabled: boolean;
  readonly onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=47";
const inputClass =
  "shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white rounded-lg p-2.5 bg-white";

export default function Configuracoes() {
  const [activeSection, setActiveSection] = useState<Section>("perfil");
  const [savedMsg, setSavedMsg] = useState("");

  // Foto de perfil
  const [fotoPreview, setFotoPreview] = useState<string | null>(DEFAULT_AVATAR);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFotoPreview(URL.createObjectURL(file));
  }

  function handleConfirmarRemocao() {
    setFotoPreview(null);
    setShowRemoveConfirm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Perfil
  const [nome, setNome] = useState("Sarah");
  const [sobrenome, setSobrenome] = useState("Jenkins");
  const [email, setEmail] = useState("sarah.jenkins@example.com");
  const [telefone, setTelefone] = useState("(11) 98765-4321");
  const [endereco, setEndereco] = useState("Rua das Flores, 123, Apto 4B");
  const [cidade, setCidade] = useState("São Paulo");
  const [estado, setEstado] = useState("SP");
  const [cep, setCep] = useState("01310-100");

  // Segurança
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaError, setSenhaError] = useState("");

  // Preferências
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [marketingNotif, setMarketingNotif] = useState(true);

  // Excluir conta
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function showSaved(msg: string) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 3000);
  }

  function handleSavePerfil(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    showSaved("Dados pessoais salvos com sucesso!");
  }

  function handleSaveSenha(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setSenhaError("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 8) {
      setSenhaError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setSenhaError("");
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    showSaved("Senha atualizada com sucesso!");
  }

  function handleSavePreferencias(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    showSaved("Preferências salvas com sucesso!");
  }

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: "perfil", label: "Dados Pessoais", icon: "person" },
    { key: "seguranca", label: "Segurança", icon: "lock" },
    { key: "preferencias", label: "Preferências", icon: "tune" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Configurações da Conta
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gerencie suas informações pessoais, segurança e preferências.
        </p>
      </div>

      {/* Toast */}
      {savedMsg && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="material-icons text-sm">check_circle</span>
          {savedMsg}
        </div>
      )}

      {/* Modal confirmação remover foto */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-icons text-red-500">delete</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Remover foto de perfil
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Tem certeza que deseja remover sua foto de perfil? Ela será
              substituída pela imagem padrão.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarRemocao}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Sidebar — FORA de qualquer form */}
        <aside className="lg:col-span-3 mb-6 lg:mb-0">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all text-left ${
                  activeSection === item.key
                    ? "bg-primary/10 text-primary border-l-4 border-primary rounded-l-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-l-4 border-transparent"
                }`}
              >
                <span
                  className={`material-icons text-xl ${activeSection === item.key ? "text-primary" : "text-slate-400"}`}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Conteúdo */}
        <div className="lg:col-span-9 space-y-6">
          {/* PERFIL */}
          {activeSection === "perfil" && (
            <>
              <form onSubmit={handleSavePerfil}>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="px-6 py-5">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      Dados Pessoais
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                      Gerencie seu perfil público e informações de contato.
                    </p>

                    {/* Foto */}
                    <div className="mb-8 flex items-center gap-6">
                      <div className="relative">
                        {fotoPreview ? (
                          <img
                            src={fotoPreview}
                            alt="Foto de perfil"
                            className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-sm"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800 shadow-sm flex items-center justify-center">
                            <span className="material-icons text-5xl text-slate-400 dark:text-slate-500">
                              person
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-primary hover:bg-blue-600 text-white p-1.5 rounded-full shadow-lg transition-colors border-2 border-white dark:border-slate-900"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Foto de Perfil
                        </h3>
                        <p className="text-xs text-slate-500 mb-3">
                          Aceita JPG, GIF ou PNG. Tamanho máximo de 800KB.
                        </p>
                        <div className="flex gap-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFotoChange}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          >
                            Enviar nova foto
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRemoveConfirm(true)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors px-2 py-1.5"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Campos */}
                    <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="nome"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Nome
                        </label>
                        <input
                          id="nome"
                          type="text"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="sobrenome"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Sobrenome
                        </label>
                        <input
                          id="sobrenome"
                          type="text"
                          value={sobrenome}
                          onChange={(e) => setSobrenome(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-icons text-slate-400 text-lg">
                              mail
                            </span>
                          </div>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="telefone"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Telefone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-icons text-slate-400 text-lg">
                              phone
                            </span>
                          </div>
                          <input
                            id="telefone"
                            type="text"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-6 border-t border-slate-100 dark:border-slate-800 pt-1" />
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="endereco"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Endereço
                        </label>
                        <input
                          id="endereco"
                          type="text"
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="cidade"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Cidade
                        </label>
                        <input
                          id="cidade"
                          type="text"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="estado"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Estado
                        </label>
                        <input
                          id="estado"
                          type="text"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="cep"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          CEP
                        </label>
                        <input
                          id="cep"
                          type="text"
                          value={cep}
                          onChange={(e) => setCep(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button
                      type="button"
                      className="bg-white dark:bg-slate-800 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-blue-600 rounded-lg py-2 px-4 text-sm font-medium text-white transition-colors shadow-sm"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </form>

              {/* Zona de exclusão — fora do form */}
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-400">
                    Excluir Conta
                  </h3>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                    Ao excluir sua conta, você perderá todos os seus dados e
                    perfis de pets. Esta ação não pode ser desfeita.
                  </p>
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    {showDeleteConfirm ? (
                      <>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                          Tem certeza? Esta ação é irreversível.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Confirmar Exclusão
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 border border-transparent font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 text-sm transition-colors"
                      >
                        Excluir Conta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SEGURANÇA */}
          {activeSection === "seguranca" && (
            <form onSubmit={handleSaveSenha}>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                    Segurança e Senha
                  </h2>
                  <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="senha-atual"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Senha Atual
                      </label>
                      <input
                        id="senha-atual"
                        type="password"
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="nova-senha"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Nova Senha
                      </label>
                      <input
                        id="nova-senha"
                        type="password"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        className={inputClass}
                      />
                      <p className="mt-1.5 text-xs text-slate-500">
                        Mínimo 8 caracteres, pelo menos uma maiúscula e um
                        número.
                      </p>
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="confirmar-senha"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Confirmar Nova Senha
                      </label>
                      <input
                        id="confirmar-senha"
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    {senhaError && (
                      <div className="sm:col-span-6 flex items-center gap-2 text-red-500 text-sm">
                        <span className="material-icons text-base">
                          error_outline
                        </span>
                        {senhaError}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-blue-600 rounded-lg py-2 px-4 text-sm font-medium text-white transition-colors shadow-sm"
                  >
                    Atualizar Senha
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* PREFERÊNCIAS */}
          {activeSection === "preferencias" && (
            <form onSubmit={handleSavePreferencias}>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                    Preferências de Notificação
                  </h2>
                  <div className="space-y-6">
                    {[
                      {
                        label: "Notificações por Email",
                        desc: "Receba confirmações de agendamentos e atualizações de cuidadores por email.",
                        value: emailNotif,
                        toggle: () => setEmailNotif((v) => !v),
                      },
                      {
                        label: "Alertas por SMS",
                        desc: "Receba mensagens instantâneas para atualizações urgentes sobre seus pets.",
                        value: smsNotif,
                        toggle: () => setSmsNotif((v) => !v),
                      },
                      {
                        label: "Atualizações de Marketing",
                        desc: "Receba novidades sobre novos recursos e promoções do PetFriend.",
                        value: marketingNotif,
                        toggle: () => setMarketingNotif((v) => !v),
                      },
                    ].map((item, i, arr) => (
                      <div key={item.label}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {item.label}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                          <Toggle enabled={item.value} onChange={item.toggle} />
                        </div>
                        {i < arr.length - 1 && (
                          <div className="border-t border-slate-100 dark:border-slate-800 mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-blue-600 rounded-lg py-2 px-4 text-sm font-medium text-white transition-colors shadow-sm"
                  >
                    Salvar Preferências
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
