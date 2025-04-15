import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContaService } from '../../Services/ContaService/conta.service';
import { ToastrService } from 'ngx-toastr';
import { ContaCadastroDTO } from '../../Interface/ContaCadastroDTO.type';
import { finalize } from 'rxjs/operators';
import {
  animate,
  style,
  transition,
  trigger,
  query,
  stagger,
  animateChild,
} from '@angular/animations';

@Component({
  selector: 'app-nova-conta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <!-- Main dialog container with glass morphism effect -->
    <div
      class="relative p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
      [@dialogContainer]="{
        value: '',
        params: {
          enterDuration: '300ms',
          leaveDuration: '200ms'
        }
      }"
    >
      <!-- Floating decorative elements -->
      <div
        class="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#D8EAE5] opacity-20 animate-float-slow"
      ></div>
      <div
        class="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[#013E4C] opacity-10 animate-float-medium"
      ></div>
      <div
        class="absolute top-1/4 -left-16 w-32 h-32 rounded-full bg-[#1C6956] opacity-15 animate-float-fast"
      ></div>

      <!-- Dialog header -->
      <div class="relative z-10 mb-8">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-[#013E4C] mb-1">
              Nova Conta Bancária
            </h2>
            <p class="text-[#5e6d72] text-sm">
              Adicione uma nova conta para gerenciar suas finanças
            </p>
          </div>
          <button
            mat-icon-button
            (click)="onCancel()"
            class="text-[#748389] hover:text-[#013E4C] transition-colors duration-300 hover:bg-[#D8EAE5]/30 rounded-full p-1"
            aria-label="Fechar dialog"
            [disabled]="isSaving"
          >
            <mat-icon class="transform hover:rotate-90 transition-transform"
              >close</mat-icon
            >
          </button>
        </div>
      </div>

      <!-- Main form content -->
      <form
        [formGroup]="contaForm"
        (ngSubmit)="onSubmit()"
        class="relative z-10 space-y-6"
        [@contentAnimation]
      >
        <!-- Bank name field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label class="block text-sm font-medium text-[#5e6d72] mb-2 ml-1">
              Nome do Banco *
            </label>
            <div class="relative">
              <input
                type="text"
                formControlName="banco"
                (blur)="contaForm.get('banco')?.markAsTouched()"
                placeholder="Ex: Banco do Brasil, Nubank..."
                class="w-full px-4 py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60"
                [class.border-[#1C6956]]="
                  contaForm.get('banco')?.valid && contaForm.get('banco')?.dirty
                "
                [class.border-red-300]="
                  contaForm.get('banco')?.invalid &&
                  contaForm.get('banco')?.touched
                "
              />
            </div>
            @if (contaForm.get('banco')?.invalid &&
            contaForm.get('banco')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-sm">error</mat-icon>
              <span>
                @if (contaForm.get('banco')?.hasError('required')) { Campo
                obrigatório } @else if
                (contaForm.get('banco')?.hasError('minlength')) { Mínimo 3
                caracteres }
              </span>
            </div>
            }
          </div>
        </div>

        <!-- Initial balance field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label class="block text-sm font-medium text-[#5e6d72] mb-2 ml-1">
              Saldo Inicial *
            </label>
            <div class="relative">
              <input
                type="number"
                formControlName="saldo"
                (blur)="contaForm.get('saldo')?.markAsTouched()"
                placeholder="0,00"
                step="0.01"
                class="w-full px-4 py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60"
                [class.border-[#1C6956]]="
                  contaForm.get('saldo')?.valid && contaForm.get('saldo')?.dirty
                "
                [class.border-red-300]="
                  contaForm.get('saldo')?.invalid &&
                  contaForm.get('saldo')?.touched
                "
              />
            </div>
            @if (contaForm.get('saldo')?.invalid &&
            contaForm.get('saldo')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-sm">error</mat-icon>
              <span>
                @if (contaForm.get('salco')?.hasError('required')) { Campo
                obrigatório } @else if (contaForm.get('saldo')?.hasError('min'))
                { O valor não pode ser negativo }
              </span>
            </div>
            }
          </div>
        </div>

        <!-- Bank icon selector -->
        <div [@formFieldAnimation]>
          <div
            class="flex justify-between items-center cursor-pointer group"
            (click)="toggleIconPicker()"
          >
            <label
              class="block text-sm font-medium text-[#5e6d72] ml-1 group-hover:text-[#013E4C] transition-colors"
            >
              Selecione o Banco *
            </label>
            <mat-icon
              class="text-[#748389] transform transition-transform duration-300 group-hover:text-[#013E4C]"
              [class.rotate-180]="showIconPicker"
            >
              expand_more
            </mat-icon>
          </div>

          @if (showIconPicker) {
          <div
            class="mt-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#E0E5E7] shadow-lg"
            [@iconsAnimation]
          >
            <div class="grid grid-cols-4 gap-4">
              @for (icon of bankIcons | keyvalue; track icon.key) {
              <button
                type="button"
                (click)="selectBank(icon.key)"
                class="group relative p-4 rounded-xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden"
                [class]="
                  selectedBank === icon.key
                    ? 'bg-gradient-to-br from-[#D8EAE5] to-[#1C6956]/20 border-2 border-[#1C6956] shadow-lg scale-105'
                    : 'bg-white/90 border border-[#E0E5E7] hover:border-[#748389] hover:shadow-md hover:scale-105'
                "
              >
                <div
                  class="w-16 h-16 mb-3 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110"
                >
                  <img
                    [src]="icon.value.icon"
                    [alt]="icon.value.name"
                    class="h-full w-full object-contain drop-shadow-md rounded-4xl"
                  />
                </div>
                <span
                  class="text-sm font-medium text-[#5e6d72] group-hover:text-[#013E4C] transition-colors"
                >
                  {{ icon.value.name }}
                </span>
                @if (selectedBank === icon.key) {
                <div
                  class="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1C6956] flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110"
                  title="Confirmado"
                >
                  <mat-icon class="text-white text-sm">check</mat-icon>
                </div>

                }
              </button>
              }
            </div>
          </div>
          }
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end space-x-3 pt-6" [@buttonsAnimation]>
          <button
            type="button"
            (click)="onCancel()"
            class="px-6 py-2.5 rounded-xl border border-[#E0E5E7] text-[#5e6d72] hover:text-[#013E4C] hover:border-[#748389] transition-all duration-300 font-medium flex items-center"
            [disabled]="isSaving"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1C6956] to-[#013E4C] text-white hover:shadow-lg transition-all duration-300 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="!contaForm.valid || !selectedBank || isSaving"
          >
            @if (isSaving) {
            <mat-spinner
              diameter="20"
              class="mr-2"
              [@spinnerAnimation]
            ></mat-spinner>
            <span class="animate-pulse">Salvando...</span>
            } @else {
            <mat-icon class="mr-2">account_balance</mat-icon>
            Criar Conta }
          </button>
        </div>
      </form>

      <!-- Success state -->
      @if (showSuccess) {
      <div
        class="absolute inset-0 bg-[#F8F7F5]/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20"
        [@successAnimation]
      >
        <div class="relative">
          <div
            class="w-24 h-24 bg-[#D8EAE5] rounded-full flex items-center justify-center mb-6"
          >
            <div class="w-16 h-16 flex items-center justify-center">
              <img
                [src]="'assets/banks/' + selectedBank?.icon.key + '.png'"
                alt="Bank icon"
                class="h-full w-full object-contain"
              />
            </div>
          </div>
          <div
            class="absolute -inset-4 rounded-full border-4 border-[#D8EAE5] animate-ping opacity-0"
          ></div>
        </div>
        <h3 class="text-xl font-bold text-[#013E4C] mb-2 text-center">
          Conta criada com sucesso!
        </h3>
        <p class="text-[#5e6d72] text-center mb-6 max-w-xs">
          Sua nova conta {{ selectedBank?.name }} foi adicionada com saldo
          inicial de {{ contaForm.value.saldo | currency : 'BRL' }}.
        </p>
        <button
          mat-raised-button
          color="primary"
          (click)="dialogRef.close(true)"
          class="px-6 py-2.5 bg-[#1C6956] text-white hover:bg-[#013E4C] rounded-xl font-medium"
        >
          Continuar
        </button>
      </div>
      }
    </div>
  `,
  styles: [
    `
      /* Custom animations */
      .animate-float-slow {
        animation: float 8s ease-in-out infinite;
      }
      .animate-float-medium {
        animation: float 6s ease-in-out infinite;
        animation-delay: 0.5s;
      }
      .animate-float-fast {
        animation: float 4s ease-in-out infinite;
        animation-delay: 1s;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0) translateX(0);
        }
        50% {
          transform: translateY(-20px) translateX(10px);
        }
      }
    `,
  ],
  animations: [
    // Dialog container animation
    trigger('dialogContainer', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }),
        animate(
          '{{enterDuration}} ease-out',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '{{leaveDuration}} ease-in',
          style({ opacity: 0, transform: 'scale(0.95) translateY(-20px)' })
        ),
      ]),
    ]),

    // Content animation
    trigger('contentAnimation', [
      transition(':enter', [
        query('@formFieldAnimation', stagger('50ms', animateChild())),
      ]),
    ]),

    // Form field animation
    trigger('formFieldAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate(
          '300ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),

    // Icons animation
    trigger('iconsAnimation', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, height: 0 })),
      ]),
    ]),

    // Buttons animation
    trigger('buttonsAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '300ms 150ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),

    // Spinner animation
    trigger('spinnerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),

    // Success animation
    trigger('successAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class NovaContaDialogComponent {
  isSaving = false;
  showSuccess = false;
  showIconPicker = false;
  accountType: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' = 'CHECKING';
  selectedBank: any = null;

  // Professional bank options with high-quality icons
  bankIcons: Record<string, { icon: string; name: string }> = {
    NUBANK: { icon: 'assets/iconbank/nubank.png', name: 'Nubank' },
    INTER: { icon: 'assets/iconbank/inter.png', name: 'Inter' },
    CAIXA: { icon: 'assets/iconbank/caixa.png', name: 'Caixa' },
    ITAU: { icon: 'assets/iconbank/itau.png', name: 'Itaú' },
    SANTANDER: { icon: 'assets/iconbank/santander.png', name: 'Santander' },
    BRADESCO: { icon: 'assets/iconbank/bradesco.png', name: 'Bradesco' },
    BANCO_DO_BRASIL: {
      icon: 'assets/iconbank/bb.png',
      name: 'BB',
    },
    OUTROS: { icon: 'assets/iconbank/outros.png', name: 'Outros' },
  };

  // Form group for account data
  contaForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NovaContaDialogComponent>,
    private contaService: ContaService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.contaForm = this.fb.group({
      banco: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
      saldo: [0, [Validators.required, Validators.min(0)]],
    });
  }

  // Select bank
  selectBank(bankKey: string): void {
    const bank = this.bankIcons[bankKey];
    this.selectedBank = bankKey;
    this.contaForm.patchValue({ banco: bank.name });
  }

  // Select account type
  selectAccountType(type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT'): void {
    this.accountType = type;
  }

  // Toggle icon picker visibility
  toggleIconPicker(): void {
    this.showIconPicker = !this.showIconPicker;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.contaForm.invalid || !this.selectedBank || this.isSaving) return;

    this.isSaving = true;
    const contaDTO: ContaCadastroDTO = {
      banco: this.contaForm.value.banco,
      bancoTipo: this.selectedBank,
      saldo: this.contaForm.value.saldo!,
    };

    this.contaService
      .cadastrarConta(contaDTO)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.showSuccess = true;
        },
        error: (err) => {
          this.toastr.error('Erro ao criar conta. Por favor, tente novamente.');
        },
      });
  }

  // Close dialog without saving
  onCancel(): void {
    if (!this.isSaving) {
      this.dialogRef.close(false);
    }
  }
}
