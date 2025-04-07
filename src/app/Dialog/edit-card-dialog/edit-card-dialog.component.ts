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
    <div class="bg-white rounded-xl shadow-xl overflow-hidden ">
      <!-- Header -->
      <div class="bg-gradient-to-r from-gray-200 to-gray-50 px-6 py-4">
        <h2 class="text-xl font-bold text-black">Editar Cartão</h2>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <form [formGroup]="editForm" class="space-y-4">
          <!-- Nome do Cartão -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Nome do Cartão</label
            >
            <input
              formControlName="nomeCartao"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Ex: Cartão Nubank"
            />
          </div>

          <!-- Limite Total -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Limite Total</label
            >
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">R$</span>
              <input
                type="number"
                formControlName="limiteTotal"
                class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0,00"
              />
            </div>
          </div>

          <!-- Limite Disponível -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700"
              >Limite Disponível</label
            >
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">R$</span>
              <input
                type="number"
                formControlName="limiteDisponivel"
                class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0,00"
              />
            </div>
          </div>
        </form>
      </div>

      <!-- Footer/Actions -->
      <div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
        <button
          mat-dialog-close
          class="cursor-pointer px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          (click)="save()"
          [disabled]="editForm.invalid"
          class="flex items-center bg-gradient-to-r from-[#b6c6cc] to-[#5e6d72] text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
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
