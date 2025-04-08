// meta-financeira-request.dto.ts
export interface MetaFinanceiraRequestDTO {
  nome: string;
  valorMeta: number;
  valorAtual?: number;
}

// meta-financeira-response.dto.ts
export interface MetaFinanceiraResponseDTO {
  id: number;
  nome: string;
  valorMeta: number;
  dataCriacao: Date;
  valorAtual?: number;
  progresso?: number; // Adicionado no frontend
}

export interface MetaFinanceiraResponseDTOComId {
  id: number;
  nome: string;
  valorMeta: number;
  valorAtual?: number;
}
