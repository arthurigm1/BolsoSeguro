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
  activeTab: 'expenses' | 'earnings' = 'expenses';
  @Output() openModalEvent = new EventEmitter<'expense' | 'income'>();
  categoriasDespesas: any[] = [];
  categoriasReceitas: any[] = [];
  setActiveTab(tab: 'expenses' | 'earnings') {
    this.activeTab = tab;
  }

  openModal() {
    // Envia o tipo fixo baseado na aba ativa
    const tipo = this.activeTab === 'expenses' ? 'expense' : 'income';
    this.openModalEvent.emit(tipo);
  }
  ngOnInit(): void {
    this.getCategoriasDespesas();
    this.getCategoriasReceitas();
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
            this.getCategoriasDespesas();
            this.getCategoriasReceitas();
          },
          (error) => {
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
