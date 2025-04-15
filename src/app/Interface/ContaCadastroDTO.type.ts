export type ContaCadastroDTO = {
  banco: string;
  saldo: number;
  bancoTipo: string;
};

export enum BancoTipo {
  NUBANK = 'NUBANK',
  INTER = 'INTER',
  CAIXA = 'CAIXA',
  ITAU = 'ITAU',
  SANTANDER = 'SANTANDER',
  BRADESCO = 'BRADESCO',
  BB = 'BB',
  OUTROS = 'OUTROS',
}
