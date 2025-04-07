export interface CartaoDTO {
  nome: string;
  limiteTotal: number;
  bandeira: string;
  vencimentoFatura: number;
  diaFechamentoFatura: number;
}

export interface CartaoResponseDTO {
  id: string;
  nome: string;
  limiteDisponivel: number;
  bandeira: string;
}

export interface CartaoUpdateDTO {
  nomeCartao?: string;
  limiteTotal?: number;
  limiteDisponivel?: number;
}
