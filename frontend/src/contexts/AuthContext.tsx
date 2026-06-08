import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  loginUsuario,
  registrarUsuario,
  obterUsuarioLogado,
  alterarSenha,
  atualizarPerfil,
  type AuthUser,
  type ChangePasswordPayload,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
} from "../services/auth";
import { AuthContext, type AuthContextType } from "./authContextValue";

const STORAGE_KEYS = {
  user: "petfriend:user",
  token: "petfriend:token",
} as const;

function getStorage(rememberMe = true): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

function loadFromStorage(): { user: AuthUser | null; token: string | null } {
  try {
    for (const storage of [localStorage, sessionStorage]) {
      const token = storage.getItem(STORAGE_KEYS.token);
      const userRaw = storage.getItem(STORAGE_KEYS.user);
      if (token && userRaw) {
        return { user: JSON.parse(userRaw) as AuthUser, token };
      }
    }
  } catch { /* ignore */ }
  return { user: null, token: null };
}

function saveToStorage(user: AuthUser, token: string, rememberMe = true) {
  const storage = getStorage(rememberMe);
  const other = rememberMe ? sessionStorage : localStorage;
  storage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  storage.setItem(STORAGE_KEYS.token, token);
  other.removeItem(STORAGE_KEYS.user);
  other.removeItem(STORAGE_KEYS.token);
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.token);
  sessionStorage.removeItem(STORAGE_KEYS.user);
  sessionStorage.removeItem(STORAGE_KEYS.token);
}

function updateStoredUser(user: AuthUser) {
  const storage = localStorage.getItem(STORAGE_KEYS.token)
    ? localStorage
    : sessionStorage;

  if (storage.getItem(STORAGE_KEYS.token)) {
    storage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialAuth] = useState(loadFromStorage);
  const [user, setUser] = useState<AuthUser | null>(initialAuth.user);
  const [accessToken, setAccessToken] = useState<string | null>(
    initialAuth.token,
  );
  const [isLoading, setIsLoading] = useState(
    Boolean(initialAuth.user && initialAuth.token),
  );

  useEffect(() => {
    if (!initialAuth.user || !initialAuth.token) {
      return;
    }

    let isMounted = true;

    obterUsuarioLogado()
      .then((res) => {
        if (isMounted) {
          setUser(res.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          clearStorage();
          setUser(null);
          setAccessToken(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialAuth]);

  async function login(payload: LoginPayload & { rememberMe?: boolean }) {
    const response = await loginUsuario(payload);
    const { usuario, token } = response.data;
    saveToStorage(usuario, token, payload.rememberMe ?? true);
    setUser(usuario);
    setAccessToken(token);
    return usuario;
  }

  async function register(payload: RegisterPayload) {
    const response = await registrarUsuario(payload);
    const { usuario, token } = response.data;
    saveToStorage(usuario, token);
    setUser(usuario);
    setAccessToken(token);
    return usuario;
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    const response = await atualizarPerfil(payload);
    const usuario = response.data;
    updateStoredUser(usuario);
    setUser(usuario);
    return usuario;
  }

  async function changePassword(payload: ChangePasswordPayload) {
    await alterarSenha(payload);
  }

  function completeSocialLogin(data: { usuario: AuthUser; token: string }) {
    saveToStorage(data.usuario, data.token);
    setUser(data.usuario);
    setAccessToken(data.token);
    return data.usuario;
  }

  function logout() {
    clearStorage();
    setUser(null);
    setAccessToken(null);
  }

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    isLoading,
    login,
    register,
    updateProfile,
    changePassword,
    completeSocialLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
