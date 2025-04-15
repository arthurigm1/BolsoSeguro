export type ContaCadastroDTO = {
  banco: string;
  saldo: number;
  bancoTipo: BancoTipo;
};

export enum BancoTipo {
  NUBANK = 'NUBANK',
  INTER = 'INTER',
  CAIXA = 'CAIXA',
  ITAU = 'ITAU',
  SANTANDER = 'SANTANDER',
  BRADESCO = 'BRADESCO',
  BANCO_DO_BRASIL = 'BANCO_DO_BRASIL',
  OUTROS = 'OUTROS',
}
