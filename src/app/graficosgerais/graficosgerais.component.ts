import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { TransacoesService } from '../Services/TransacaoService/transacoes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
Chart.register(...registerables);

interface Transacao {
  banco: string;
  valor: number;
  tipo: string;
  categoria: string;
  data: string;
  descricao: string;
  status?: string;
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
  animations: [
    trigger('fadeInOut', [
      state(
        'collapsed',
        style({
          height: '0',
          opacity: '0',
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: '1',
        })
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class GraficosgeraisComponent implements OnInit, OnDestroy {
  // Data properties
  transacoes: Transacao[] = [];
  transacoesFiltradas: Transacao[] = [];
  transacoesMesAnterior: Transacao[] = [];
  categorias: string[] = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saúde',
    'Educação',
    'Outros',
  ];
  bancos: string[] = [];
  tipos = ['RECEITA', 'DESPESA'];
  statusList = ['PENDENTE', 'CONCLUIDO', 'CANCELADO'];

  // Filter properties
  filtro = {
    dataInicio: '',
    dataFim: '',
    categoria: '',
    banco: '',
    tipo: '',
    descricao: '',
    valorMinimo: null as number | null,
    valorMaximo: null as number | null,
    status: '',
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
  currentDate: Date = new Date();

  // UI properties
  selectedDate: string = new Date().toISOString().slice(0, 7);
  loading = false;
  error = '';
  filtrosAvancados = false;

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
    dailyLineChart: undefined,
    doughnutChart: undefined,
    timelineChart: undefined,
    bankChart: undefined,
    bankIncomeChart: undefined,
    bankExpenseChart: undefined,
    categoryChart: undefined,
    categoryIncomeChart: undefined,
    categoryExpenseChart: undefined,
    comparisonChart: undefined,
    incomeComparisonChart: undefined,
    expenseComparisonChart: undefined,
  };

  private subscription?: Subscription;

  constructor(private transacaoService: TransacoesService) {}

  ngOnInit(): void {
    this.carregarTransacoes();
    // Atualiza a data atual a cada minuto
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
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
      Alimentação: '#F97316', // Laranja forte
      Transporte: '#3B82F6', // Azul vibrante
      Moradia: '#FACC15', // Amarelo dourado
      Lazer: '#0EA5E9', // Azul claro/água
      Educação: '#8B5CF6', // Roxo vibrante
      Saúde: '#EF4444', // Vermelho vivo
      Outros: '#A855F7', // Roxo mais claro
    };

    return cores[categoria] || this.gerarCorAleatoria(categoria);
  }

  private gerarCorAleatoria(semente: string): string {
    let hash = 0;
    for (let i = 0; i < semente.length; i++) {
      hash = semente.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Gera hue na faixa que combina com verde (ex: 60° a 180°)
    const baseHue = 60; // amarelo
    const range = 120; // até azul-esverdeado
    const h = (baseHue + (hash % range)) % 360;

    return `hsl(${h}, 60%, 55%)`; // Saturação e brilho equilibrados
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

      const valor = t.valor;
      const valorMinimo = this.filtro.valorMinimo || 0;
      const valorMaximo = this.filtro.valorMaximo || Infinity;

      return (
        (!this.filtro.dataInicio ||
          (dataInicio && dataTransacao >= dataInicio)) &&
        (!this.filtro.dataFim || (dataFim && dataTransacao <= dataFim)) &&
        (!this.filtro.categoria || t.categoria === this.filtro.categoria) &&
        (!this.filtro.banco || t.banco === this.filtro.banco) &&
        (!this.filtro.tipo || t.tipo === this.filtro.tipo) &&
        (!this.filtro.status || t.status === this.filtro.status) &&
        valor >= valorMinimo &&
        valor <= valorMaximo &&
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
      valorMinimo: null,
      valorMaximo: null,
      status: '',
    };
    this.aplicarFiltros();
  }

  toggleFiltrosAvancados(): void {
    this.filtrosAvancados = !this.filtrosAvancados;
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
        this.criarGraficoLinhaDiaria();
        this.criarGraficoRosca();
        break;
      case 'timeline':
        this.criarGraficoLinhaTemporal();
        break;
      case 'banks':
        this.criarGraficoBancos();
        this.criarGraficoReceitasBancos();
        this.criarGraficoDespesasBancos();
        break;
      case 'categories':
        this.criarGraficoCategorias();
        this.criarGraficoReceitasCategorias();
        this.criarGraficoDespesasCategorias();
        break;
      case 'comparison':
        this.criarGraficoComparativo();
        this.criarGraficoComparativoReceitas();
        this.criarGraficoComparativoDespesas();
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
      dailyLineChart: undefined,
      doughnutChart: undefined,
      timelineChart: undefined,
      bankChart: undefined,
      bankIncomeChart: undefined,
      bankExpenseChart: undefined,
      categoryChart: undefined,
      categoryIncomeChart: undefined,
      categoryExpenseChart: undefined,
      comparisonChart: undefined,
      incomeComparisonChart: undefined,
      expenseComparisonChart: undefined,
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
      options: {
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
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
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
      },
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
            borderColor: '#36A2EB',
            borderWidth: 1,
          },
          {
            label: 'Despesas',
            data: despesas,
            backgroundColor: '#FF6384',
            borderColor: '#FF9F40',
            borderWidth: 1,
          },
        ],
      },
      options: {
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
              label: (context) => {
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
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
    });
  }

  private criarGraficoLinhaDiaria(): void {
    const ctx = document.getElementById('dailyLineChart') as HTMLCanvasElement;
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

    this.charts['dailyLineChart'] = new Chart(ctx, {
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
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#4BC0C0',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Despesas',
            data: despesas,
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#FF6384',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
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
              label: (context) => {
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
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
    });
  }

  private criarGraficoRosca(): void {
    const ctx = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (!ctx) return;

    const topCategorias = this.categoriasPrincipais.slice(0, 5);
    const outrosValor =
      this.totalDespesas -
      topCategorias.reduce((sum, cat) => {
        return (
          sum +
          this.transacoesFiltradas
            .filter((t) => t.tipo === 'DESPESA' && t.categoria === cat)
            .reduce((s, t) => s + t.valor, 0)
        );
      }, 0);

    const labels = [...topCategorias];
    const data = [
      ...topCategorias.map((cat) =>
        this.transacoesFiltradas
          .filter((t) => t.tipo === 'DESPESA' && t.categoria === cat)
          .reduce((sum, t) => sum + t.valor, 0)
      ),
    ];

    if (outrosValor > 0) {
      labels.push('Outros');
      data.push(outrosValor);
    }

    this.charts['doughnutChart'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: labels.map((cat) => this.getCorCategoria(cat)),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                family: "'Inter', sans-serif",
                size: 12,
              },
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
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
      },
    });
  }

  private criarGraficoLinhaTemporal(): void {
    const ctx = document.getElementById('timelineChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Simulando dados dos últimos 12 meses para exemplo
    const meses = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date.toLocaleString('default', { month: 'short' });
    });

    // Valores simulados - na implementação real, você buscaria esses dados
    const receitas = meses.map((_, i) => 5000 + Math.random() * 10000);
    const despesas = meses.map((_, i) => 3000 + Math.random() * 8000);

    this.charts['timelineChart'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Receitas',
            data: receitas,
            borderColor: '#4BC0C0',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Despesas',
            data: despesas,
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
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
              label: (context) => {
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
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
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
              val >= 0 ? '#36A2EB' : '#FF9F40'
            ),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
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
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
    });
  }

  private criarGraficoReceitasBancos(): void {
    const ctx = document.getElementById('bankIncomeChart') as HTMLCanvasElement;
    if (!ctx) return;

    const bancos = [
      ...new Set(this.transacoesFiltradas.map((t) => t.banco)),
    ].sort();

    const receitas = bancos.map((banco) =>
      this.transacoesFiltradas
        .filter((t) => t.banco === banco && t.tipo === 'RECEITA')
        .reduce((sum, t) => sum + t.valor, 0)
    );

    this.charts['bankIncomeChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bancos,
        datasets: [
          {
            label: 'Receitas',
            data: receitas,
            backgroundColor: '#4BC0C0',
            borderColor: '#36A2EB',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw || 0;
                return `Receitas: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value))}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
    });
  }

  private criarGraficoDespesasBancos(): void {
    const ctx = document.getElementById(
      'bankExpenseChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    const bancos = [
      ...new Set(this.transacoesFiltradas.map((t) => t.banco)),
    ].sort();

    const despesas = bancos.map((banco) =>
      this.transacoesFiltradas
        .filter((t) => t.banco === banco && t.tipo === 'DESPESA')
        .reduce((sum, t) => sum + t.valor, 0)
    );

    this.charts['bankExpenseChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bancos,
        datasets: [
          {
            label: 'Despesas',
            data: despesas,
            backgroundColor: '#FF6384',
            borderColor: '#FF9F40',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw || 0;
                return `Despesas: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value))}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
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
            pointBackgroundColor: '#4BC0C0',
            pointRadius: 4,
          },
          {
            label: 'Despesas',
            data: dados.map((d) => d.despesas),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: '#FF6384',
            borderWidth: 2,
            pointBackgroundColor: '#FF6384',
            pointRadius: 4,
          },
        ],
      },
      options: {
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
              label: (context) => {
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
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
    });
  }

  private criarGraficoReceitasCategorias(): void {
    const ctx = document.getElementById(
      'categoryIncomeChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    const categorias = [
      ...new Set(
        this.transacoesFiltradas
          .filter((t) => t.tipo === 'RECEITA')
          .map((t) => t.categoria)
      ),
    ].sort();

    const receitas = categorias.map((categoria) =>
      this.transacoesFiltradas
        .filter((t) => t.tipo === 'RECEITA' && t.categoria === categoria)
        .reduce((sum, t) => sum + t.valor, 0)
    );

    this.charts['categoryIncomeChart'] = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: categorias,
        datasets: [
          {
            label: 'Receitas por Categoria',
            data: receitas,
            backgroundColor: categorias.map((cat) => this.getCorCategoria(cat)),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                family: "'Inter', sans-serif",
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value))}`;
              },
            },
          },
        },
      },
    });
  }

  private criarGraficoDespesasCategorias(): void {
    const ctx = document.getElementById(
      'categoryExpenseChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    const categorias = [
      ...new Set(
        this.transacoesFiltradas
          .filter((t) => t.tipo === 'DESPESA')
          .map((t) => t.categoria)
      ),
    ].sort();

    const despesas = categorias.map((categoria) =>
      this.transacoesFiltradas
        .filter((t) => t.tipo === 'DESPESA' && t.categoria === categoria)
        .reduce((sum, t) => sum + t.valor, 0)
    );

    this.charts['categoryExpenseChart'] = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: categorias,
        datasets: [
          {
            label: 'Despesas por Categoria',
            data: despesas,
            backgroundColor: categorias.map((cat) => this.getCorCategoria(cat)),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                family: "'Inter', sans-serif",
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value))}`;
              },
            },
          },
        },
      },
    });
  }

  private criarGraficoComparativo(): void {
    const ctx = document.getElementById('comparisonChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Simulando dados para exemplo
    const meses = [
      this.getPreviousMonth(),
      this.selectedDate.split('-')[1] + '/' + this.selectedDate.split('-')[0],
    ];
    const receitasAtual = this.totalReceitas;
    const despesasAtual = this.totalDespesas;

    // Valores do mês anterior (simulados)
    const receitasAnterior = this.transacoesMesAnterior
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((sum, t) => sum + t.valor, 0);

    const despesasAnterior = this.transacoesMesAnterior
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((sum, t) => sum + t.valor, 0);

    this.charts['comparisonChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Receitas',
            data: [receitasAnterior, receitasAtual],
            backgroundColor: '#4BC0C0',
            borderColor: '#36A2EB',
            borderWidth: 1,
          },
          {
            label: 'Despesas',
            data: [despesasAnterior, despesasAtual],
            backgroundColor: '#FF6384',
            borderColor: '#FF9F40',
            borderWidth: 1,
          },
        ],
      },
      options: {
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
              label: (context) => {
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
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
    });
  }

  private criarGraficoComparativoReceitas(): void {
    const ctx = document.getElementById(
      'incomeComparisonChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    // Simulando dados para exemplo
    const meses = [
      this.getPreviousMonth(),
      this.selectedDate.split('-')[1] + '/' + this.selectedDate.split('-')[0],
    ];

    // Valores do mês anterior (simulados)
    const receitasAnterior = this.transacoesMesAnterior
      .filter((t) => t.tipo === 'RECEITA')
      .reduce((sum, t) => sum + t.valor, 0);

    const receitasAtual = this.totalReceitas;

    this.charts['incomeComparisonChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mês Anterior', 'Mês Atual'],
        datasets: [
          {
            label: 'Receitas',
            data: [receitasAnterior, receitasAtual],
            backgroundColor: ['#C8E6C9', '#4BC0C0'],
            borderColor: ['#81C784', '#36A2EB'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = Number(context.raw) || 0;
                return `Receitas: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(value)}`;
              },
              afterLabel: (context) => {
                if (context.dataIndex === 1) {
                  const variacao =
                    ((receitasAtual - receitasAnterior) / receitasAnterior) *
                    100;
                  return `Variação: ${
                    variacao >= 0 ? '+' : ''
                  }${variacao.toFixed(1)}%`;
                }
                return '';
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
    });
  }

  private criarGraficoComparativoDespesas(): void {
    const ctx = document.getElementById(
      'expenseComparisonChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    // Simulando dados para exemplo
    const meses = [
      this.getPreviousMonth(),
      this.selectedDate.split('-')[1] + '/' + this.selectedDate.split('-')[0],
    ];

    // Valores do mês anterior (simulados)
    const despesasAnterior = this.transacoesMesAnterior
      .filter((t) => t.tipo === 'DESPESA')
      .reduce((sum, t) => sum + t.valor, 0);

    const despesasAtual = this.totalDespesas;

    this.charts['expenseComparisonChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mês Anterior', 'Mês Atual'],
        datasets: [
          {
            label: 'Despesas',
            data: [despesasAnterior, despesasAtual],
            backgroundColor: ['#FFCDD2', '#FF6384'],
            borderColor: ['#E57373', '#FF9F40'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = Number(context.raw) || 0;
                return `Despesas: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(value)}`;
              },
              afterLabel: (context) => {
                if (context.dataIndex === 1) {
                  const variacao =
                    ((despesasAtual - despesasAnterior) / despesasAnterior) *
                    100;
                  return `Variação: ${
                    variacao >= 0 ? '+' : ''
                  }${variacao.toFixed(1)}%`;
                }
                return '';
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value));
              },
            },
          },
        },
      },
    });
  }

  getPreviousMonth(): string {
    const [year, month] = this.selectedDate.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return (
      date.toLocaleString('default', { month: 'short' }) +
      ' ' +
      date.getFullYear()
    );
  }

  calcularPercentualCategoria(categoria: string): string {
    if (this.totalDespesas <= 0) {
      return '0';
    }

    const transacoesCategoria = this.transacoesFiltradas.filter(
      (t) => t.categoria === categoria && t.tipo === 'DESPESA'
    );

    if (transacoesCategoria.length === 0) {
      return '0';
    }

    const totalCategoria = transacoesCategoria.reduce(
      (sum, t) => sum + t.valor,
      0
    );

    const percentual = (totalCategoria / this.totalDespesas) * 100;
    return percentual.toFixed(1);
  }
}
