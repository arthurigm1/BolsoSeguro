import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransacoesService } from '../../Services/TransacaoService/transacoes.service';
import { CategoriaService } from '../../Services/CategoriaService/categoria.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { NovaCategoriaDialogComponent } from '../../Dialog/nova-categoria-dialog/nova-categoria-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
  ],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
})
export class CategoriasComponent implements OnInit {
  constructor(
    private transacaoService: TransacoesService,
    private categoriaService: CategoriaService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  isLoadingPage = true;
  activeTab: 'expenses' | 'earnings' = 'expenses';
  categoriasDespesas: any[] = [];
  categoriasReceitas: any[] = [];
  loadingExpenses: boolean = false;
  loadingEarnings: boolean = false;
  deletingCategoryId: string | null = null;
  isAddingCategory: boolean = false;

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.isLoadingPage = true;
    Promise.all([this.getCategoriasDespesas(), this.getCategoriasReceitas()])
      .then(() => {
        this.isLoadingPage = false;
      })
      .catch((err) => {
        console.error('Erro ao carregar categorias:', err);
        this.toastrService.error('Erro ao carregar categorias');
        this.isLoadingPage = false;
      });
  }

  setActiveTab(tab: 'expenses' | 'earnings'): void {
    this.activeTab = tab;
    if (tab === 'expenses') {
      this.loadingExpenses = true;
      setTimeout(() => (this.loadingExpenses = false), 500);
    } else {
      this.loadingEarnings = true;
      setTimeout(() => (this.loadingEarnings = false), 500);
    }
  }

  openModal(): void {
    const dialogRef = this.dialog.open(NovaCategoriaDialogComponent, {
      width: '500px',
      data: { tipo: this.activeTab === 'expenses' ? 'expense' : 'income' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.carregarCategorias();
      }
    });
  }

  getCategoriasDespesas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transacaoService.obterCategoriasDespesas().subscribe({
        next: (data) => {
          this.categoriasDespesas = data;
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar categorias de despesas:', error);
          this.toastrService.error('Erro ao carregar categorias de despesas');
          reject(error);
        },
      });
    });
  }

  getCategoriasReceitas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.transacaoService.obterCategoriasReceitas().subscribe({
        next: (data) => {
          this.categoriasReceitas = data;
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar categorias de receitas:', error);
          this.toastrService.error('Erro ao carregar categorias de receitas');
          reject(error);
        },
      });
    });
  }

  deletarCategoria(id: string): void {
    this.deletingCategoryId = id;
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita! Não é possível excluir categorias com despesas ou receitas associadas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.deletarCategoria(id).subscribe({
          next: () => {
            this.toastrService.success('Categoria excluída com sucesso!');
            this.deletingCategoryId = null;
            this.carregarCategorias();
          },
          error: (error) => {
            this.deletingCategoryId = null;
            this.toastrService.error(
              'Erro ao excluir categoria. Ela está associada a uma Despesa ou Receita.'
            );
          },
        });
      } else {
        this.deletingCategoryId = null;
      }
    });
  }
}
