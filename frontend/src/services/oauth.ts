import { API_BASE_URL } from "./api";
import type { AuthData, UserType } from "./auth";

export type SocialProvider = "google" | "facebook";

export function getSocialLoginUrl(
  provider: SocialProvider,
  tipo: Exclude<UserType, "ADMIN"> = "DONO",
) {
  const params = new URLSearchParams({ tipo });
  return `${API_BASE_URL}/auth/${provider}?${params.toString()}`;
}

export function parseOAuthCallback(hash: string): AuthData {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const rawData = params.get("data");

  if (!rawData) {
    throw new Error("Resposta OAuth inválida");
  }

  return JSON.parse(decodeURIComponent(rawData)) as AuthData;
}
