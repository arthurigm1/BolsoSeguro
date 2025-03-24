import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ContasComponent } from '../contas/contas.component';
import { CategoriasComponent } from '../categorias/categorias.component';
import { CartaoComponent } from '../cartao/cartao.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContaService } from '../../Services/ContaService/conta.service';
import { ContaCadastroDTO } from '../../Interface/ContaCadastroDTO.type';
import { ToastrService } from 'ngx-toastr';
import { MetasfinanceirasComponent } from '../metasfinanceiras/metasfinanceiras.component';
import { CategoriaDTO } from '../../Interface/CategoriaDTO.interface';
import { CategoriaService } from '../../Services/CategoriaService/categoria.service';

@Component({
  selector: 'app-configuracoes',
  imports: [
    ContasComponent,
    CategoriasComponent,
    CartaoComponent,
    CommonModule,
    FormsModule,
    MetasfinanceirasComponent,
  ],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.scss',
})
export class ConfiguracoesComponent {
  constructor(
    private contaService: ContaService,

    private toastrService: ToastrService,
    private categoriaService: CategoriaService
  ) {}

  @Input() activeComponent: string = 'categorias';
  @Output() contaAtualizada = new EventEmitter<void>();
  @Output() categoriaAtualizada = new EventEmitter<void>();
  @Output() metaAtualizada = new EventEmitter<void>(); // Novo EventEmitter
  @ViewChild(ContasComponent) contasComponent!: ContasComponent;
  @ViewChild(CategoriasComponent) categoriasComponent!: CategoriasComponent;
  @ViewChild(MetasfinanceirasComponent)
  metasComponent!: MetasfinanceirasComponent; // Nova referência

  // Estados do modal
  isModalOpen = false;
  modalType: 'conta' | 'categoria' | 'meta' = 'conta'; // Adicionado tipo 'meta'
  categoriaModalType: 'expenses' | 'earnings' = 'expenses';

  // Objetos para formulários
  newAccount = {
    name: '',
    balance: 0,
  };

  newCategory = {
    name: '',
    type: 'expense',
  };

  newGoal = {
    name: '',
    targetValue: 0,
    currentValue: 0,
  };

  setActive(component: string) {
    this.activeComponent = component;
  }

  openGlobalModal(
    type: 'conta' | 'categoria' | 'meta',
    categoriaTipo?: 'expense' | 'income'
  ) {
    this.modalType = type;
    this.isModalOpen = true;

    if (type === 'categoria' && categoriaTipo) {
      // Define o tipo fixo baseado no que veio do componente filho
      this.newCategory.type = categoriaTipo;
      this.categoriaModalType =
        categoriaTipo === 'expense' ? 'expenses' : 'earnings';
    }
  }

  closeGlobalModal() {
    this.isModalOpen = false;
    this.resetForms();
  }

  resetForms() {
    this.newAccount = { name: '', balance: 0 };
    this.newCategory = { name: '', type: 'expense' };
    this.newGoal = { name: '', targetValue: 0, currentValue: 0 };
  }

  addAccount() {
    const contaCadastro: ContaCadastroDTO = {
      banco: this.newAccount.name,
      saldo: this.newAccount.balance,
    };
    this.contaService.cadastrarConta(contaCadastro).subscribe(
      (novaConta) => {
        this.toastrService.success('Conta cadastrada com sucesso!');
        this.contasComponent.atualizarContas();
        this.closeGlobalModal();
        this.contaAtualizada.emit();
      },
      (error) => {
        this.toastrService.error('Erro ao cadastrar conta!');
        console.error(error);
      }
    );
  }

  addCategory() {
    const categoriaDTO: CategoriaDTO = {
      nome: this.newCategory.name,
      tipo: this.newCategory.type === 'expense' ? 'DESPESA' : 'RECEITA',
    };

    this.categoriaService.criarCategoria(categoriaDTO).subscribe(
      (response) => {
        this.toastrService.success('Categoria criada com sucesso!');
        this.categoriasComponent.getCategoriasDespesas();
        this.categoriasComponent.getCategoriasReceitas();
        this.closeGlobalModal();
        this.categoriaAtualizada.emit();
      },
      (error) => {
        this.toastrService.error('Erro ao criar categoria!');
        console.error(error);
      }
    );
  }

  addGoal() {}
}
