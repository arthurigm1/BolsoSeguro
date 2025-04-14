import { Component, Inject, HostBinding } from '@angular/core';
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
import { CategoriaService } from '../../Services/CategoriaService/categoria.service';
import { ToastrService } from 'ngx-toastr';
import { CategoriaDTO } from '../../Interface/CategoriaDTO.interface';
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
  selector: 'app-nova-categoria-dialog',
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
              {{ dialogTitle }}
            </h2>
            <p class="text-[#5e6d72] text-sm">
              Organize suas finanças com categorias personalizadas
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
      <div class="relative z-10 space-y-6" [@contentAnimation]>
        <!-- Category name field -->
        <div [@formFieldAnimation]>
          <div class="relative">
            <label class="block text-sm font-medium text-[#5e6d72] mb-2 ml-1">
              Nome da Categoria
            </label>
            <div class="relative">
              <input
                type="text"
                formControlName="nome"
                placeholder="Ex: Alimentação, Transporte..."
                class="w-full px-4 py-3 bg-white/90 border border-[#E0E5E7] rounded-xl focus:ring-2 focus:ring-[#1C6956] focus:border-transparent shadow-sm transition-all duration-300 placeholder-[#748389]/60"
                [class.border-[#1C6956]]="
                  categoriaForm.get('nome')?.valid &&
                  categoriaForm.get('nome')?.dirty
                "
                [class.border-red-300]="
                  categoriaForm.get('nome')?.invalid &&
                  categoriaForm.get('nome')?.touched
                "
              />
            </div>
            @if (categoriaForm.get('nome')?.invalid &&
            categoriaForm.get('nome')?.touched) {
            <div
              class="mt-1 ml-1 text-red-500 text-xs flex items-center space-x-1"
            >
              <mat-icon class="text-sm">error</mat-icon>
              <span>
                @if (categoriaForm.get('nome')?.hasError('required')) { Campo
                obrigatório } @else if
                (categoriaForm.get('nome')?.hasError('minlength')) { Mínimo 3
                caracteres }
              </span>
            </div>
            }
          </div>
        </div>

        <!-- Category type selector -->
        <div [@formFieldAnimation]>
          <label class="block text-sm font-medium text-[#5e6d72] mb-2 ml-1">
            Tipo de Categoria
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              (click)="data.tipo = 'expense'"
              class="p-4 rounded-xl border transition-all duration-300 flex items-center justify-center space-x-2"
              [class]="
                data.tipo === 'expense'
                  ? 'bg-[#D8EAE5] border-[#1C6956] text-[#013E4C] shadow-inner'
                  : 'bg-white/90 border-[#E0E5E7] hover:border-[#748389] text-[#5e6d72]'
              "
              [disabled]="isSaving"
            >
              <mat-icon class="text-[#1C6956]">trending_down</mat-icon>
              <span>Despesa</span>
            </button>
            <button
              type="button"
              (click)="data.tipo = 'income'"
              class="p-4 rounded-xl border transition-all duration-300 flex items-center justify-center space-x-2"
              [class]="
                data.tipo === 'income'
                  ? 'bg-[#D8EAE5] border-[#1C6956] text-[#013E4C] shadow-inner'
                  : 'bg-white/90 border-[#E0E5E7] hover:border-[#748389] text-[#5e6d72]'
              "
              [disabled]="isSaving"
            >
              <mat-icon class="text-[#1C6956]">trending_up</mat-icon>
              <span>Receita</span>
            </button>
          </div>
        </div>

        <!-- Icon selector (collapsible) -->
        <div [@formFieldAnimation]>
          <div
            class="flex justify-between items-center cursor-pointer"
            (click)="toggleIconPicker()"
          >
            <label class="block text-sm font-medium text-[#5e6d72] ml-1">
              Ícone da Categoria (opcional)
            </label>
            <mat-icon
              class="text-[#748389] transform transition-transform duration-300"
              [class.rotate-180]="showIconPicker"
            >
              expand_more
            </mat-icon>
          </div>

          @if (showIconPicker) {
          <div class="mt-3 grid grid-cols-6 gap-2" [@iconsAnimation]>
            @for (icon of icons; track icon) {
            <button
              type="button"
              (click)="selectedIcon = icon"
              class="p-2 rounded-xl transition-all duration-200 flex items-center justify-center"
              [class]="
                selectedIcon === icon
                  ? 'bg-[#1C6956] text-white shadow-md'
                  : 'bg-white/90 hover:bg-[#D8EAE5] text-[#5e6d72]'
              "
            >
              <mat-icon class="text-lg">{{ icon }}</mat-icon>
            </button>
            }
          </div>
          }
        </div>
      </div>

      <!-- Action buttons -->
      <div
        class="relative z-10 mt-8 flex justify-end space-x-3"
        [@buttonsAnimation]
      >
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
          class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1C6956] to-[#013E4C] text-white hover:shadow-lg transition-all duration-300 font-medium flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
          [disabled]="categoriaForm.invalid || isSaving"
          [class.opacity-70]="isSaving"
        >
          @if (isSaving) {
          <mat-spinner
            diameter="20"
            class="mr-2"
            [@spinnerAnimation]
          ></mat-spinner>
          <span class="animate-pulse">Criando...</span>
          } @else {
          <mat-icon class="mr-2 transform hover:scale-110 transition-transform"
            >add_circle</mat-icon
          >
          Criar Categoria }
        </button>
      </div>

      <!-- Success state -->
      @if (showSuccess) {
      <div
        class="absolute inset-0 bg-[#F8F7F5]/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20"
        [@successAnimation]
      >
        <div class="relative">
          <div
            class="w-24 h-24 bg-[#D8EAE5] rounded-full flex items-center justify-center mb-6 animate-bounce"
          >
            <mat-icon class="text-[#1C6956] text-5xl">check_circle</mat-icon>
          </div>
          <div
            class="absolute -inset-4 rounded-full border-4 border-[#D8EAE5] animate-ping opacity-0"
          ></div>
        </div>
        <h3 class="text-xl font-bold text-[#013E4C] mb-2 text-center">
          Categoria criada com sucesso!
        </h3>
        <p class="text-[#5e6d72] text-center mb-6 max-w-xs">
          Sua nova categoria foi adicionada e já está disponível para uso.
        </p>
        <button
          mat-raised-button
          color="primary"
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
export class NovaCategoriaDialogComponent {
  isSaving = false;
  showSuccess = false;
  showIconPicker = false;
  selectedIcon = 'shopping_cart';

  // Available icons for selection
  icons = [
    'shopping_cart',
    'restaurant',
    'home',
    'directions_car',
    'local_gas_station',
    'fitness_center',
    'medical_services',
    'school',
    'flight',
    'credit_card',
    'savings',
    'work',
    'redeem',
    'subscriptions',
    'wifi',
    'water_drop',
    'lightbulb',
    'phone_iphone',
    'laptop',
    'theaters',
  ];

  // Form group for category data
  categoriaForm: FormGroup;

  // Computed dialog title based on category type
  get dialogTitle(): string {
    return this.data.tipo === 'expense'
      ? 'Nova Categoria de Despesa'
      : 'Nova Categoria de Receita';
  }

  constructor(
    private dialogRef: MatDialogRef<NovaCategoriaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tipo: 'expense' | 'income' },
    private categoriaService: CategoriaService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.categoriaForm = this.fb.group({
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
    });
  }

  // Toggle icon picker visibility
  toggleIconPicker(): void {
    this.showIconPicker = !this.showIconPicker;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.categoriaForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const categoriaDTO: CategoriaDTO = {
      nome: this.categoriaForm.value.nome!.trim(),
      tipo: this.data.tipo === 'expense' ? 'DESPESA' : 'RECEITA',
    };

    this.categoriaService
      .criarCategoria(categoriaDTO)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.showSuccess = true;
        },
        error: (err) => {
          console.error('Erro ao criar categoria:', err);
          this.toastr.error(
            'Erro ao criar categoria. Por favor, tente novamente.',
            'Erro',
            {
              positionClass: 'toast-bottom-right',
              toastClass: 'bg-red-50 text-red-700 border border-red-200',
            }
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
