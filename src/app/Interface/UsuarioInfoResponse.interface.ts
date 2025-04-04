export interface UsuarioInfoResponse {
  nome: string;
  email: string;
  enabled: boolean;
  saldoGeral: number;
}
export interface UsuarioInfoResponseDTO {
  nome: string;
  email: string;
  enabled: boolean;
  saldoGeral: number;
  id: string;
}
