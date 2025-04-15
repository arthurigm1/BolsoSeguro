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
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MetaService } from '../../Services/MetaService/meta.service';
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
import { MetaFinanceiraResponseDTOComId } from '../../Interface/MetaFinanceiraResponseDTO.interface';

@Component({
  selector: 'app-nova-meta-dialog',
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
              Nova Meta Financeira
            </h2>
            <p class="text-[#5e6d72] text-sm">
              Defina uma nova meta para seu planejamento financeiro
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
        [formGroup]="metaForm"
        (ngSubmit)="onSubmit()"
        class="relative z-10 space-y-6"
        [@contentAnimation]
      >
        <!-- Meta name field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label class="block text-sm font-medium text-[#5e6d72] mb-2 ml-1">
              Nome da Meta *
            </label>
            <div class="relative">
              <input
                type="text"
                formControlName="nome"
                (blur)="metaForm.get('nome')?.markAsTouched()"
                placeholder="Ex: Reserva de Emergência"
                class="w-full px-4 py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60"
                [class.border-[#1C6956]]="
                  metaForm.get('nome')?.valid && metaForm.get('nome')?.dirty
                "
                [class.border-red-300]="
                  metaForm.get('nome')?.invalid && metaForm.get('nome')?.touched
                "
              />
            </div>
            @if (metaForm.get('nome')?.invalid && metaForm.get('nome')?.touched)
            {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-sm">error</mat-icon>
              <span>
                @if (metaForm.get('nome')?.hasError('required')) { Campo
                obrigatório } @else if
                (metaForm.get('nome')?.hasError('minlength')) { Mínimo 3
                caracteres }
              </span>
            </div>
            }
          </div>
        </div>

        <!-- Target value field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label class="block text-sm font-medium text-[#5e6d72] mb-2 ml-1">
              Valor da Meta *
            </label>
            <div class="relative">
              <input
                type="number"
                formControlName="valorMeta"
                (blur)="metaForm.get('valorMeta')?.markAsTouched()"
                placeholder="0,00"
                step="0.01"
                class="w-full px-4 py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60"
                [class.border-[#1C6956]]="
                  metaForm.get('valorMeta')?.valid &&
                  metaForm.get('valorMeta')?.dirty
                "
                [class.border-red-300]="
                  metaForm.get('valorMeta')?.invalid &&
                  metaForm.get('valorMeta')?.touched
                "
              />
            </div>
            @if (metaForm.get('valorMeta')?.invalid &&
            metaForm.get('valorMeta')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-sm">error</mat-icon>
              <span>
                @if (metaForm.get('valorMeta')?.hasError('required')) { Campo
                obrigatório } @else if
                (metaForm.get('valorMeta')?.hasError('min')) { O valor não pode
                ser negativo }
              </span>
            </div>
            }
          </div>
        </div>

        <!-- Current value field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label class="block text-sm font-medium text-[#5e6d72] mb-2 ml-1">
              Valor Atual
            </label>
            <div class="relative">
              <input
                type="number"
                formControlName="valorAtual"
                (blur)="metaForm.get('valorAtual')?.markAsTouched()"
                placeholder="0,00"
                step="0.01"
                class="w-full px-4 py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60"
                [class.border-[#1C6956]]="
                  metaForm.get('valorAtual')?.valid &&
                  metaForm.get('valorAtual')?.dirty
                "
                [class.border-red-300]="
                  metaForm.get('valorAtual')?.invalid &&
                  metaForm.get('valorAtual')?.touched
                "
              />
            </div>
            @if (metaForm.get('valorAtual')?.invalid &&
            metaForm.get('valorAtual')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-sm">error</mat-icon>
              <span> O valor não pode ser negativo </span>
            </div>
            }
          </div>
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
            [disabled]="!metaForm.valid || isSaving"
          >
            @if (isSaving) {
            <mat-spinner
              diameter="20"
              class="mr-2"
              [@spinnerAnimation]
            ></mat-spinner>
            <span class="animate-pulse">Salvando...</span>
            } @else {
            <mat-icon class="mr-2">add_circle</mat-icon>
            Adicionar Meta }
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
              <mat-icon class="text-[#1C6956] text-4xl">check_circle</mat-icon>
            </div>
          </div>
          <div
            class="absolute -inset-4 rounded-full border-4 border-[#D8EAE5] animate-ping opacity-0"
          ></div>
        </div>
        <h3 class="text-xl font-bold text-[#013E4C] mb-2 text-center">
          Meta adicionada com sucesso!
        </h3>
        <p class="text-[#5e6d72] text-center mb-6 max-w-xs">
          Sua meta {{ metaForm.value.nome }} foi cadastrada com valor de
          {{ metaForm.value.valorMeta | currency : 'BRL' }}.
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
export class NovaMetaDialogComponent {
  isSaving = false;
  showSuccess = false;
  isEditing = false;
  metaId: string | null = null;

  // Form group for meta data
  metaForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NovaMetaDialogComponent>,
    private metaService: MetaService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: MetaFinanceiraResponseDTOComId | null
  ) {
    this.isEditing = !!data;
    this.metaId = data?.id?.toString() || null;

    this.metaForm = this.fb.group({
      nome: [data?.nome || '', [Validators.required, Validators.minLength(3)]],
      valorMeta: [
        data?.valorMeta || 0,
        [Validators.required, Validators.min(0)],
      ],
      valorAtual: [data?.valorAtual || 0, [Validators.min(0)]],
    });
  }

  // Handle form submission
  onSubmit(): void {
    if (this.metaForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const metaData = this.metaForm.value;

    if (this.isEditing && this.metaId) {
      this.metaService
        .editarMeta(
          this.metaId,
          metaData.nome,
          metaData.valorMeta,
          metaData.valorAtual
        )
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: () => {
            this.showSuccess = true;
          },
          error: (error) => {
            this.toastr.error(
              'Erro ao atualizar meta. Por favor, tente novamente.'
            );
          },
        });
    } else {
      this.metaService
        .criarMeta(metaData)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: () => {
            this.showSuccess = true;
          },
          error: (error) => {
            this.toastr.error(
              'Erro ao criar meta. Por favor, tente novamente.'
            );
          },
        });
    }
  }

  // Close dialog without saving
  onCancel(): void {
    if (!this.isSaving) {
      this.dialogRef.close(false);
    }
  }
}
