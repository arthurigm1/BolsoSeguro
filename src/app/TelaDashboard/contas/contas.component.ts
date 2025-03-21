import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contas',
  imports: [CommonModule, FormsModule],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.scss',
})
export class ContasComponent {
  isModalOpen = false;
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
  @Output() openModalEvent = new EventEmitter<void>();

  openModal() {
    this.openModalEvent.emit();
  }
}
