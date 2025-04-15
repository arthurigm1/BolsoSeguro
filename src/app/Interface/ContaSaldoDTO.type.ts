export type ContaSaldoDTO = {
  id: string; // UUID
  nome: string;
  saldo: number; // BigDecimal no backend será representado como número no Angular
  banco: string;
};
