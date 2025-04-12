import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { Chart } from 'chart.js';
import { TransacoesService } from '../../Services/TransacaoService/transacoes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Despesa } from '../../Interface/Despesapost.type';
import { Receita } from '../../Interface/Receitapost.type';
import { DespesaService } from '../../Services/DespesaService/despesa.service';
import { ToastrService } from 'ngx-toastr';
import { ReceitaService } from '../../Services/ReceitaService/receita.service';
import { ContaSaldoDTO } from '../../Interface/ContaSaldoDTO.type';
import { forkJoin, Observable } from 'rxjs';
import { ContaService } from '../../Services/ContaService/conta.service';
import { MetaFinanceiraResponseDTO } from '../../Interface/MetaFinanceiraResponseDTO.interface';
import { MetaService } from '../../Services/MetaService/meta.service';
import { CartaoService } from '../../Services/CartaoService/cartao.service';
import { CartaoResponseDTO } from '../../Interface/CartaoDTO.interface';

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
    private toastService: ToastrService,
    private receitaService: ReceitaService,
    private contaService: ContaService,
    private metaService: MetaService,
    private cartaoService: CartaoService
  ) {}
  isLoading = true;
  @Output() activeComponentChange = new EventEmitter<string>();
  @Output() viewChange: EventEmitter<string> = new EventEmitter<string>();
  accounts: ContaSaldoDTO[] = [];
  saldo: number = 0;
  cartoes: CartaoResponseDTO[] = [];
  metas: MetaFinanceiraResponseDTO[] = [];
  totalReceitas: number = 0;
  totalDespesas: number = 0;
  totalInvestimento: number = 0;
  transacoes: any[] = [];
  nome: string = '';
  contas: { id: string; nome: string }[] = [];
  categoriasDespesas: any[] = [];
  categoriasReceitas: any[] = [];
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
  isSaving: boolean = false;
  transferencia = {
    valor: null,
    data: null,
  };
  alterarComponente(componente: string) {
    this.viewChange.emit(componente);
  }
  ngOnInit(): void {
    this.carregarDados();
  }
  carregarDados() {
    this.isLoading = true;

    forkJoin({
      saldo: this.transacaoService.obterSaldo(),
      receitas: this.transacaoService.obterTotalReceitasMes(),
      despesas: this.transacaoService.obterTotalDespesasMes(),
      metas: this.metaService.listarMetas(),
      transacoes: this.transacaoService.obterUltimasTransacoes(),
      investimentos: this.transacaoService.obterSaldoInvestimentos(),
      contas: this.contaService.getSaldoContas(),
      cartoes: this.cartaoService.buscarCartoesPorUsuario(),
    }).subscribe({
      next: (res) => {
        this.saldo = res.saldo.saldo;
        this.nome = res.saldo.nome;
        this.totalReceitas = res.receitas;
        this.totalDespesas = res.despesas;
        this.metas = res.metas;
        this.transacoes = res.transacoes;
        this.totalInvestimento = res.investimentos;
        this.accounts = res.contas;
        this.cartoes = res.cartoes;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar dados do dashboard');
        this.isLoading = false;
      },
    });
  }
  currentDate: Date = new Date();
  openModal(type: string) {
    this.modalType = type;
    this.modalTitle = `Adicionar ${type}`;

    this.carregarContas()
      .then(() => {
        if (type === 'Despesa') {
          return this.getCategoriasDespesas();
        }
        return this.getCategoriasReceitas();
      })
      .then(() => {
        this.cdr.detectChanges(); // Força a atualização do Angular
        this.isModalOpen = true; // Abre o modal após carregar os dados
      })
      .catch((error) => {
        this.toastService.error('Erro ao carregar dados');
      });
  }
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
  calcularProgresso(meta: MetaFinanceiraResponseDTO): number {
    const progresso = ((meta.valorAtual || 0) / meta.valorMeta) * 100;
    return Math.min(100, Math.round(progresso)); // Limita a 100% e arredonda
  }

  getCategoriasDespesas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transacaoService.obterCategoriasDespesas().subscribe(
        (data) => {
          this.categoriasDespesas = data;
          resolve();
        },
        (error) => {
          this.toastService.error('Erro ao carregar categorias de despesas');
          reject(error);
        }
      );
    });
  }

  getCategoriasReceitas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transacaoService.obterCategoriasReceitas().subscribe(
        (data) => {
          this.categoriasReceitas = data;
          resolve();
        },
        (error) => {
          this.toastService.error('Erro ao carregar categorias de receitas');
          reject(error);
        }
      );
    });
  }

  // Fechar modal
  closeModal() {
    this.isModalOpen = false;
    this.modalType = '';
    this.modalTitle = '';

    // Limpa os dados dos formulários
    this.despesa = {
      valor: 0,
      data: new Date(),
      categoria: '',
      descricao: '',
      contaId: '',
    };

    this.receita = {
      valor: 0,
      data: new Date(),
      categoria: '',
      descricao: '',
      contaId: '',
    };
  }

  submitDespesa() {
    this.isSaving = true;
    const despesa: any = {
      categoria: this.despesa.categoria,
      valor: this.despesa.valor,
      data: this.despesa.data,
      descricao: this.despesa.descricao,
    };

    const isConta = this.contas.some((c) => c.id === this.despesa.contaId);

    if (isConta) {
      despesa.contaId = this.despesa.contaId;
    } else {
      despesa.cartaoId = this.despesa.contaId; // Sim, usa o mesmo campo mas como cartão
    }

    // Enviar despesa para o serviço
    this.despesaService.adicionarDespesa(despesa).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.success('Despesa adicionada com sucesso!');
        this.carregarDados();
        this.closeModal();
      },
      error: () => {
        this.isSaving = false;
        this.toastService.error('Erro ao adicionar despesa');
      },
    });
  }

  submitReceita() {
    this.isSaving = true;
    const receita = {
      contaId: this.receita.contaId, // ID da conta
      categoria: this.receita.categoria, // Categoria da despesa
      valor: this.receita.valor, // Valor da despesa
      data: this.receita.data, // Data da despesa
      descricao: this.receita.descricao, // Descrição da despesa
    };

    this.receitaService.adicionarReceita(receita).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.success('Despesa adicionada com sucesso!');
        this.carregarDados();
        this.closeModal();
      },
      error: (err) => {
        this.isSaving = false;
        this.toastService.error('Erro ao adicionar despesa');
      },
    });
  }

  submitTransferencia() {}

  mudarPagina(pagina: string, activeComponent: string) {
    this.viewChange.emit(pagina); // Troca para 'configuracoes'
    this.activeComponentChange.emit(activeComponent); // Define o subcomponente
  }

  getCardLogo(bandeira: string): string {
    switch (bandeira) {
      case 'VISA':
        return 'assets/img/visa.png'; // Atualize com o caminho correto das imagens
      case 'MASTERCARD':
        return 'assets/img/mastercard.png';
      case 'OUTROS':
        return 'assets/img/outroscard.png';
      default:
        return 'assets/logos/default.png'; // Logo padrão
    }
  }
}
