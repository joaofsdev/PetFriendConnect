import { apiRequest } from "./api";

export interface Pet {
  id: number;
  nome: string;
  raca: string;
  idade: number;
  descricao?: string | null;
  fotoPet?: string | null;
  donoId: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface CriarPetPayload {
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  observacoes?: string;
}

export interface AtualizarPetPayload {
  nome?: string;
  especie?: string;
  raca?: string;
  idade?: number;
  observacoes?: string;
}

export function listarPets() {
  return apiRequest<ApiResponse<Pet[]>>("/pets");
}

export function obterPet(id: number) {
  return apiRequest<ApiResponse<Pet>>(`/pets/${id}`);
}

export function criarPet(payload: CriarPetPayload) {
  return apiRequest<ApiResponse<Pet>>("/pets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function atualizarPet(id: number, payload: AtualizarPetPayload) {
  return apiRequest<ApiResponse<Pet>>(`/pets/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function removerPet(id: number) {
  return apiRequest<void>(`/pets/${id}`, { method: "DELETE" });
}
