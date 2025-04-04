import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { ContaService } from '../Services/ContaService/conta.service';
import { TransacoesService } from '../Services/TransacaoService/transacoes.service';

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
    <h2 mat-dialog-title>Selecionar Conta para Pagamento</h2>
    <mat-dialog-content>
      <p>Selecione a conta que será debitada para pagar esta fatura:</p>

      <mat-radio-group
        [(ngModel)]="contaSelecionada"
        class="flex flex-col gap-4 my-4"
      >
        <mat-radio-button
          *ngFor="let conta of contas"
          [value]="conta.id"
          class="p-3 border rounded-lg"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
            >
              <mat-icon>account_balance</mat-icon>
            </div>
            <div>
              <h3 class="font-medium">{{ conta.nome }}</h3>
              <p class="text-sm text-gray-500">
                {{ conta.banco }} Saldo:
                {{ conta.saldo | currency : 'BRL' : 'symbol' : '1.2-2' }}
              </p>
            </div>
          </div>
        </mat-radio-button>
      </mat-radio-group>

      <div *ngIf="loading" class="text-center py-4">
        <mat-spinner diameter="30"></mat-spinner>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!contaSelecionada || loading"
        (click)="confirmar()"
      >
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .mat-radio-button {
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        transition: all 0.2s;
      }
      .mat-radio-button.mat-radio-checked {
        border-color: #3b82f6;
        background-color: #f0f7ff;
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
