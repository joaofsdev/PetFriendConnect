import { createContext } from "react";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../services/auth";

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload & { rememberMe?: boolean }) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  completeSocialLogin: (data: {
    usuario: AuthUser;
    token: string;
  }) => AuthUser;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
