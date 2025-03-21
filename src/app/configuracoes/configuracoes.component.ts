import { Component, Input } from '@angular/core';
import { ContasComponent } from '../TelaDashboard/contas/contas.component';
import { CategoriasComponent } from '../categorias/categorias.component';
import { CartaoComponent } from '../cartao/cartao.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracoes',
  imports: [
    ContasComponent,
    CategoriasComponent,
    CartaoComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.scss',
})
export class ConfiguracoesComponent {
  @Input() activeComponent: string = 'categorias';
  setActive(component: string) {
    this.activeComponent = component;
  }

  isModalOpen = false;

  openGlobalModal() {
    this.isModalOpen = true;
  }

  closeGlobalModal() {
    this.isModalOpen = false;
  }

  accounts = [{ name: 'Conta Inicial', balance: 1000.0 }];

  newAccount = {
    name: '',
    balance: 0,
  };

  // Fecha o modal
  closeModal() {
    this.isModalOpen = false;
    this.newAccount = { name: '', balance: 0 }; // Reseta o formulário
  }

  // Adiciona uma nova conta
  addAccount() {
    if (this.newAccount.name && this.newAccount.balance) {
      this.accounts.push({ ...this.newAccount });
      this.closeModal();
    }
  }
}
