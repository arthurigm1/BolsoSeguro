import { Injectable } from '@angular/core';

export interface Lancamento {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data: string;
  status: 'pendente' | 'concluido' | 'cancelado';
}

export interface LancamentosResponse {
  lancamentos: Lancamento[];
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

@Injectable({
  providedIn: 'root',
})
export class LancamentosService {
  constructor() {}

  async getLancamentos(): Promise<LancamentosResponse> {
    // Simulação de dados
    const lancamentos: Lancamento[] = [
      {
        id: 1,
        descricao: 'Salário',
        valor: 5000,
        tipo: 'receita',
        categoria: 'Trabalho',
        data: '2024-03-01',
        status: 'concluido',
      },
      {
        id: 2,
        descricao: 'Aluguel',
        valor: 1500,
        tipo: 'despesa',
        categoria: 'Moradia',
        data: '2024-03-05',
        status: 'concluido',
      },
    ];

    const totalReceitas = lancamentos
      .filter((l) => l.tipo === 'receita')
      .reduce((sum, l) => sum + l.valor, 0);

    const totalDespesas = lancamentos
      .filter((l) => l.tipo === 'despesa')
      .reduce((sum, l) => sum + l.valor, 0);

    return {
      lancamentos,
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
    };
  }

  async getLancamento(id: number): Promise<Lancamento> {
    const response = await this.getLancamentos();
    const lancamento = response.lancamentos.find((l) => l.id === id);
    if (!lancamento) throw new Error('Lançamento não encontrado');
    return lancamento;
  }

  async createLancamento(
    lancamento: Omit<Lancamento, 'id'>
  ): Promise<Lancamento> {
    const response = await this.getLancamentos();
    const newId = Math.max(...response.lancamentos.map((l) => l.id)) + 1;
    const newLancamento: Lancamento = { ...lancamento, id: newId };
    return newLancamento;
  }

  async updateLancamento(
    id: number,
    lancamento: Partial<Lancamento>
  ): Promise<Lancamento> {
    const response = await this.getLancamentos();
    const index = response.lancamentos.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lançamento não encontrado');
    const updatedLancamento = { ...response.lancamentos[index], ...lancamento };
    return updatedLancamento;
  }

  async deleteLancamento(id: number): Promise<void> {
    const response = await this.getLancamentos();
    const index = response.lancamentos.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lançamento não encontrado');
  }
}
