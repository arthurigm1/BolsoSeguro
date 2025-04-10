import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TransacoesService } from '../Services/TransacaoService/transacoes.service';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransacaoDetalhadaDTO {
  banco: string;
  valor: number;
  tipo: string;
  categoria: string;
  data: string;
  descricao: string;
}

interface GraficoDiaDTO {
  dia: number;
  saldo: number;
  saldoPercentual: number;
  positivo: boolean;
}

@Component({
  selector: 'app-lancamentos',
  imports: [CommonModule],
  templateUrl: './lancamentos.component.html',
  styleUrl: './lancamentos.component.scss',
})
export class LancamentosComponent implements OnInit {
  isExporting = false;
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  transacoes: TransacaoDetalhadaDTO[] = [];
  graficoDias: GraficoDiaDTO[] = [];
  loading = false;
  error = '';

  constructor(private transacaoService: TransacoesService) {}

  ngOnInit(): void {
    this.carregarTransacoes();
  }

  carregarTransacoes(): void {
    this.loading = true;
    this.error = '';

    const mes = this.selectedDate.getMonth() + 1;
    const ano = this.selectedDate.getFullYear();

    this.transacaoService.obterTransacoesPorMes(mes, ano).subscribe({
      next: (data) => {
        this.transacoes = data;
        this.processarGrafico();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar transações';
        this.loading = false;
        console.error(err);
      },
    });
  }

  processarGrafico(): void {
    const diasNoMes = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() + 1,
      0
    ).getDate();
    const agrupado: { [dia: number]: number } = {};

    for (const t of this.transacoes) {
      const dataTransacao = new Date(t.data);
      const dia = dataTransacao.getDate();
      const valor = t.tipo === 'DESPESA' ? -t.valor : t.valor;
      agrupado[dia] = (agrupado[dia] || 0) + valor;
    }

    const maxAbsoluto =
      Math.max(...Object.values(agrupado).map((v) => Math.abs(v))) || 1;

    this.graficoDias = Array.from({ length: diasNoMes }, (_, i) => {
      const dia = i + 1;
      const saldo = agrupado[dia] || 0;
      return {
        dia,
        saldo,
        saldoPercentual: Math.min(
          100,
          Math.round((Math.abs(saldo) / maxAbsoluto) * 100)
        ),
        positivo: saldo >= 0,
      };
    });
  }

  nextMonth(): void {
    this.selectedDate = addMonths(this.selectedDate, 1);
    this.carregarTransacoes();
  }

  prevMonth(): void {
    this.selectedDate = subMonths(this.selectedDate, 1);
    this.carregarTransacoes();
  }

  goToCurrentMonth(): void {
    this.selectedDate = new Date();
    this.carregarTransacoes();
  }

  getMonthYear(): string {
    return format(this.selectedDate, 'MMMM yyyy', { locale: ptBR });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  }

  getTotalReceitas(): number {
    return this.transacoes
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((sum, t) => sum + t.valor, 0);
  }

  getTotalDespesas(): number {
    return this.transacoes
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((sum, t) => sum + t.valor, 0);
  }

  getSaldo(): number {
    return this.getTotalReceitas() - this.getTotalDespesas();
  }

  downloadReport() {
    this.isExporting = true;
    const mes = this.selectedDate.getMonth() + 1;
    const ano = this.selectedDate.getFullYear();

    this.transacaoService.gerarRelatorio(mes, ano).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${mes}_${ano}.pdf`;
        a.click();
        this.isExporting = false;
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        this.isExporting = false;
        console.error('Erro ao gerar o relatório:', error);
      }
    );
  }
  showAllCategories = false;

  // Métodos auxiliares para o template
  getLastDayOfMonth(): number {
    return new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() + 1,
      0
    ).getDate();
  }

  toggleShowAllCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }

  getCategorias(): string[] {
    return [...new Set(this.transacoes.map((t) => t.categoria))].sort();
  }

  getTotalPorCategoria(categoria: string): number {
    return this.transacoes
      .filter((t) => t.categoria === categoria)
      .reduce((sum, t) => sum + t.valor, 0);
  }

  getMaxCategoria(): number {
    const valores = this.getCategorias().map((c) =>
      this.getTotalPorCategoria(c)
    );
    return Math.max(...valores, 1); // Evita divisão por zero
  }
}
