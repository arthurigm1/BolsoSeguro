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
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContaService } from '../../Services/ContaService/conta.service';
import { ContaCadastroDTO } from '../../Interface/ContaCadastroDTO.type';
import { ToastrService } from 'ngx-toastr';
import { MetasfinanceirasComponent } from '../metasfinanceiras/metasfinanceiras.component';

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
    // Adicione este serviço
    private toastrService: ToastrService
  ) {}

  @Input() activeComponent: string = 'categorias';
  @Output() contaAtualizada = new EventEmitter<void>();
  @Output() categoriaAtualizada = new EventEmitter<void>(); // Novo EventEmitter
  @ViewChild(ContasComponent) contasComponent!: ContasComponent;
  @ViewChild(CategoriasComponent) categoriasComponent!: CategoriasComponent; // Nova referência

  // Estados do modal
  isModalOpen = false;
  modalType: 'conta' | 'categoria' = 'conta';
  categoriaModalType: 'expenses' | 'earnings' = 'expenses'; // Tipo de categoria (despesa/receita)

  // Objetos para formulários
  newAccount = {
    name: '',
    balance: 0,
  };

  newCategory = {
    name: '',
    type: 'expense', // 'expense' ou 'income'
  };

  setActive(component: string) {
    this.activeComponent = component;
  }

  // Métodos para abrir modais
  openGlobalModal(
    type: 'conta' | 'categoria',
    categoriaType?: 'expenses' | 'earnings'
  ) {
    this.modalType = type;
    this.isModalOpen = true;

    if (type === 'categoria' && categoriaType) {
      this.categoriaModalType = categoriaType;
      this.newCategory.type =
        categoriaType === 'expenses' ? 'expense' : 'income';
    }
  }

  closeGlobalModal() {
    this.isModalOpen = false;
    this.resetForms();
  }

  resetForms() {
    this.newAccount = { name: '', balance: 0 };
    this.newCategory = { name: '', type: 'expense' };
  }

  // Adiciona uma nova conta
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

  // Adiciona uma nova categoria
  addCategory() {}
}
