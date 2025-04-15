import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartaoService } from '../../Services/CartaoService/cartao.service';
import { ToastrService } from 'ngx-toastr';
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
  selector: 'app-novo-cartao-dialog',
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
      class="relative p-4 sm:p-8 bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
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
        class="absolute -top-16 sm:-top-32 -right-16 sm:-right-32 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-[#D8EAE5] opacity-20 animate-float-slow"
      ></div>
      <div
        class="absolute -bottom-12 sm:-bottom-24 -left-12 sm:-left-24 w-24 h-24 sm:w-48 sm:h-48 rounded-full bg-[#013E4C] opacity-10 animate-float-medium"
      ></div>
      <div
        class="absolute top-1/4 -left-8 sm:-left-16 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-[#1C6956] opacity-15 animate-float-fast"
      ></div>

      <!-- Dialog header -->
      <div class="relative z-10 mb-4 sm:mb-8">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-[#013E4C] mb-1">
              Novo Cartão de Crédito
            </h2>
            <p class="text-[#5e6d72] text-xs sm:text-sm">
              Adicione um novo cartão para gerenciar seus gastos
            </p>
          </div>
          <button
            mat-icon-button
            (click)="onCancel()"
            class="cursor-pointer text-[#748389] hover:text-[#013E4C] transition-colors duration-300 hover:bg-[#D8EAE5]/30 rounded-full p-1"
            aria-label="Fechar dialog"
            [disabled]="isSaving"
          >
            <mat-icon
              class="transform hover:rotate-90 transition-transform text-base sm:text-lg"
              >close</mat-icon
            >
          </button>
        </div>
      </div>

      <!-- Main form content -->
      <form
        [formGroup]="cartaoForm"
        (ngSubmit)="onSubmit()"
        class="relative z-10 space-y-4 sm:space-y-6"
        [@contentAnimation]
      >
        <!-- Card name field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label
              class="block text-xs sm:text-sm font-medium text-[#5e6d72] mb-1 sm:mb-2 ml-1"
            >
              Nome do Cartão *
            </label>
            <div class="relative">
              <input
                type="text"
                formControlName="nome"
                (blur)="cartaoForm.get('nome')?.markAsTouched()"
                placeholder="Ex: Cartão Principal"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60 text-sm sm:text-base"
                [class.border-[#1C6956]]="
                  cartaoForm.get('nome')?.valid && cartaoForm.get('nome')?.dirty
                "
                [class.border-red-300]="
                  cartaoForm.get('nome')?.invalid &&
                  cartaoForm.get('nome')?.touched
                "
              />
            </div>
            @if (cartaoForm.get('nome')?.invalid &&
            cartaoForm.get('nome')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-xs sm:text-sm">error</mat-icon>
              <span>
                @if (cartaoForm.get('nome')?.hasError('required')) { Campo
                obrigatório } @else if
                (cartaoForm.get('nome')?.hasError('minlength')) { Mínimo 3
                caracteres }
              </span>
            </div>
            }
          </div>
        </div>

        <!-- Card brand selector -->
        <div [@formFieldAnimation]>
          <div
            class="flex justify-between items-center cursor-pointer group"
            (click)="toggleBrandPicker()"
          >
            <label
              class="block text-xs sm:text-sm font-medium text-[#5e6d72] ml-1 group-hover:text-[#013E4C] transition-colors"
            >
              Bandeira do Cartão *
            </label>
            <mat-icon
              class="text-[#748389] transform transition-transform duration-300 group-hover:text-[#013E4C] text-base sm:text-lg"
              [class.rotate-180]="showBrandPicker"
            >
              expand_more
            </mat-icon>
          </div>

          @if (showBrandPicker) {
          <div
            class="mt-3 sm:mt-4 p-3 sm:p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#E0E5E7] shadow-lg"
            [@iconsAnimation]
          >
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              @for (brand of cardBrands | keyvalue; track brand.key) {
              <button
                type="button"
                (click)="selectBrand(brand.key)"
                class="cursor-pointer group relative p-3 sm:p-4 rounded-xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden"
                [class]="
                  selectedBrand === brand.key
                    ? 'bg-gradient-to-br from-[#D8EAE5] to-[#1C6956]/20 border-2 border-[#1C6956] shadow-lg scale-105'
                    : 'bg-white/90 border border-[#E0E5E7] hover:border-[#748389] hover:shadow-md hover:scale-105'
                "
              >
                <div
                  class="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110"
                >
                  <img
                    [src]="brand.value.icon"
                    [alt]="brand.value.name"
                    class="h-full w-full object-contain drop-shadow-md rounded-4xl"
                  />
                </div>
                <span
                  class="text-xs sm:text-sm font-medium text-[#5e6d72] group-hover:text-[#013E4C] transition-colors"
                >
                  {{ brand.value.name }}
                </span>
                @if (selectedBrand === brand.key) {
                <div
                  class="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#1C6956] flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110"
                  title="Selecionado"
                >
                  <mat-icon class="text-white text-xs sm:text-sm"
                    >check</mat-icon
                  >
                </div>
                }
              </button>
              }
            </div>
          </div>
          }
        </div>

        <!-- Credit limit field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label
              class="block text-xs sm:text-sm font-medium text-[#5e6d72] mb-1 sm:mb-2 ml-1"
            >
              Limite Total *
            </label>
            <div class="relative">
              <input
                type="number"
                formControlName="limiteTotal"
                (blur)="cartaoForm.get('limiteTotal')?.markAsTouched()"
                placeholder="0,00"
                step="0.01"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60 text-sm sm:text-base"
                [class.border-[#1C6956]]="
                  cartaoForm.get('limiteTotal')?.valid &&
                  cartaoForm.get('limiteTotal')?.dirty
                "
                [class.border-red-300]="
                  cartaoForm.get('limiteTotal')?.invalid &&
                  cartaoForm.get('limiteTotal')?.touched
                "
              />
            </div>
            @if (cartaoForm.get('limiteTotal')?.invalid &&
            cartaoForm.get('limiteTotal')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-xs sm:text-sm">error</mat-icon>
              <span>
                @if (cartaoForm.get('limiteTotal')?.hasError('required')) {
                Campo obrigatório } @else if
                (cartaoForm.get('limiteTotal')?.hasError('min')) { O valor não
                pode ser negativo }
              </span>
            </div>
            }
          </div>
        </div>

        <!-- Due date field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label
              class="block text-xs sm:text-sm font-medium text-[#5e6d72] mb-1 sm:mb-2 ml-1"
            >
              Dia do Vencimento *
            </label>
            <div class="relative">
              <input
                type="number"
                formControlName="vencimentoFatura"
                (blur)="cartaoForm.get('vencimentoFatura')?.markAsTouched()"
                placeholder="1-31"
                min="1"
                max="31"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60 text-sm sm:text-base"
                [class.border-[#1C6956]]="
                  cartaoForm.get('vencimentoFatura')?.valid &&
                  cartaoForm.get('vencimentoFatura')?.dirty
                "
                [class.border-red-300]="
                  cartaoForm.get('vencimentoFatura')?.invalid &&
                  cartaoForm.get('vencimentoFatura')?.touched
                "
              />
            </div>
            @if (cartaoForm.get('vencimentoFatura')?.invalid &&
            cartaoForm.get('vencimentoFatura')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-xs sm:text-sm">error</mat-icon>
              <span> Dia de vencimento inválido (1-31) </span>
            </div>
            }
          </div>
        </div>

        <!-- Closing date field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label
              class="block text-xs sm:text-sm font-medium text-[#5e6d72] mb-1 sm:mb-2 ml-1"
            >
              Dia do Fechamento *
            </label>
            <div class="relative">
              <input
                type="number"
                formControlName="diaFechamentoFatura"
                (blur)="cartaoForm.get('diaFechamentoFatura')?.markAsTouched()"
                placeholder="1-31"
                min="1"
                max="31"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60 text-sm sm:text-base"
                [class.border-[#1C6956]]="
                  cartaoForm.get('diaFechamentoFatura')?.valid &&
                  cartaoForm.get('diaFechamentoFatura')?.dirty
                "
                [class.border-red-300]="
                  cartaoForm.get('diaFechamentoFatura')?.invalid &&
                  cartaoForm.get('diaFechamentoFatura')?.touched
                "
              />
            </div>
            @if (cartaoForm.get('diaFechamentoFatura')?.invalid &&
            cartaoForm.get('diaFechamentoFatura')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-xs sm:text-sm">error</mat-icon>
              <span> Dia de fechamento inválido (1-31) </span>
            </div>
            }
          </div>
        </div>

        <!-- Action buttons -->
        <div
          class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6"
          [@buttonsAnimation]
        >
          <button
            type="button"
            (click)="onCancel()"
            class="cursor-pointer w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl border border-[#E0E5E7] text-[#5e6d72] hover:text-[#013E4C] hover:border-[#748389] transition-all duration-300 font-medium flex items-center justify-center text-sm sm:text-base"
            [disabled]="isSaving"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="cursor-pointer w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#1C6956] to-[#013E4C] text-white hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            [disabled]="!cartaoForm.valid || !selectedBrand || isSaving"
          >
            @if (isSaving) {
            <mat-spinner
              diameter="16"
              class="mr-2"
              [@spinnerAnimation]
            ></mat-spinner>
            <span class="animate-pulse">Salvando...</span>
            } @else {
            <mat-icon class="mr-2 text-base sm:text-lg">credit_card</mat-icon>
            Adicionar Cartão }
          </button>
        </div>
      </form>

      <!-- Success state -->
      @if (showSuccess) {
      <div
        class="absolute inset-0 bg-[#F8F7F5]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8 z-20"
        [@successAnimation]
      >
        <div class="relative">
          <div
            class="w-16 h-16 sm:w-24 sm:h-24 bg-[#D8EAE5] rounded-full flex items-center justify-center mb-4 sm:mb-6"
          >
            <div
              class="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center"
            >
              <img
                [src]="selectedBrand ? cardBrands[selectedBrand]?.icon : ''"
                [alt]="selectedBrand ? cardBrands[selectedBrand]?.name : ''"
                class="h-full w-full object-contain rounded-full"
              />
            </div>
          </div>
          <div
            class="absolute -inset-2 sm:-inset-4 rounded-full border-4 border-[#D8EAE5] animate-ping opacity-0"
          ></div>
        </div>
        <h3
          class="text-lg sm:text-xl font-bold text-[#013E4C] mb-2 text-center"
        >
          Cartão adicionado com sucesso!
        </h3>
        <p
          class="text-[#5e6d72] text-center mb-4 sm:mb-6 max-w-xs text-sm sm:text-base"
        >
          Seu novo cartão {{ cartaoForm.value.nome }} foi cadastrado com limite
          de {{ cartaoForm.value.limiteTotal | currency : 'BRL' }}.
        </p>
        <button
          mat-raised-button
          color="primary"
          (click)="dialogRef.close(true)"
          class="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#1C6956] text-white hover:bg-[#013E4C] rounded-xl font-medium text-sm sm:text-base"
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
export class NovoCartaoDialogComponent {
  isSaving = false;
  showSuccess = false;
  showBrandPicker = false;
  selectedBrand: string | null = null;

  // Card brands with icons
  cardBrands: Record<string, { icon: string; name: string }> = {
    VISA: { icon: 'assets/img/visa.png', name: 'Visa' },
    MASTERCARD: { icon: 'assets/img/mastercard.png', name: 'Mastercard' },

    OUTROS: { icon: 'assets/img/outroscard.png', name: 'Outros' },
  };

  // Form group for card data
  cartaoForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NovoCartaoDialogComponent>,
    private cartaoService: CartaoService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.cartaoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      bandeira: ['', Validators.required],
      limiteTotal: [0, [Validators.required, Validators.min(0)]],
      vencimentoFatura: [
        null,
        [Validators.required, Validators.min(1), Validators.max(31)],
      ],
      diaFechamentoFatura: [
        null,
        [Validators.required, Validators.min(1), Validators.max(31)],
      ],
    });
  }

  // Select card brand
  selectBrand(brandKey: string): void {
    this.selectedBrand = brandKey;
    this.cartaoForm.patchValue({ bandeira: brandKey });
    this.showBrandPicker = false;
  }

  // Toggle brand picker visibility
  toggleBrandPicker(): void {
    this.showBrandPicker = !this.showBrandPicker;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.cartaoForm.invalid || !this.selectedBrand || this.isSaving) return;

    this.isSaving = true;
    this.cartaoService
      .criarCartao(this.cartaoForm.value)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.showSuccess = true;
        },
        error: (error) => {
          this.toastr.error(
            'Erro ao criar cartão. Por favor, tente novamente.'
          );
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
