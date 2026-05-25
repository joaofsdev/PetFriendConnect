import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  loginUsuario,
  registrarUsuario,
  obterUsuarioLogado,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "../services/auth";

const STORAGE_KEYS = {
  user: "petfriend:user",
  token: "petfriend:token",
} as const;

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload & { rememberMe?: boolean }) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { user: storedUser, token } = loadFromStorage();
    if (storedUser && token) {
      setUser(storedUser);
      setAccessToken(token);
      // Validate token by fetching current user
      obterUsuarioLogado()
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          clearStorage();
          setUser(null);
          setAccessToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

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
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
