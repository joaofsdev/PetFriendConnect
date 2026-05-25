import { apiRequest } from "./api";

export interface AgendaSlot {
  id: number;
  cuidadorId: number;
  servicoId: number;
  data: string;
  disponivel: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  servico: { id: number; nome: string; preco: string | number; duracao: number };
}

interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface CriarSlotPayload {
  servicoId: number;
  data: string;
}

export function listarMinhaAgenda() {
  return apiRequest<ApiResponse<AgendaSlot[]>>("/agenda");
}

export function adicionarSlot(payload: CriarSlotPayload) {
  return apiRequest<ApiResponse<AgendaSlot>>("/agenda", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deletarSlot(id: number) {
  return apiRequest<void>(`/agenda/${id}`, { method: "DELETE" });
}
