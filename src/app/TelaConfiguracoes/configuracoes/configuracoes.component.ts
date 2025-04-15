import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

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
import { FaturaDetalhesComponent } from '../../fatura-detalhes/fatura-detalhes.component';
import { ContasComponent } from '../contas/contas.component';

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
    FaturaDetalhesComponent,
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
  isSaving: boolean = false;
  @Input() activeComponent: string = 'categorias';
  @Output() contaAtualizada = new EventEmitter<void>();
  @Output() categoriaAtualizada = new EventEmitter<void>();
  @Output() cartaoAtualizado = new EventEmitter<void>();
  @Output() metaAtualizada = new EventEmitter<void>(); // Novo EventEmitter
  @ViewChild(ContasComponent) contasComponent!: ContasComponent;
  @ViewChild(CategoriasComponent) categoriasComponent!: CategoriasComponent;
  @ViewChild(CartaoComponent) cartaoComponent!: CartaoComponent;
  @ViewChild(MetasfinanceirasComponent)
  metasComponent!: MetasfinanceirasComponent;

  faturaData: any = null; // Para armazenar os dados da fatura
  mobileMenuOpen: boolean = false;
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  showFaturaDetails(cartaoId: string): void {
    const hoje = new Date();
    this.faturaData = {
      cartaoId,
      mes: hoje.getMonth() + 1,
      ano: hoje.getFullYear(),
    };

    this.activeComponent = 'cartaofatura';
  }
  onSubmit() {
    console.log('Formulário enviado! Tipo:', this.modalType);
    switch (this.modalType) {
      case 'categoria':
        this.addCategory();
        break;
      case 'meta':
        this.addMeta();
        break;
      case 'cartao':
        this.addCard();
        break;
      default:
        break;
    }
  }

  menuItems = [
    { id: 'categorias', icon: 'fas fa-tags', label: 'Categorias' },
    { id: 'contas', icon: 'fas fa-wallet', label: 'Contas' },
    { id: 'cartoes', icon: 'fas fa-credit-card', label: 'Cartões de crédito' },
    { id: 'metas', icon: 'fas fa-chart-line', label: 'Metas Financeiras' },
    { id: 'minhaconta', icon: 'fas fa-cog', label: 'Configurações' },
  ];
  // Método para voltar para a lista de cartões
  backToCards(): void {
    this.activeComponent = 'cartoes';
    this.faturaData = null;
  }
  // Estados do modal
  isModalOpen = false;
  modalType: 'categoria' | 'meta' | 'cartao' = 'categoria'; // Removido tipo 'conta'
  categoriaModalType: 'expenses' | 'earnings' = 'expenses';

  // Objetos para formulários
  newCategory = {
    name: '',
    type: 'expense',
  };

  newCard = {
    nome: '',
    limiteTotal: 0,
    bandeira: '',
    vencimentoFatura: 0,
    diaFechamentoFatura: 0,
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
    type: 'categoria' | 'meta' | 'cartao',
    categoriaTipo?: 'expense' | 'income'
  ) {
    this.modalType = type;
    this.isModalOpen = true;

    if (type === 'categoria' && categoriaTipo) {
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
    this.newCategory = { name: '', type: 'expense' };
    this.newGoal = { name: '', targetValue: 0, currentValue: 0 };
    this.newCard = {
      nome: '',
      limiteTotal: 0,
      bandeira: '',
      vencimentoFatura: 0,
      diaFechamentoFatura: 0,
    };
  }

  onCancel() {
    this.isSaving = false;
    this.closeGlobalModal();
  }

  addCategory() {
    this.isSaving = true;
    const categoriaDTO: CategoriaDTO = {
      nome: this.newCategory.name,
      tipo: this.newCategory.type === 'expense' ? 'DESPESA' : 'RECEITA',
    };

    this.categoriaService.criarCategoria(categoriaDTO).subscribe(
      (response) => {
        this.toastrService.success('Categoria criada com sucesso!');

        this.closeGlobalModal();
        this.categoriaAtualizada.emit();
        this.isSaving = false;
      },
      (error) => {
        this.toastrService.error('Erro ao criar categoria!');
        this.isSaving = false;
      }
    );
  }
  dias: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  addCard() {
    this.isSaving = true;

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
        this.isSaving = false;
      },
      error: (err) => {
        this.toastrService.error('Erro ao criar cartão!');
        this.isSaving = false;
      },
    });
  }
  getActiveTitle() {
    const activeItem = this.menuItems.find(
      (item) => item.id === this.activeComponent
    );
    return activeItem ? activeItem.label : 'Configurações';
  }
  currentDate: Date = new Date();
  addMeta() {
    this.isSaving = true;
    const metaRequest: MetaFinanceiraRequestDTO = {
      nome: this.newGoal.name,
      valorMeta: this.newGoal.targetValue,
      valorAtual: this.newGoal.currentValue || 0, // Se o usuário não colocar valorAtual, será atribuído 0
    };

    this.metaService.criarMeta(metaRequest).subscribe({
      next: (response) => {
        this.toastrService.success('Meta criada com sucesso!');
        this.isSaving = false;
        this.metasComponent.carregarMetas();
        this.metaAtualizada.emit();
        this.closeGlobalModal();
        this.resetGoalForm();
      },
      error: (error) => {
        this.toastrService.error('Erro ao criar Meta!');
        this.isSaving = false;
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
