import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../Services/UserService/login.service';
import { Router } from '@angular/router';
import {
  animate,
  animation,
  state,
  style,
  transition,
  trigger,
  query,
  stagger,
} from '@angular/animations';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
  animations: [
    // Animação de entrada da página
    trigger('pageAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(-20px)',
        }),
        animate(
          '800ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({
            opacity: 1,
            transform: 'translateX(0)',
          })
        ),
      ]),
    ]),

    // Animação para o formulário
    trigger('formAnimation', [
      transition(':enter', [
        query(
          '.form-field',
          [
            style({
              opacity: 0,
              transform: 'translateY(20px)',
            }),
            stagger(100, [
              animate(
                '500ms cubic-bezier(0.35, 0, 0.25, 1)',
                style({
                  opacity: 1,
                  transform: 'translateY(0)',
                })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),

    // Animação para mensagens
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),

    // Animação de entrada da rota
    trigger('routeAnimations', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        ),
      ]),
    ]),

    // Animação do card principal
    trigger('cardAnimation', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'scale(0.9) translateY(20px)',
        })
      ),
      transition(':enter', [
        animate(
          '500ms 200ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })
        ),
      ]),
    ]),

    // Animação de fade para mensagens
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),

    // Animação do modal de recuperação de senha
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-out', style({ opacity: 0 }))]),
    ]),

    // Animação de escala para o conteúdo do modal
    trigger('scaleInOut', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ transform: 'scale(0.95)', opacity: 0 })
        ),
      ]),
    ]),

    // Animação para os itens do formulário
    trigger('formItemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class RegistroComponent {
  cadastroForm!: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastrService,
    private authService: LoginService
  ) {}

  ngOnInit(): void {
    this.cadastroForm = this.fb.group(
      {
        nome: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        senha: ['', [Validators.required, Validators.minLength(6)]],
        confirmarSenha: ['', [Validators.required]],
      },
      { validators: this.validarSenhas }
    );
  }

  // Validador personalizado para confirmar senhas
  validarSenhas(group: AbstractControl): ValidationErrors | null {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { senhasDiferentes: true };
  }
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Adicione estes métodos
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  submit(): void {
    if (this.cadastroForm.valid) {
      const { nome, email, senha } = this.cadastroForm.value;
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.authService.signup(nome, email, senha).subscribe({
        next: (response) => {
          this.toastService.success(
            'Cadastro realizado com sucesso',
            'Sucesso'
          );
          this.successMessage = 'Conta criada com sucesso! Redirecionando...';
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.toastService.error('Revise seus campos');
          this.isSubmitting = false;
          this.errorMessage =
            error.error?.message ||
            'Erro ao criar conta. Por favor, tente novamente.';
        },
      });
    } else {
      this.toastService.error(
        'Por favor, preencha os campos corretamente',
        'Erro'
      );
    }
  }
}
