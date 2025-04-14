import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { Chart } from 'chart.js';
import { TransacoesService } from '../../Services/TransacaoService/transacoes.service';
import { CommonModule, registerLocaleData } from '@angular/common';

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
import { MatDialog } from '@angular/material/dialog';
import { NovaTransacaoDialogComponent } from '../../Dialog/nova-transacao-dialog/nova-transacao-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    NovaTransacaoDialogComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  monthProgress: number = 0;
  constructor(
    private transacaoService: TransacoesService,

    private toastService: ToastrService,

    private contaService: ContaService,
    private metaService: MetaService,
    private cartaoService: CartaoService,
    private dialog: MatDialog
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

  isModalOpen = false;
  modalTitle = '';
  modalType = '';
  isSaving: boolean = false;

  currentDate: Date = new Date();

  alterarComponente(componente: string) {
    this.viewChange.emit(componente);
  }

  ngOnInit(): void {
    this.carregarDados();
  }
  saldoProporcao: number = 0;
  maxWidth: number = 100; // Máximo de 100% para a barra

  // Adicione este método para calcular a largura da barra
  getSaldoWidth(): number {
    if (this.totalReceitas === 0) return 0;

    // Calcula a proporção do saldo em relação à receita total
    this.saldoProporcao = (this.saldo / this.totalReceitas) * 100;

    // Limita a largura para não ultrapassar os limites visuais
    return Math.min(this.maxWidth, Math.max(0, Math.abs(this.saldoProporcao)));
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
        this.getSaldoWidth();
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar dados do dashboard');
        this.isLoading = false;
      },
    });
  }
  calcularPorcentagemEconomia(): number {
    if (this.totalReceitas <= 0) return 0;

    const porcentagem = (this.saldo / this.totalReceitas) * 100;
    return Math.min(100, Math.max(0, Math.round(porcentagem)));
  }
  openModal(type: string) {
    const dialogRef = this.dialog.open(NovaTransacaoDialogComponent, {
      width: '500px',
      data: { tipo: type === 'Despesa' ? 'DESPESA' : 'RECEITA' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.carregarDados(); // Recarrega os dados do dashboard se uma transação foi adicionada
      }
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

  mudarPagina(pagina: string, activeComponent: string) {
    this.viewChange.emit(pagina);
    this.activeComponentChange.emit(activeComponent);
  }

  getCardLogo(bandeira: string): string {
    switch (bandeira) {
      case 'VISA':
        return 'assets/img/visa.png';
      case 'MASTERCARD':
        return 'assets/img/mastercard.png';
      case 'OUTROS':
        return 'assets/img/outroscard.png';
      default:
        return 'assets/logos/default.png';
    }
  }

  calcularLimiteTotal(): number {
    if (!this.cartoes || this.cartoes.length === 0) return 0;
    return this.cartoes.reduce(
      (total, cartao) => total + cartao.limiteDisponivel,
      0
    );
  }

  calcularPorcentagemLimite(): number {
    if (!this.cartoes || this.cartoes.length === 0) return 0;
    const limiteDisponivel = this.calcularLimiteTotal();
    // Usando um valor fixo como referência para o limite total
    const limiteTotal = 10000; // Valor de referência
    return (limiteDisponivel / limiteTotal) * 100;
  }
}
