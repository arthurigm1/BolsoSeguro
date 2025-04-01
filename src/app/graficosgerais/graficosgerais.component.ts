import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { TransacoesService } from '../Services/TransacaoService/transacoes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

interface Transacao {
  banco: string;
  valor: number;
  tipo: string;
  categoria: string;
  data: string;
  descricao: string;
}

interface ViewOption {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-graficosgerais',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './graficosgerais.component.html',
  styleUrls: ['./graficosgerais.component.scss'],
})
export class GraficosgeraisComponent implements OnInit, OnDestroy {
  // Data properties
  transacoes: Transacao[] = [];
  transacoesFiltradas: Transacao[] = [];
  transacoesMesAnterior: Transacao[] = [];
  categorias: string[] = [];
  bancos: string[] = [];
  tipos = ['RECEITA', 'DESPESA'];

  // Filter properties
  filtro = {
    dataInicio: '',
    dataFim: '',
    categoria: '',
    banco: '',
    tipo: '',
    descricao: '',
  };

  // Summary properties
  totalReceitas = 0;
  totalDespesas = 0;
  saldo = 0;
  variacaoReceitas = 0;
  variacaoDespesas = 0;
  variacaoSaldo = 0;
  categoriasPrincipais: string[] = [];
  progresso = 0;
  dataAtual: Date = new Date();

  // UI properties
  selectedDate: string = new Date().toISOString().slice(0, 7);
  loading = false;
  error = '';

  // View options
  views: ViewOption[] = [
    { id: 'overview', label: 'Visão Geral', icon: 'fas fa-chart-pie' },
    { id: 'timeline', label: 'Linha do Tempo', icon: 'fas fa-chart-line' },
    { id: 'banks', label: 'Por Banco', icon: 'fas fa-university' },
    { id: 'categories', label: 'Por Categoria', icon: 'fas fa-tags' },
  ];
  activeView = 'overview';

  // Chart references
  private charts: { [key: string]: Chart | undefined } = {
    pieChart: undefined,
    barChart: undefined,
    lineChart: undefined,
    bankChart: undefined,
    categoryChart: undefined,
  };

  private subscription?: Subscription;

  constructor(private transacaoService: TransacoesService) {}

  ngOnInit(): void {
    this.carregarTransacoes();
  }

  ngOnDestroy(): void {
    this.destruirGraficos();
    this.subscription?.unsubscribe();
  }

  carregarTransacoes(): void {
    this.loading = true;
    this.error = '';
    this.progresso = 0;

    const [ano, mes] = this.selectedDate.split('-');
    const mesAtual = parseInt(mes);
    const anoAtual = parseInt(ano);

    // Calcula o mês anterior
    let mesAnterior = mesAtual - 1;
    let anoAnterior = anoAtual;
    if (mesAnterior < 1) {
      mesAnterior = 12;
      anoAnterior--;
    }

    // Simula progresso de carregamento
    const progressInterval = setInterval(() => {
      this.progresso += 10;
      if (this.progresso >= 90) clearInterval(progressInterval);
    }, 100);

    // Carrega transações do mês atual
    this.subscription = this.transacaoService
      .obterTransacoesPorMes(mesAtual, anoAtual)
      .subscribe({
        next: (data) => {
          this.transacoes = data;
          this.transacoesFiltradas = [...data];
          this.carregarFiltros();
          this.calcularTotais();

          // Carrega transações do mês anterior para cálculo de variação
          this.transacaoService
            .obterTransacoesPorMes(mesAnterior, anoAnterior)
            .subscribe({
              next: (dataAnterior) => {
                this.transacoesMesAnterior = dataAnterior;
                this.calcularVariacoes();
                this.identificarCategoriasPrincipais();
                this.progresso = 100;
                setTimeout(() => {
                  this.criarGraficos();
                  this.loading = false;
                  clearInterval(progressInterval);
                }, 300);
              },
              error: (err) => {
                console.error(
                  'Erro ao carregar transações do mês anterior:',
                  err
                );
                this.progresso = 100;
                setTimeout(() => {
                  this.criarGraficos();
                  this.loading = false;
                  clearInterval(progressInterval);
                }, 300);
              },
            });
        },
        error: (err) => {
          this.error =
            'Erro ao carregar transações. Por favor, tente novamente.';
          this.loading = false;
          console.error('Erro ao carregar transações:', err);
          clearInterval(progressInterval);
        },
      });
  }

  calcularTotais(): void {
    this.totalReceitas = this.transacoesFiltradas
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((sum, t) => sum + t.valor, 0);

    this.totalDespesas = this.transacoesFiltradas
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((sum, t) => sum + t.valor, 0);

    this.saldo = this.totalReceitas - this.totalDespesas;
  }

  calcularVariacoes(): void {
    const receitasAnterior = this.transacoesMesAnterior
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((sum, t) => sum + t.valor, 0);

    const despesasAnterior = this.transacoesMesAnterior
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((sum, t) => sum + t.valor, 0);

    const saldoAnterior = receitasAnterior - despesasAnterior;

    // Evita divisão por zero
    this.variacaoReceitas =
      receitasAnterior !== 0
        ? (this.totalReceitas - receitasAnterior) / receitasAnterior
        : this.totalReceitas > 0
        ? 1
        : 0;

    this.variacaoDespesas =
      despesasAnterior !== 0
        ? (this.totalDespesas - despesasAnterior) / despesasAnterior
        : this.totalDespesas > 0
        ? 1
        : 0;

    this.variacaoSaldo =
      saldoAnterior !== 0
        ? (this.saldo - saldoAnterior) / Math.abs(saldoAnterior)
        : this.saldo !== 0
        ? this.saldo > 0
          ? 1
          : -1
        : 0;
  }

  identificarCategoriasPrincipais(): void {
    // Agrupa despesas por categoria
    const despesasPorCategoria = this.transacoesFiltradas
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
        return acc;
      }, {} as Record<string, number>);

    // Ordena categorias por valor (maior para menor)
    const categoriasOrdenadas = Object.entries(despesasPorCategoria)
      .sort((a, b) => b[1] - a[1])
      .map(([categoria]) => categoria);

    // Pega as top 5 categorias ou todas se tiver menos de 5
    this.categoriasPrincipais = categoriasOrdenadas.slice(0, 5);
  }

  getCorCategoria(categoria: string): string {
    // Mapeia cores fixas para categorias principais
    const cores: Record<string, string> = {
      Alimentação: '#FF6384',
      Transporte: '#36A2EB',
      Moradia: '#FFCE56',
      Lazer: '#4BC0C0',
      Educação: '#9966FF',
      Saúde: '#FF9F40',
    };

    return cores[categoria] || this.gerarCorAleatoria(categoria);
  }

  private gerarCorAleatoria(semente: string): string {
    // Gera uma cor baseada no nome da categoria para consistência
    let hash = 0;
    for (let i = 0; i < semente.length; i++) {
      hash = semente.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  carregarFiltros(): void {
    this.categorias = [
      ...new Set(this.transacoes.map((t) => t.categoria)),
    ].sort();
    this.bancos = [...new Set(this.transacoes.map((t) => t.banco))].sort();
  }

  aplicarFiltros(): void {
    this.transacoesFiltradas = this.transacoes.filter((t) => {
      const dataTransacao = new Date(t.data);
      const dataInicio = this.filtro.dataInicio
        ? new Date(this.filtro.dataInicio)
        : null;
      const dataFim = this.filtro.dataFim
        ? new Date(this.filtro.dataFim)
        : null;

      return (
        (!this.filtro.dataInicio ||
          (dataInicio && dataTransacao >= dataInicio)) &&
        (!this.filtro.dataFim || (dataFim && dataTransacao <= dataFim)) &&
        (!this.filtro.categoria || t.categoria === this.filtro.categoria) &&
        (!this.filtro.banco || t.banco === this.filtro.banco) &&
        (!this.filtro.tipo || t.tipo === this.filtro.tipo) &&
        (!this.filtro.descricao ||
          t.descricao
            .toLowerCase()
            .includes(this.filtro.descricao.toLowerCase()))
      );
    });

    this.calcularTotais();
    this.identificarCategoriasPrincipais();
    this.criarGraficos();
  }

  limparFiltros(): void {
    this.filtro = {
      dataInicio: '',
      dataFim: '',
      categoria: '',
      banco: '',
      tipo: '',
      descricao: '',
    };
    this.aplicarFiltros();
  }

  async mudarVisualizacao(viewId: string, event?: Event): Promise<void> {
    if (event) event.stopPropagation();

    if (this.activeView !== viewId) {
      this.activeView = viewId;

      // Força uma atualização do ciclo de detecção de mudanças
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Destrói os gráficos existentes
      this.destruirGraficos();

      // Aguarda o DOM ser atualizado
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Cria os novos gráficos
      this.criarGraficos();
    }
  }

  criarGraficos(): void {
    this.destruirGraficos();

    switch (this.activeView) {
      case 'overview':
        this.criarGraficoPizza();
        this.criarGraficoBarras();
        break;
      case 'timeline':
        this.criarGraficoLinhas();
        break;
      case 'banks':
        this.criarGraficoBancos();
        break;
      case 'categories':
        this.criarGraficoCategorias();
        break;
    }
  }

  destruirGraficos(): void {
    Object.values(this.charts).forEach((chart) => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = {
      pieChart: undefined,
      barChart: undefined,
      lineChart: undefined,
      bankChart: undefined,
      categoryChart: undefined,
    };
  }

  private criarGraficoPizza(): void {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!ctx) return;

    const categoriasDespesas = [
      ...new Set(
        this.transacoesFiltradas
          .filter((t) => t.tipo === 'DESPESA')
          .map((t) => t.categoria)
      ),
    ];

    const dados = categoriasDespesas.map((categoria) => {
      return this.transacoesFiltradas
        .filter((t) => t.tipo === 'DESPESA' && t.categoria === categoria)
        .reduce((sum, t) => sum + t.valor, 0);
    });

    this.charts['pieChart'] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categoriasDespesas,
        datasets: [
          {
            data: dados,
            backgroundColor: categoriasDespesas.map((cat) =>
              this.getCorCategoria(cat)
            ),
            borderWidth: 1,
          },
        ],
      },
      options: this.getPieChartOptions(),
    });
  }

  private criarGraficoBarras(): void {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (!ctx) return;

    const bancos = [
      ...new Set(this.transacoesFiltradas.map((t) => t.banco)),
    ].sort();

    const receitas = bancos.map((banco) =>
      this.transacoesFiltradas
        .filter((t) => t.banco === banco && t.tipo === 'RECEITA')
        .reduce((sum, t) => sum + t.valor, 0)
    );

    const despesas = bancos.map((banco) =>
      this.transacoesFiltradas
        .filter((t) => t.banco === banco && t.tipo === 'DESPESA')
        .reduce((sum, t) => sum + t.valor, 0)
    );

    this.charts['barChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bancos,
        datasets: [
          {
            label: 'Receitas',
            data: receitas,
            backgroundColor: '#4BC0C0',
            borderWidth: 1,
          },
          {
            label: 'Despesas',
            data: despesas,
            backgroundColor: '#FF6384',
            borderWidth: 1,
          },
        ],
      },
      options: this.getBarChartOptions(),
    });
  }

  private criarGraficoLinhas(): void {
    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!ctx) return;

    const diasNoMes = new Date(
      parseInt(this.selectedDate.split('-')[0]),
      parseInt(this.selectedDate.split('-')[1]),
      0
    ).getDate();

    const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
    const labels = dias.map((d) => `${d}`);

    const receitas = dias.map((dia) => {
      return this.transacoesFiltradas
        .filter((t) => {
          if (t.tipo !== 'RECEITA') return false;
          const date = new Date(t.data);
          return date.getDate() === dia;
        })
        .reduce((sum, t) => sum + t.valor, 0);
    });

    const despesas = dias.map((dia) => {
      return this.transacoesFiltradas
        .filter((t) => {
          if (t.tipo !== 'DESPESA') return false;
          const date = new Date(t.data);
          return date.getDate() === dia;
        })
        .reduce((sum, t) => sum + t.valor, 0);
    });

    this.charts['lineChart'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Receitas',
            data: receitas,
            borderColor: '#4BC0C0',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            fill: true,
          },
          {
            label: 'Despesas',
            data: despesas,
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            fill: true,
          },
        ],
      },
      options: this.getLineChartOptions(),
    });
  }

  private criarGraficoBancos(): void {
    const ctx = document.getElementById('bankChart') as HTMLCanvasElement;
    if (!ctx) return;

    const bancos = [
      ...new Set(this.transacoesFiltradas.map((t) => t.banco)),
    ].sort();

    const saldos = bancos.map((banco) => {
      const receitas = this.transacoesFiltradas
        .filter((t) => t.banco === banco && t.tipo === 'RECEITA')
        .reduce((sum, t) => sum + t.valor, 0);

      const despesas = this.transacoesFiltradas
        .filter((t) => t.banco === banco && t.tipo === 'DESPESA')
        .reduce((sum, t) => sum + t.valor, 0);

      return receitas - despesas;
    });

    this.charts['bankChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bancos,
        datasets: [
          {
            label: 'Saldo por Banco',
            data: saldos,
            backgroundColor: saldos.map((val) =>
              val >= 0 ? '#4BC0C0' : '#FF6384'
            ),
            borderColor: saldos.map((val) =>
              val >= 0 ? '#4BC0C0' : '#FF6384'
            ),
            borderWidth: 1,
          },
        ],
      },
      options: this.getBankChartOptions(),
    });
  }

  private criarGraficoCategorias(): void {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    const categorias = [
      ...new Set(this.transacoesFiltradas.map((t) => t.categoria)),
    ].sort();

    const dados = categorias.map((categoria) => {
      const receitas = this.transacoesFiltradas
        .filter((t) => t.categoria === categoria && t.tipo === 'RECEITA')
        .reduce((sum, t) => sum + t.valor, 0);

      const despesas = this.transacoesFiltradas
        .filter((t) => t.categoria === categoria && t.tipo === 'DESPESA')
        .reduce((sum, t) => sum + t.valor, 0);

      return { receitas, despesas };
    });

    this.charts['categoryChart'] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: categorias,
        datasets: [
          {
            label: 'Receitas',
            data: dados.map((d) => d.receitas),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: '#4BC0C0',
            borderWidth: 2,
          },
          {
            label: 'Despesas',
            data: dados.map((d) => d.despesas),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: '#FF6384',
            borderWidth: 2,
          },
        ],
      },
      options: this.getRadarChartOptions(),
    });
  }

  // Helper methods for chart configuration
  private getChartColors(count: number): string[] {
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#8AC24A',
      '#607D8B',
      '#E91E63',
      '#9C27B0',
    ];
    return colors.slice(0, count);
  }

  private getPieChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              family: "'Inter', sans-serif",
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce(
                (a: number, b: number) => a + b,
                0
              );
              const percentage = Math.round(
                (Number(value) / Number(total)) * 100
              );
              const formattedValue = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(Number(value));
              return `${label}: ${formattedValue} (${percentage}%)`;
            },
          },
        },
      },
    };
  }

  private getBarChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = Number(context.raw) || 0;
              return `${label}: ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value);
            },
          },
        },
      },
    };
  }

  private getLineChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = Number(context.raw) || 0;
              return `${label}: ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value);
            },
          },
        },
      },
    };
  }

  private getBankChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.raw || 0;
              return `Saldo: ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(Number(value))}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value: any) => {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value);
            },
          },
        },
      },
    };
  }

  private getRadarChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = Number(context.raw) || 0;
              return `${label}: ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value)}`;
            },
          },
        },
      },
      scales: {
        r: {
          angleLines: {
            display: true,
          },
          suggestedMin: 0,
          ticks: {
            callback: (value: any) => {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value);
            },
          },
        },
      },
    };
  }
}
