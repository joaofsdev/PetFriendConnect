import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/api";

type Section = "perfil" | "seguranca" | "preferencias";

const ACCEPTED_PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PROFILE_PHOTO_UPLOAD_BYTES = 2 * 1024 * 1024;
const PROFILE_PHOTO_SIZE = 512;

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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

const inputClass =
  "shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white rounded-lg p-2.5 bg-white";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function fileToProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_PROFILE_PHOTO_TYPES.includes(file.type)) {
      reject(new Error("Use uma imagem PNG, JPG ou WEBP."));
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_UPLOAD_BYTES) {
      reject(new Error("A imagem deve ter no maximo 2MB."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PROFILE_PHOTO_SIZE;
      canvas.height = PROFILE_PHOTO_SIZE;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Nao foi possivel processar a imagem."));
        return;
      }

      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = Math.max((image.naturalWidth - sourceSize) / 2, 0);
      const sourceY = Math.max((image.naturalHeight - sourceSize) / 2, 0);

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        PROFILE_PHOTO_SIZE,
        PROFILE_PHOTO_SIZE,
      );

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Nao foi possivel carregar a imagem."));
    };

    image.src = objectUrl;
  });
}

export default function Configuracoes() {
  const { user, updateProfile, changePassword } = useAuth();
  const canEditDescription = user?.tipo === "CUIDADOR";
  const hasSavedPhone = Boolean(user?.telefone?.trim());
  const [activeSection, setActiveSection] = useState<Section>("perfil");
  const [savedMsg, setSavedMsg] = useState("");
  const [perfilError, setPerfilError] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const [preferenciasError, setPreferenciasError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const [nome, setNome] = useState(user?.nome ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [telefone, setTelefone] = useState(user?.telefone ?? "");
  const [endereco, setEndereco] = useState(user?.endereco ?? "");
  const [descricao, setDescricao] = useState(user?.descricao ?? "");
  const [fotoPerfil, setFotoPerfil] = useState(user?.fotoPerfil ?? "");
  const [fotoError, setFotoError] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  useEffect(() => {
    if (!user) return;

    const timer = window.setTimeout(() => {
      setNome(user.nome ?? "");
      setEmail(user.email ?? "");
      setTelefone(user.telefone ?? "");
      setEndereco(user.endereco ?? "");
      setDescricao(user.descricao ?? "");
      setFotoPerfil(user.fotoPerfil ?? "");
      setEmailNotif(user.notificacoesEmail ?? true);
      setSmsNotif(user.notificacoesSms ?? false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [user]);

  function showSaved(msg: string) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 3000);
  }

  async function handleSavePerfil(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPerfilError("");
    setIsSavingProfile(true);

    try {
      const profilePayload = {
        nome,
        telefone: telefone || null,
        endereco: endereco || null,
        fotoPerfil: fotoPerfil || null,
        ...(canEditDescription ? { descricao: descricao || null } : {}),
      };

      await updateProfile(profilePayload);
      showSaved("Dados pessoais salvos com sucesso!");
    } catch (error) {
      setPerfilError(
        getErrorMessage(error, "Nao foi possivel salvar seu perfil."),
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleProfilePhotoChange(file: File | undefined) {
    setFotoError("");
    if (!file) return;

    try {
      setFotoPerfil(await fileToProfilePhoto(file));
    } catch (error) {
      setFotoError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel processar a imagem.",
      );
    }
  }

  async function handleSaveSenha(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSenhaError("");

    if (novaSenha !== confirmarSenha) {
      setSenhaError("As senhas nao coincidem.");
      return;
    }

    if (novaSenha.length < 8) {
      setSenhaError("A senha deve ter no minimo 8 caracteres.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword({ senhaAtual, novaSenha });
      showSaved("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      setSenhaError(
        getErrorMessage(error, "Nao foi possivel alterar sua senha."),
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleSavePreferencias() {
    setPreferenciasError("");

    if (smsNotif && !hasSavedPhone) {
      setPreferenciasError(
        "Cadastre um telefone antes de ativar notificacoes por SMS.",
      );
      return;
    }

    setIsSavingPreferences(true);

    try {
      await updateProfile({
        notificacoesEmail: emailNotif,
        notificacoesSms: smsNotif,
      });
      showSaved("Preferencias salvas com sucesso!");
    } catch (error) {
      setPreferenciasError(
        getErrorMessage(error, "Nao foi possivel salvar suas preferencias."),
      );
    } finally {
      setIsSavingPreferences(false);
    }
  }

  function handleToggleSms() {
    setPreferenciasError("");

    if (!smsNotif && !hasSavedPhone) {
      setPreferenciasError(
        "Cadastre um telefone antes de ativar notificacoes por SMS.",
      );
      return;
    }

    setSmsNotif(!smsNotif);
  }

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: "perfil", label: "Dados Pessoais", icon: "person" },
    { key: "seguranca", label: "Seguranca", icon: "lock" },
    { key: "preferencias", label: "Preferencias", icon: "tune" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Configuracoes
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gerencie suas informacoes pessoais e preferencias.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="w-full shrink-0 lg:w-56">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeSection === item.key ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
                >
                  <span className="material-icons text-lg">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          {activeSection === "perfil" && (
            <form onSubmit={handleSavePerfil} className="space-y-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Dados Pessoais
              </h3>

              {perfilError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {perfilError}
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {fotoPerfil ? (
                  <img
                    src={fotoPerfil}
                    alt="Foto de perfil"
                    className="h-20 w-20 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                  />
                ) : (
                  <span
                    aria-label="Perfil sem foto"
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-200 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  >
                    <span className="material-icons text-4xl">person</span>
                  </span>
                )}

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <label
                      htmlFor="cfg-foto"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <span className="material-icons text-base">
                        photo_camera
                      </span>
                      Escolher foto
                    </label>
                    <input
                      id="cfg-foto"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        void handleProfilePhotoChange(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                    {fotoPerfil && (
                      <button
                        type="button"
                        onClick={() => {
                          setFotoError("");
                          setFotoPerfil("");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
                      >
                        <span className="material-icons text-base">
                          delete
                        </span>
                        Remover
                      </button>
                    )}
                  </div>
                  {fotoError && (
                    <p className="text-sm text-red-500">{fotoError}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="cfg-nome"
                >
                  Nome
                </label>
                <input
                  id="cfg-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="cfg-email"
                >
                  Email
                </label>
                <input
                  id="cfg-email"
                  type="email"
                  value={email}
                  disabled
                  className={`${inputClass} cursor-not-allowed opacity-60`}
                />
                <p className="mt-1 text-xs text-slate-400">
                  O email nao pode ser alterado por esta tela.
                </p>
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="cfg-telefone"
                >
                  Telefone
                </label>
                <input
                  id="cfg-telefone"
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="cfg-endereco"
                >
                  Endereco
                </label>
                <input
                  id="cfg-endereco"
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className={inputClass}
                />
              </div>

              {canEditDescription && (
                <div>
                  <label
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    htmlFor="cfg-descricao"
                  >
                    Sobre voce
                  </label>
                  <textarea
                    id="cfg-descricao"
                    rows={4}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingProfile ? "Salvando..." : "Salvar"}
              </button>
            </form>
          )}

          {activeSection === "seguranca" && (
            <form onSubmit={handleSaveSenha} className="space-y-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Alterar Senha
              </h3>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="cfg-senha-atual"
                >
                  Senha Atual
                </label>
                <input
                  id="cfg-senha-atual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="cfg-nova-senha"
                >
                  Nova Senha
                </label>
                <input
                  id="cfg-nova-senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className={inputClass}
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="cfg-confirmar-senha"
                >
                  Confirmar Nova Senha
                </label>
                <input
                  id="cfg-confirmar-senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className={inputClass}
                  required
                  minLength={8}
                />
              </div>

              {senhaError && <p className="text-sm text-red-500">{senhaError}</p>}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isChangingPassword ? "Alterando..." : "Alterar Senha"}
              </button>
            </form>
          )}

          {activeSection === "preferencias" && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Preferencias de Notificacao
              </h3>

              {preferenciasError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {preferenciasError}
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Notificacoes por email
                  </p>
                  <p className="text-xs text-slate-500">
                    Receba atualizacoes sobre reservas e mensagens.
                  </p>
                </div>
                <Toggle
                  enabled={emailNotif}
                  onChange={() => setEmailNotif(!emailNotif)}
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Notificacoes por SMS
                  </p>
                  <p className="text-xs text-slate-500">
                    Receba lembretes de agendamentos por SMS.
                  </p>
                </div>
                <Toggle
                  enabled={smsNotif}
                  onChange={handleToggleSms}
                />
              </div>

              {!hasSavedPhone && (
                <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm dark:bg-slate-900 dark:text-amber-300">
                    <span className="material-icons text-3xl">
                      phone_iphone
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Cadastre seu telefone
                    </p>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                      Notificacoes por SMS so podem ser ativadas quando existe
                      um telefone salvo no perfil.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSection("perfil")}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
                    >
                      <span className="material-icons text-base">edit</span>
                      Ir para dados pessoais
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isSavingPreferences}
                onClick={handleSavePreferencias}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingPreferences ? "Salvando..." : "Salvar preferencias"}
              </button>
            </div>
          )}
        </div>
      </div>

      {savedMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border-l-4 border-green-500 bg-white p-4 shadow-xl dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <span className="material-icons text-green-500">check_circle</span>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {savedMsg}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
