import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { LoginService } from '../Services/UserService/login.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {
  animate,
  style,
  transition,
  trigger,
  query,
  stagger,
} from '@angular/animations';

interface LoginForm {
  email: FormControl;
  senha: FormControl;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    // Animação de entrada da página
    trigger('pageAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
        }),
        animate(
          '800ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({
            opacity: 1,
            transform: 'translateY(0)',
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

    // Animação de fade
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),

    // Animação de modal
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
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup<LoginForm>;
  forgotPasswordForm!: FormGroup;
  showPassword: boolean = false;
  showForgotPasswordModal: boolean = false;
  forgotPasswordEmail = '';
  forgotPasswordSuccess = false;
  forgotPasswordError = '';
  forgotPasswordMessage = '';
  isSendingEmail: boolean = false;
  isLoading: boolean = false;

  constructor(
    private loginService: LoginService,
    private toastService: ToastrService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      senha: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    // Verifica o token assim que o componente for carregado
    if (this.loginService.checkToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  openForgotPasswordModal(event: Event): void {
    event.preventDefault();
    this.forgotPasswordMessage = '';
    this.forgotPasswordError = '';
    this.showForgotPasswordModal = true;
  }

  closeForgotPasswordModal(): void {
    this.showForgotPasswordModal = false;
  }

  closeModal(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeForgotPasswordModal();
    }
  }

  submitForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) return;

    const email = this.forgotPasswordForm.value.email;
    this.isSendingEmail = true;
    this.forgotPasswordError = '';
    this.forgotPasswordMessage = '';

    this.loginService.forgotPassword(email).subscribe({
      next: () => {
        this.toastService.success('Email enviado com sucesso!');
        this.forgotPasswordMessage =
          'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.';
        this.isSendingEmail = false;
        this.closeForgotPasswordModal();
      },
      error: (error) => {
        this.toastService.error('Erro ao enviar email!');
        this.isSendingEmail = false;
        this.forgotPasswordError =
          error.error?.message ||
          'Erro ao enviar e-mail de recuperação. Tente novamente.';
      },
    });
  }

  submit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.loginService
      .login(this.loginForm.value.email, this.loginForm.value.senha)
      .subscribe({
        next: () => {
          this.toastService.success('Login efetuado com sucesso');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.toastService.error('Senha ou Email Incorreto!');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
}
