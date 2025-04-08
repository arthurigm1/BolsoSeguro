import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransacoesService } from '../../Services/TransacaoService/transacoes.service';
import { CategoriaService } from '../../Services/CategoriaService/categoria.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-categorias',
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'], // Corrigido para styleUrls
})
export class CategoriasComponent {
  constructor(
    private transacaoService: TransacoesService,
    private categoriaService: CategoriaService,
    private toastrService: ToastrService
  ) {}
  isLoadingPage = true;
  activeTab: 'expenses' | 'earnings' = 'expenses';
  @Output() openModalEvent = new EventEmitter<'expense' | 'income'>();
  categoriasDespesas: any[] = [];
  categoriasReceitas: any[] = [];

  isLoading: boolean = true;
  loadingExpenses: boolean = false;
  loadingEarnings: boolean = false;
  isAddingCategory: boolean = false;
  deletingCategoryId: string | null = null;
  setActiveTab(tab: 'expenses' | 'earnings') {
    this.activeTab = tab;
    if (tab === 'expenses') {
      this.loadingExpenses = true;
      // Recarrega dados se necessário
      setTimeout(() => (this.loadingExpenses = false), 500); // Simula carregamento
    } else {
      this.loadingEarnings = true;
      setTimeout(() => (this.loadingEarnings = false), 500); // Simula carregamento
    }
  }

  openModal() {
    // Envia o tipo fixo baseado na aba ativa
    const tipo = this.activeTab === 'expenses' ? 'expense' : 'income';
    this.openModalEvent.emit(tipo);
  }
  ngOnInit(): void {
    Promise.all([this.getCategoriasDespesas(), this.getCategoriasReceitas()])
      .then(() => {
        this.isLoadingPage = false;
      })
      .catch((err) => {
        console.error('Erro ao carregar categorias:', err);
        this.isLoadingPage = false;
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

  deletarCategoria(id: string) {
    this.deletingCategoryId = id;
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita! Não e possivel excluir categorias com despesas ou receitas associadas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.deletarCategoria(id).subscribe(
          () => {
            Swal.fire(
              'Excluída!',
              'A categoria foi excluída com sucesso.',
              'success'
            );
            this.deletingCategoryId = null;
            this.getCategoriasDespesas();
            this.getCategoriasReceitas();
          },
          (error) => {
            this.deletingCategoryId = null;
            Swal.fire(
              'Erro!',
              'Erro ao excluir categoria, ela está associada a uma Despesa ou Receita.',
              'error'
            );
          }
        );
      }
    });
  }
}
