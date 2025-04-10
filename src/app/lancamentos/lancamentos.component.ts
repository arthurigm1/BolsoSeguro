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
  loading = false;
  error = '';

  constructor(private transacaoService: TransacoesService) {}

  ngOnInit(): void {
    this.carregarTransacoes();
  }

  carregarTransacoes(): void {
    this.loading = true;
    this.error = '';

    const mes = this.selectedDate.getMonth() + 1; // JavaScript months are 0-based
    const ano = this.selectedDate.getFullYear();

    this.transacaoService.obterTransacoesPorMes(mes, ano).subscribe({
      next: (data) => {
        this.transacoes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar transações';
        this.loading = false;
        console.error(err);
      },
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
  getRandomHeight(): number {
    return Math.random() * 80 + 10;
  }
  randomBoolean(): boolean {
    return Math.random() > 0.5;
  }
  downloadReport() {
    this.isExporting = true;
    const mes = this.selectedDate.getMonth() + 1; // JavaScript months are 0-based
    const ano = this.selectedDate.getFullYear();

    this.transacaoService.gerarRelatorio(mes, ano).subscribe(
      (response: Blob) => {
        // Criando um link para o arquivo Blob
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${mes}_${ano}.pdf`;
        a.click(); // Simula o clique para iniciar o download
        this.isExporting = false;
        // Liberar o objeto URL após o download
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        this.isExporting = false;
        console.error('Erro ao gerar o relatório:', error);
      }
    );
  }
}
