// models/fatura-cartao.dto.ts
export interface FaturaCartaoDTO {
  id: string;
  cartaoId: string;
  mes: number;
  ano: number;
  valorTotal: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'PAGA' | 'ATRASADA';
  transacoes: TransacaoFaturaDTO[];
}

export interface TransacaoFaturaDTO {
  id: string;
  descricao: string;
  data: string;
  valor: number;
  categoria: string;
}

export interface CartaoDetalhesDTO {
  id: string;
  cartaoId: string;
  nomeCartao: string;
  bandeira: string;
  limiteTotal: number;
  limiteDisponivel: number;
  dataVencimento: string;
  valor: number;
  paga: boolean;
  dataReabertura: string;
  reaberta: boolean;
}

export interface PagamentoFaturaRequest {
  cartaoId: string;
  mes: number;
  ano: number;
  contaId: string;
}
