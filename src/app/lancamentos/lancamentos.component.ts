import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TransacoesService } from '../Services/TransacaoService/transacoes.service';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { NovaTransacaoDialogComponent } from '../Dialog/nova-transacao-dialog/nova-transacao-dialog.component';
import { SelecionarTipoTransacaoDialogComponent } from '../Dialog/selecionar-tipo-transacao-dialog/selecionar-tipo-transacao-dialog.component';

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

  constructor(
    private transacaoService: TransacoesService,
    private cdRef: ChangeDetectorRef,
    private toarstService: ToastrService,
    private dialog: MatDialog
  ) {}

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

  // Garanta que o método processarGrafico() está correto:
  processarGrafico(): void {
    // Garantir que temos um mês válido
    if (!this.selectedDate) {
      this.graficoDias = [];
      return;
    }

    // 1. Determinar quantos dias tem o mês
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 2. Inicializar array de dias
    this.graficoDias = Array.from({ length: daysInMonth }, (_, i) => ({
      dia: i + 1,
      saldo: 0,
      saldoPercentual: 0,
      positivo: true,
    }));

    // 3. Se não houver transações, manter tudo zerado
    if (!this.transacoes || this.transacoes.length === 0) {
      console.log('Nenhuma transação para exibir');
      return;
    }

    // 4. Processar transações e acumular por dia
    this.transacoes.forEach((transacao) => {
      try {
        const transDate = parseISO(transacao.data);
        // Verificar se a transação pertence a  o mês/ano selecionado
        if (
          transDate.getFullYear() === year &&
          transDate.getMonth() === month
        ) {
          const day = transDate.getDate() - 1; // índice do array
          const value =
            transacao.tipo === 'RECEITA' ? transacao.valor : -transacao.valor;
          this.graficoDias[day].saldo += value;
        }
      } catch (e) {
        console.error('Erro ao processar transação:', transacao, e);
      }
    });

    // 5. Calcular os percentuais para o gráfico
    this.calcularPercentuais();
    this.cdRef.detectChanges();
  }

  calcularPercentuais(): void {
    if (!this.graficoDias || this.graficoDias.length === 0) return;

    // Encontrar o maior valor absoluto para normalização
    const maxValue = Math.max(
      ...this.graficoDias.map((d) => Math.abs(d.saldo)),
      1 // Evitar divisão por zero
    );

    // Calcular percentuais e determinar se é positivo
    this.graficoDias.forEach((dia) => {
      dia.positivo = dia.saldo >= 0;
      dia.saldoPercentual = (Math.abs(dia.saldo) / maxValue) * 100;

      // Debug: Verifique os valores calculados
      console.log(`Dia ${dia.dia}:`, {
        saldo: dia.saldo,
        percentual: dia.saldoPercentual,
        positivo: dia.positivo,
      });
    });
  }

  // Método auxiliar para criar array de dias vazios
  criarArrayDiasVazios(): GraficoDiaDTO[] {
    const ultimoDiaMes = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() + 1,
      0
    ).getDate();

    return Array.from({ length: ultimoDiaMes }, (_, i) => ({
      dia: i + 1,
      saldo: 0,
      saldoPercentual: 0,
      positivo: true,
    }));
  }

  // Método auxiliar para obter o último dia do mês
  getLastDayOfMonth(): number {
    if (!this.selectedDate) return 31;
    return new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth() + 1,
      0
    ).getDate();
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
        this.toarstService.error('Erro ao gerar relatório');
      }
    );
  }
  showAllCategories = false;

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

  openNovaTransacaoDialog() {
    // Primeiro abre o dialog de seleção
    const dialogRef = this.dialog.open(SelecionarTipoTransacaoDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((tipo) => {
      if (tipo) {
        // Se um tipo foi selecionado, abre o dialog de transação
        const transacaoDialogRef = this.dialog.open(
          NovaTransacaoDialogComponent,
          {
            width: '500px',
            data: { tipo },
          }
        );

        transacaoDialogRef.afterClosed().subscribe((result) => {
          if (result) {
            // Atualizar a lista de transações
            this.carregarTransacoes();
          }
        });
      }
    });
  }
}
