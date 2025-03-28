export interface Despesa {
  contaId?: string | null;
  cartaoId?: string | null;
  categoria: string;
  valor: number;
  data: Date;
  descricao: string;
}
