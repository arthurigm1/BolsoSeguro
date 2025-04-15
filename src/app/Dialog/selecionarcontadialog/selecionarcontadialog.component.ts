import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { ContaService } from '../../Services/ContaService/conta.service';
import { TransacoesService } from '../../Services/TransacaoService/transacoes.service';

@Component({
  selector: 'app-selecionarcontadialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  template: `
    <div
      class="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 transition-all duration-300 animate-fadeIn"
    >
      <!-- Cabeçalho -->
      <div class="flex justify-between items-center mb-4 sm:mb-6">
        <h2
          class="text-lg sm:text-xl font-bold text-[#013E4C] flex items-center"
        >
          <i class="fas fa-wallet text-[#1C6956] mr-2"></i>
          Selecionar Conta
        </h2>
        <button
          mat-dialog-close
          class="text-[#5e6d72] hover:text-[#013E4C] transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="space-y-4">
        <p class="text-sm sm:text-base text-[#5e6d72]">
          Selecione a conta que será debitada para pagar esta fatura:
        </p>

        <mat-radio-group
          [(ngModel)]="contaSelecionada"
          class="flex flex-col gap-3 sm:gap-4"
        >
          <mat-radio-button
            *ngFor="let conta of contas"
            [value]="conta.id"
            class="p-3 sm:p-4 border border-[#E0E5E7] rounded-xl hover:border-[#1C6956]/30 transition-all duration-200"
          >
            <div class="flex items-center gap-3 sm:gap-4">
              <div
                class="w-10 h-10 rounded-xl bg-[#1C6956] flex items-center justify-center text-white shadow-sm"
              >
                <i class="fas fa-piggy-bank"></i>
              </div>
              <div>
                <h3 class="font-medium text-[#013E4C]">{{ conta.nome }}</h3>
                <p class="text-xs sm:text-sm text-[#5e6d72]">
                  {{ conta.banco }} • Saldo:
                  {{ conta.saldo | currency : 'BRL' : 'symbol' : '1.2-2' }}
                </p>
              </div>
            </div>
          </mat-radio-button>
        </mat-radio-group>

        <div *ngIf="loading" class="text-center py-4">
          <div class="relative w-12 h-12 mx-auto">
            <div
              class="absolute inset-0 rounded-full border-4 border-[#1C6956] border-t-transparent animate-spin"
            ></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <i class="fas fa-wallet text-[#1C6956] text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          mat-dialog-close
          class="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-[#5e6d72] bg-white border border-[#E0E5E7] rounded-xl shadow-sm hover:bg-[#F8F7F5] hover:border-[#1C6956]/30 transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          [disabled]="!contaSelecionada || loading"
          (click)="confirmar()"
          class="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#1C6956] to-[#013E4C] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <i class="fas fa-check"></i>
          <span>Confirmar</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .mat-radio-button {
        border: 1px solid #e0e5e7;
        border-radius: 0.75rem;
        transition: all 0.2s;
      }
      .mat-radio-button.mat-radio-checked {
        border-color: #1c6956;
        background-color: #f8f7f5;
      }
      .mat-radio-outer-circle {
        border-color: #1c6956;
      }
      .mat-radio-inner-circle {
        background-color: #1c6956;
      }
    `,
  ],
})
export class SelecionarcontadialogComponent {
  contas: any[] = []; // Substitua 'any' pelo tipo correto da sua conta
  contaSelecionada: string | null = null;
  loading = false;

  constructor(
    private contaService: ContaService,
    public dialogRef: MatDialogRef<SelecionarcontadialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.carregarContas();
  }
  carregarContas() {
    this.contaService.getSaldoContas().subscribe({
      next: (contas) => {
        this.contas = contas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar contas:', err);
        this.loading = false;
      },
    });
  }
  confirmar() {
    if (this.contaSelecionada) {
      this.dialogRef.close(this.contaSelecionada);
    }
  }
}
