import { apiRequest } from "./api";

export interface Servico {
  id: number;
  nome: string;
  descricao?: string | null;
  preco: string | number;
  duracao: number;
  dataCriacao?: string;
}

export interface Cuidador {
  id: number;
  nome: string;
  telefone?: string | null;
  endereco?: string | null;
  descricao?: string | null;
  fotoPerfil?: string | null;
  dataCriacao: string;
  servicosCriados: Servico[];
}

export interface CuidadorPerfil extends Cuidador {
  email: string;
  dataAtualizacao: string;
}

export interface AgendaSlot {
  id: number;
  cuidadorId: number;
  servicoId: number;
  data: string;
  disponivel: boolean;
  servico: {
    id: number;
    nome: string;
    preco: string | number;
    duracao: number;
  };
}

interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export function listarCuidadores() {
  return apiRequest<ApiResponse<Cuidador[]>>("/cuidadores");
}

export function obterPerfilCuidador(id: number) {
  return apiRequest<ApiResponse<CuidadorPerfil>>(`/cuidadores/${id}`);
}

export function obterAgendaCuidador(id: number, dias = 30) {
  return apiRequest<ApiResponse<AgendaSlot[]>>(`/cuidadores/${id}/agenda?dias=${dias}`);
}
