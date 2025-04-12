export interface Categoria {
  id: number;
  nome: string;
  tipo: 'despesa' | 'receita';
  cor: string;
  icone: string;
}
