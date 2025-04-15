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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  selector: 'app-edit-card-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
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
              Editar Cartão de Crédito
            </h2>
            <p class="text-[#5e6d72] text-xs sm:text-sm">
              Atualize as informações do seu cartão
            </p>
          </div>
          <button
            mat-icon-button
            (click)="onCancel()"
            class="cursor-pointer text-[#748389] hover:text-[#013E4C] transition-colors duration-300 hover:bg-[#D8EAE5]/30 rounded-full p-1"
            aria-label="Fechar dialog"
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
        [formGroup]="editForm"
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
                formControlName="nomeCartao"
                (blur)="editForm.get('nomeCartao')?.markAsTouched()"
                placeholder="Ex: Cartão Principal"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60 text-sm sm:text-base"
                [class.border-[#1C6956]]="
                  editForm.get('nomeCartao')?.valid &&
                  editForm.get('nomeCartao')?.dirty
                "
                [class.border-red-300]="
                  editForm.get('nomeCartao')?.invalid &&
                  editForm.get('nomeCartao')?.touched
                "
              />
            </div>
            @if (editForm.get('nomeCartao')?.invalid &&
            editForm.get('nomeCartao')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-xs sm:text-sm">error</mat-icon>
              <span>
                @if (editForm.get('nomeCartao')?.hasError('required')) { Campo
                obrigatório } @else if
                (editForm.get('nomeCartao')?.hasError('minlength')) { Mínimo 3
                caracteres }
              </span>
            </div>
            }
          </div>
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
                (blur)="editForm.get('limiteTotal')?.markAsTouched()"
                placeholder="0,00"
                step="0.01"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60 text-sm sm:text-base"
                [class.border-[#1C6956]]="
                  editForm.get('limiteTotal')?.valid &&
                  editForm.get('limiteTotal')?.dirty
                "
                [class.border-red-300]="
                  editForm.get('limiteTotal')?.invalid &&
                  editForm.get('limiteTotal')?.touched
                "
              />
            </div>
            @if (editForm.get('limiteTotal')?.invalid &&
            editForm.get('limiteTotal')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-xs sm:text-sm">error</mat-icon>
              <span>
                @if (editForm.get('limiteTotal')?.hasError('required')) { Campo
                obrigatório } @else if
                (editForm.get('limiteTotal')?.hasError('min')) { O valor não
                pode ser negativo }
              </span>
            </div>
            }
          </div>
        </div>

        <!-- Available limit field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label
              class="block text-xs sm:text-sm font-medium text-[#5e6d72] mb-1 sm:mb-2 ml-1"
            >
              Limite Disponível *
            </label>
            <div class="relative">
              <input
                type="number"
                formControlName="limiteDisponivel"
                (blur)="editForm.get('limiteDisponivel')?.markAsTouched()"
                placeholder="0,00"
                step="0.01"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60 text-sm sm:text-base"
                [class.border-[#1C6956]]="
                  editForm.get('limiteDisponivel')?.valid &&
                  editForm.get('limiteDisponivel')?.dirty
                "
                [class.border-red-300]="
                  editForm.get('limiteDisponivel')?.invalid &&
                  editForm.get('limiteDisponivel')?.touched
                "
              />
            </div>
            @if (editForm.get('limiteDisponivel')?.invalid &&
            editForm.get('limiteDisponivel')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-xs sm:text-sm">error</mat-icon>
              <span>
                @if (editForm.get('limiteDisponivel')?.hasError('required')) {
                Campo obrigatório } @else if
                (editForm.get('limiteDisponivel')?.hasError('min')) { O valor
                não pode ser negativo }
              </span>
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
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="save()"
            class="cursor-pointer w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#1C6956] to-[#013E4C] text-white hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            [disabled]="editForm.invalid"
          >
            <mat-icon class="mr-2 text-base sm:text-lg">save</mat-icon>
            Salvar Alterações
          </button>
        </div>
      </form>
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
  ],
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
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
