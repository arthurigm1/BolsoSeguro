// edit-card-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-card-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div
      class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-[#E0E5E7] overflow-hidden"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-[#013E4C] to-[#1C6956] px-6 py-4">
        <h2 class="text-xl font-bold text-white flex items-center">
          <i class="fas fa-credit-card mr-2"></i>
          Editar Cartão
        </h2>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <form [formGroup]="editForm" class="space-y-4">
          <!-- Nome do Cartão -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#5e6d72]"
              >Nome do Cartão</label
            >
            <div class="relative">
              <input
                formControlName="nomeCartao"
                class="w-full px-4 py-2.5 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956]/50 focus:border-[#1C6956] bg-white transition-all duration-300 hover:shadow-sm"
                placeholder="Ex: Cartão Nubank"
              />
              <i
                class="fas fa-credit-card absolute right-3 top-3 text-[#748389]"
              ></i>
            </div>
          </div>

          <!-- Limite Total -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#5e6d72]"
              >Limite Total</label
            >
            <div class="relative">
              <span class="absolute left-3 top-3 text-[#748389]">R$</span>
              <input
                type="number"
                formControlName="limiteTotal"
                class="w-full pl-8 pr-10 py-2.5 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956]/50 focus:border-[#1C6956] bg-white transition-all duration-300 hover:shadow-sm"
                placeholder="0,00"
              />
              <i
                class="fas fa-wallet absolute right-3 top-3 text-[#748389]"
              ></i>
            </div>
          </div>

          <!-- Limite Disponível -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-[#5e6d72]"
              >Limite Disponível</label
            >
            <div class="relative">
              <span class="absolute left-3 top-3 text-[#748389]">R$</span>
              <input
                type="number"
                formControlName="limiteDisponivel"
                class="w-full pl-8 pr-10 py-2.5 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956]/50 focus:border-[#1C6956] bg-white transition-all duration-300 hover:shadow-sm"
                placeholder="0,00"
              />
              <i
                class="fas fa-money-bill-wave absolute right-3 top-3 text-[#748389]"
              ></i>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer/Actions -->
      <div class="bg-[#F8F7F5] px-6 py-4 flex justify-end space-x-3">
        <button
          mat-dialog-close
          class="cursor-pointer px-5 py-2.5 text-[#5e6d72] bg-white border border-[#E0E5E7] rounded-xl shadow-sm hover:bg-[#D8EAE5] hover:text-[#1C6956] focus:ring-2 focus:ring-[#1C6956]/50 transition-all duration-300"
        >
          Cancelar
        </button>
        <button
          (click)="save()"
          [disabled]="editForm.invalid"
          class="cursor-pointer px-5 py-2.5 bg-gradient-to-r from-[#1C6956] to-[#013E4C] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
        >
          <i class="fas fa-save mr-2"></i>
          Salvar Alterações
        </button>
      </div>
    </div>
  `,
})
export class EditCardDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.editForm = this.fb.group({
      nomeCartao: [data.card.nome],
      limiteTotal: [data.card.limiteTotal],
      limiteDisponivel: [data.card.limiteDisponivel],
    });
  }

  save() {
    this.dialogRef.close(this.editForm.value);
  }
}
