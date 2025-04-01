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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContaService } from '../../Services/ContaService/conta.service';
import { ContaCadastroDTO } from '../../Interface/ContaCadastroDTO.type';

import { MetasfinanceirasComponent } from '../metasfinanceiras/metasfinanceiras.component';
import { CategoriaDTO } from '../../Interface/CategoriaDTO.interface';
import { CategoriaService } from '../../Services/CategoriaService/categoria.service';
import { MetaService } from '../../Services/MetaService/meta.service';
import { MetaFinanceiraRequestDTO } from '../../Interface/MetaFinanceiraResponseDTO.interface';
import { ToastrService } from 'ngx-toastr';
import { CartaoService } from '../../Services/CartaoService/cartao.service';
import { CartaoDTO } from '../../Interface/CartaoDTO.interface';
import { MinhacontaComponent } from '../minhaconta/minhaconta.component';

@Component({
  selector: 'app-configuracoes',
  imports: [
    ContasComponent,
    CategoriasComponent,
    CartaoComponent,
    CommonModule,
    FormsModule,
    MetasfinanceirasComponent,
    ReactiveFormsModule,
    MinhacontaComponent,
  ],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.scss',
})
export class ConfiguracoesComponent {
  constructor(
    private contaService: ContaService,
    private toastrService: ToastrService,
    private cartaoService: CartaoService,
    private categoriaService: CategoriaService,
    private metaService: MetaService
  ) {}

  @Input() activeComponent: string = 'categorias';
  @Output() contaAtualizada = new EventEmitter<void>();
  @Output() categoriaAtualizada = new EventEmitter<void>();
  @Output() cartaoAtualizado = new EventEmitter<void>();
  @Output() metaAtualizada = new EventEmitter<void>(); // Novo EventEmitter
  @ViewChild(ContasComponent) contasComponent!: ContasComponent;
  @ViewChild(CategoriasComponent) categoriasComponent!: CategoriasComponent;
  @ViewChild(CartaoComponent) cartaoComponent!: CartaoComponent;
  @ViewChild(MetasfinanceirasComponent)
  metasComponent!: MetasfinanceirasComponent; // Nova referência

  // Estados do modal
  isModalOpen = false;
  modalType: 'conta' | 'categoria' | 'meta' | 'cartao' = 'conta'; // Adicionado tipo 'meta'
  categoriaModalType: 'expenses' | 'earnings' = 'expenses';

  // Objetos para formulários
  newAccount = {
    name: '',
    balance: 0,
  };
  newCard = {
    nome: '',
    limiteTotal: 0,
    bandeira: '', // Inicia com valor vazio
    vencimentoFatura: 0,
    diaFechamentoFatura: 0,
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
  selectBandeira(bandeira: string) {
    this.newCard.bandeira = bandeira;
  }

  setActive(component: string) {
    this.activeComponent = component;
  }

  openGlobalModal(
    type: 'conta' | 'categoria' | 'meta' | 'cartao',
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
  dias: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  addCard() {
    // Garantir que o dia de fechamento da fatura seja um valor válido
    const diaFechamento = +this.newCard.diaFechamentoFatura;

    // Criar o vencimento da fatura como um número (exemplo: mês de vencimento)
    const vencimento = new Date();
    vencimento.setMonth(vencimento.getMonth() + 1); // Define para o próximo mês
    vencimento.setDate(diaFechamento); // Define o dia conforme o valor de diaFechamentoFatura

    // Usando o mês como o número para vencimento (1-12)
    const vencimentoFaturaNumero = vencimento.getMonth() + 1; // Mês (1-12)

    const cartaoDTO: CartaoDTO = {
      nome: this.newCard.nome,
      limiteTotal: this.newCard.limiteTotal,
      bandeira: this.newCard.bandeira,
      vencimentoFatura: vencimentoFaturaNumero, // Passando o mês como número
      diaFechamentoFatura: diaFechamento, // Passa o dia também
    };

    // Chamada ao serviço para criar o cartão
    this.cartaoService.criarCartao(cartaoDTO).subscribe({
      next: () => {
        this.toastrService.success('Cartão criado com sucesso!');
        this.cartaoComponent.buscarCartoes();
        this.cartaoAtualizado.emit();
        this.closeGlobalModal();
      },
      error: (err) => {
        this.toastrService.error('Erro ao criar cartão!');
      },
    });
  }

  addMeta() {
    const metaRequest: MetaFinanceiraRequestDTO = {
      nome: this.newGoal.name,
      valorMeta: this.newGoal.targetValue,
      valorAtual: this.newGoal.currentValue || 0, // Se o usuário não colocar valorAtual, será atribuído 0
    };

    this.metaService.criarMeta(metaRequest).subscribe({
      next: (response) => {
        this.toastrService.success('Meta criada com sucesso!');
        this.metasComponent.carregarMetas();
        this.metaAtualizada.emit();
        this.closeGlobalModal();
        this.resetGoalForm();
      },
      error: (error) => {
        this.toastrService.error('Erro ao criar Meta!');
      },
    });
  }

  resetGoalForm() {
    this.newGoal = {
      name: '',
      targetValue: 0,
      currentValue: 0,
    };
  }
}
