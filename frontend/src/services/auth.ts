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
  notificacoesEmail?: boolean;
  notificacoesSms?: boolean;
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
  notificacoesEmail?: boolean;
  notificacoesSms?: boolean;
}

export interface ChangePasswordPayload {
  senhaAtual: string;
  novaSenha: string;
}

export interface ForgotPasswordData {
  resetUrl: string | null;
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

export function solicitarResetSenha(email: string) {
  return apiRequest<ApiResponse<ForgotPasswordData>>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetarSenha(token: string, novaSenha: string) {
  return apiRequest<ApiResponse<null>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, novaSenha }),
  });
}
