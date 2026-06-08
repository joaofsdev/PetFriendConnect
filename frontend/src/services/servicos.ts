import { apiRequest } from "./api";

export interface Servico {
  id: number;
  nome: string;
  descricao?: string | null;
  preco: string | number;
  duracao: number;
  cuidadorId: number;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface CriarServicoPayload {
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
}

export function listarMeusServicos() {
  return apiRequest<ApiResponse<Servico[]>>("/servicos/me");
}

export function criarServico(payload: CriarServicoPayload) {
  return apiRequest<ApiResponse<Servico>>("/servicos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function editarServico(id: number, payload: Partial<CriarServicoPayload>) {
  return apiRequest<ApiResponse<Servico>>(`/servicos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
