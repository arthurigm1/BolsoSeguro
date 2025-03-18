import { ChangeDetectorRef, Component } from '@angular/core';
import { Chart } from 'chart.js';
import { TransacoesService } from '../../Services/TransacaoService/transacoes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Despesa } from '../../Interface/Despesapost.type';
import { Receita } from '../../Interface/Receitapost.type';
import { DespesaService } from '../../Services/DespesaService/despesa.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  constructor(
    private transacaoService: TransacoesService,
    private despesaService: DespesaService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastrService
  ) {}
  saldo: number = 0;
  totalReceitas: number = 0;
  totalDespesas: number = 0;
  transacoes: any[] = [];
  nome: string = '';
  contas: { id: string; nome: string }[] = [];
  categorias: { id: number; nome: string; fixa: boolean }[] = [];
  despesa: Despesa = {
    valor: 0,
    data: new Date(),
    categoria: '',
    descricao: '',
    contaId: '',
  };
  receita: Receita = {
    valor: 0,
    data: new Date(),
    categoria: '',
    descricao: '',
    contaId: '',
  };
  isModalOpen = false;
  modalTitle = '';
  modalType = '';

  transferencia = {
    valor: null,
    data: null,
  };

  ngOnInit(): void {
    this.renderChart();
    this.carregarDados();
  }

  carregarDados() {
    this.transacaoService
      .obterSaldo()
      .subscribe(
        (data) => ((this.saldo = data.saldo), (this.nome = data.nome))
      );
    this.transacaoService
      .obterTotalReceitasMes()
      .subscribe((data) => (this.totalReceitas = data));
    this.transacaoService
      .obterTotalDespesasMes()
      .subscribe((data) => (this.totalDespesas = data));
    this.transacaoService
      .obterUltimasTransacoes()
      .subscribe((data) => (this.transacoes = data));
  }
  renderChart(): void {
    const ctx = document.getElementById(
      'incomeExpenseChart'
    ) as HTMLCanvasElement;
    const incomeExpenseChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [
          {
            label: 'Receitas',
            data: [5000, 6000, 5500, 7000, 6500, 8000],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Despesas',
            data: [4000, 4500, 5000, 5500, 6000, 6500],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  openModal(type: string) {
    this.modalType = type;
    this.modalTitle = `Adicionar ${type}`;

    // Carregar contas e categorias e depois abrir o modal
    this.carregarContas()
      .then(() => {
        return this.carregarCategorias(); // Aguarda a carga das categorias depois de contas
      })
      .then(() => {
        this.cdr.detectChanges(); // Força a detecção de mudanças após a atribuição
        this.isModalOpen = true; // Abre o modal quando contas e categorias estiverem carregadas
      })
      .catch((error) => {
        console.error('Erro ao carregar dados para o modal:', error); // Exibe erro caso falhe
      });
  }

  // Atualize as funções carregarContas e carregarCategorias para retornar promessas
  carregarContas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transacaoService.obterContas().subscribe(
        (data) => {
          this.contas = data;
          resolve();
        },
        (error) => {
          this.toastService.error('Erro ao carregar Contas');
        }
      );
    });
  }

  carregarCategorias(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transacaoService.obterCategorias().subscribe(
        (data) => {
          console.log('Categorias carregadas:', data); // Verificar a resposta no console
          this.categorias = data; // Atribuir os dados diretamente
          resolve();
        },
        (error) => {
          console.error('Erro ao carregar categorias:', error);
          reject(error);
        }
      );
    });
  }

  // Fechar modal
  closeModal() {
    this.isModalOpen = false;
  }

  submitDespesa() {
    const despesa = {
      contaId: this.despesa.contaId, // ID da conta
      categoria: this.despesa.categoria, // Categoria da despesa
      valor: this.despesa.valor, // Valor da despesa
      data: this.despesa.data, // Data da despesa
      descricao: this.despesa.descricao, // Descrição da despesa
    };

    // Envia os dados para o back-end via serviço
    this.despesaService.adicionarDespesa(despesa).subscribe({
      next: () => {
        this.toastService.success('Despesa adicionada com sucesso!');
        this.carregarDados();
        this.closeModal();
      },
      error: (err) => {
        this.toastService.error('Erro ao adicionar despesa');
        console.error('Erro:', err);
      },
    });
  }

  submitReceita() {}

  submitTransferencia() {}
}
