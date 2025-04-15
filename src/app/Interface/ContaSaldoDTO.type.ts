import { BancoTipo } from './ContaCadastroDTO.type';

export type ContaSaldoDTO = {
  id: string; // UUID
  nome: string;
  saldo: number;
  bancoTipo: BancoTipo;
};
