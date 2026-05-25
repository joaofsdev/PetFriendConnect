import { apiRequest } from "./api";

export type StatusReserva = "PENDENTE" | "CONFIRMADA" | "CANCELADA" | "CONCLUIDA";

export interface Reserva {
  id: number;
  agendaId: number;
  donoId: number;
  cuidadorId: number;
  petId: number;
  servicoId: number;
  status: StatusReserva;
  dataInicio: string | null;
  dataFim: string | null;
  dataReserva: string;
  dataAtualizacao: string;
  agenda: { id: number; data: string; disponivel: boolean } | null;
  pet: { id: number; nome: string; raca: string; idade: number; fotoPet?: string | null } | null;
  servico: { id: number; nome: string; preco: string | number; duracao: number } | null;
  dono: { id: number; nome: string; email: string; telefone?: string | null } | null;
  cuidador: { id: number; nome: string; email: string; telefone?: string | null; fotoPerfil?: string | null } | null;
}

interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface CriarReservaPayload {
  cuidadorId: number;
  petId: number;
  servicoId: number;
  agendaId: number;
}

export function listarReservas() {
  return apiRequest<ApiResponse<Reserva[]>>("/reservas");
}

export function obterReserva(id: number) {
  return apiRequest<ApiResponse<Reserva>>(`/reservas/${id}`);
}

export function criarReserva(payload: CriarReservaPayload) {
  return apiRequest<ApiResponse<Reserva>>("/reservas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelarReserva(id: number) {
  return apiRequest<ApiResponse<Reserva>>(`/reservas/${id}/cancelar`, {
    method: "PATCH",
  });
}
