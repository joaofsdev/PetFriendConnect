import { apiRequest } from "./api";

interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
  statusCode: number;
}

// ===== TIPOS =====

export interface UsuarioAdmin {
  id: number;
  nome: string;
  email: string;
  tipo: "DONO" | "CUIDADOR" | "ADMIN";
  telefone: string | null;
  ativo: boolean;
  dataCriacao: string;
  _count: { pets: number; reservasFeitas: number; reservasRecebidas: number };
}

export interface UsuarioDetalhe extends UsuarioAdmin {
  endereco: string | null;
  descricao: string | null;
  dataAtualizacao: string;
}

export interface Denuncia {
  id: number;
  denuncianteId: number;
  denunciadoId: number;
  motivo: string;
  descricao: string | null;
  status: "PENDENTE" | "EM_ANALISE" | "RESOLVIDA" | "REJEITADA";
  resolucao: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  denunciante: { id: number; nome: string; email: string };
  denunciado: { id: number; nome: string; email: string };
}

export interface DashboardData {
  totalUsuarios: number;
  totalPets: number;
  totalReservas: number;
  totalCuidadores: number;
  totalDonos: number;
  reservasPorStatus: Record<string, number>;
  usuariosRecentes: { id: number; nome: string; email: string; tipo: string; dataCriacao: string }[];
}

export interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  descricao: string | null;
  dataAtualizacao: string;
}

export interface LogAdmin {
  id: number;
  usuarioId: number;
  acao: string;
  descricao: string | null;
  dataLog: string;
  usuario: { id: number; nome: string; email: string };
}

interface UsuariosPaginado { usuarios: UsuarioAdmin[]; total: number; page: number; totalPages: number }
interface DenunciasPaginado { denuncias: Denuncia[]; total: number; page: number; totalPages: number }
interface LogsPaginado { logs: LogAdmin[]; total: number; page: number; totalPages: number }

// ===== DASHBOARD =====

export function obterDashboard() {
  return apiRequest<ApiResponse<DashboardData>>("/admin/dashboard");
}

// ===== USUÁRIOS =====

export function listarUsuarios(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiRequest<ApiResponse<UsuariosPaginado>>(`/admin/usuarios${query}`);
}

export function obterUsuario(id: number) {
  return apiRequest<ApiResponse<UsuarioDetalhe>>(`/admin/usuarios/${id}`);
}

export function editarUsuario(id: number, dados: Partial<{ nome: string; email: string; tipo: string; telefone: string; endereco: string; ativo: boolean }>) {
  return apiRequest<ApiResponse<UsuarioAdmin>>(`/admin/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function desativarUsuario(id: number) {
  return apiRequest<ApiResponse<UsuarioAdmin>>(`/admin/usuarios/${id}`, { method: "DELETE" });
}

export function ativarUsuario(id: number) {
  return apiRequest<ApiResponse<UsuarioAdmin>>(`/admin/usuarios/${id}/ativar`, { method: "PATCH" });
}

// ===== DENÚNCIAS =====

export function listarDenuncias(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiRequest<ApiResponse<DenunciasPaginado>>(`/admin/denuncias${query}`);
}

export function obterDenuncia(id: number) {
  return apiRequest<ApiResponse<Denuncia>>(`/admin/denuncias/${id}`);
}

export function atualizarDenuncia(id: number, dados: { status: string; resolucao?: string }) {
  return apiRequest<ApiResponse<Denuncia>>(`/admin/denuncias/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

// ===== CONFIGURAÇÕES =====

export function listarConfiguracoes() {
  return apiRequest<ApiResponse<Configuracao[]>>("/admin/configuracoes");
}

export function atualizarConfiguracao(chave: string, valor: string) {
  return apiRequest<ApiResponse<Configuracao>>(`/admin/configuracoes/${chave}`, {
    method: "PUT",
    body: JSON.stringify({ valor }),
  });
}

// ===== LOGS =====

export function listarLogs(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiRequest<ApiResponse<LogsPaginado>>(`/admin/logs${query}`);
}
