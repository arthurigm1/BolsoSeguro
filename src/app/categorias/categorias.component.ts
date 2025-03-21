import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categorias',
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'], // Corrigido para styleUrls
})
export class CategoriasComponent {
  activeTab: 'expenses' | 'earnings' = 'expenses'; // Aba ativa
  isModalOpen = false; // Controla a visibilidade do modal
  modalType: 'expenses' | 'earnings' = 'expenses'; // Tipo de categoria no modal

  // Listas de categorias (exemplo)
  expenseCategories = [
    { name: 'Alimentação' },
    { name: 'Transporte' },
    { name: 'Lazer' },
  ];
  earningCategories = [
    { name: 'Salário' },
    { name: 'Investimentos' },
    { name: 'Freelance' },
  ];

  // Nova categoria
  newCategory = {
    name: '',
  };

  // Define a aba ativa
  setActiveTab(tab: 'expenses' | 'earnings') {
    this.activeTab = tab;
  }

  // Abre o modal
  openModal(type: 'expenses' | 'earnings') {
    this.modalType = type;
    this.isModalOpen = true;
  }

  // Fecha o modal
  closeModal() {
    this.isModalOpen = false;
    this.newCategory = { name: '' }; // Reseta o formulário
  }

  // Adiciona uma nova categoria
  addCategory() {
    if (this.newCategory.name) {
      if (this.modalType === 'expenses') {
        this.expenseCategories.push({ ...this.newCategory });
      } else {
        this.earningCategories.push({ ...this.newCategory });
      }
      this.closeModal();
    }
  }
}
