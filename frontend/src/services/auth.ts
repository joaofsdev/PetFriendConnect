import { apiRequest } from "./api";

export type UserType = "DONO" | "CUIDADOR" | "ADMIN";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  tipo: UserType;
  telefone?: string | null;
  endereco?: string | null;
  descricao?: string | null;
  fotoPerfil?: string | null;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface AuthData {
  usuario: AuthUser;
  token: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  tipo: Exclude<UserType, "ADMIN">;
  telefone?: string;
  endereco?: string;
  descricao?: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface UpdateProfilePayload {
  nome?: string;
  telefone?: string | null;
  endereco?: string | null;
  descricao?: string | null;
  fotoPerfil?: string | null;
}

export interface ChangePasswordPayload {
  senhaAtual: string;
  novaSenha: string;
}

export function registrarUsuario(payload: RegisterPayload) {
  return apiRequest<ApiResponse<AuthData>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUsuario(payload: LoginPayload) {
  return apiRequest<ApiResponse<AuthData>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function obterUsuarioLogado() {
  return apiRequest<ApiResponse<AuthUser>>("/auth/me");
}

export function atualizarPerfil(payload: UpdateProfilePayload) {
  return apiRequest<ApiResponse<AuthUser>>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function alterarSenha(payload: ChangePasswordPayload) {
  return apiRequest<ApiResponse<null>>("/auth/me/senha", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
