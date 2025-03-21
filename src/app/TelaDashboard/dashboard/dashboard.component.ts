import { ChangeDetectorRef, Component } from '@angular/core';
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
import { Observable } from 'rxjs';

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
    private receitaService: ReceitaService
  ) {}
  accounts: ContaSaldoDTO[] = [];
  saldo: number = 0;
  totalReceitas: number = 0;
  totalDespesas: number = 0;
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

  transferencia = {
    valor: null,
    data: null,
  };

  ngOnInit(): void {
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

    this.transacaoService
      .getSaldoContas()
      .subscribe((data) => (this.accounts = data));
  }

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
        console.error('Erro ao carregar dados para o modal:', error);
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

  getCategoriasDespesas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transacaoService.obterCategoriasDespesas().subscribe(
        (data) => {
          this.categoriasDespesas = data;
          resolve();
        },
        (error) => {
          console.error('Erro ao carregar categorias de despesas:', error);
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
          console.error('Erro ao carregar categorias de receitas:', error);
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

  submitReceita() {
    const receita = {
      contaId: this.receita.contaId, // ID da conta
      categoria: this.receita.categoria, // Categoria da despesa
      valor: this.receita.valor, // Valor da despesa
      data: this.receita.data, // Data da despesa
      descricao: this.receita.descricao, // Descrição da despesa
    };

    // Envia os dados para o back-end via serviço
    this.receitaService.adicionarReceita(receita).subscribe({
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

  submitTransferencia() {}
}
