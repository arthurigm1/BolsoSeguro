import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { LoginService } from '../Services/UserService/login.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { th } from 'date-fns/locale';
import { animate, style, transition, trigger } from '@angular/animations';

interface LoginForm {
  email: FormControl;
  senha: FormControl;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ opacity: 0 }),
        animate('0.5s', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class LoginComponent {
  loginForm!: FormGroup<LoginForm>;

  showForgotPasswordModal = false;
  forgotPasswordMessage = '';
  forgotPasswordError = '';

  openForgotPasswordModal(event: Event) {
    event.preventDefault();
    this.forgotPasswordMessage = '';
    this.forgotPasswordError = '';
    this.showForgotPasswordModal = true;
  }
  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
  }
  forgotPasswordForm!: FormGroup;

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

  submitForgotPassword() {
    if (this.forgotPasswordForm.invalid) return;
    const email = this.forgotPasswordForm.value.email;
    this.isSendingEmail = true;
    this.forgotPasswordError = '';
    this.forgotPasswordMessage = '';

    this.loginService.forgotPassword(email).subscribe({
      next: (response) => {
        this.toastService.success('Email enviado com sucesso!');
        this.forgotPasswordMessage =
          'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.';
        this.isSendingEmail = false;
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
  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  ngOnInit(): void {
    // Verifica o token assim que o componente for carregado
    if (this.loginService.checkToken()) {
      this.router.navigate(['/dashboard']);
    }
  }
  isSendingEmail: boolean = false;
  submit() {
    this.loginService
      .login(this.loginForm.value.email, this.loginForm.value.senha)
      .subscribe({
        next: (response: any) => {
          this.toastService.success('Login efetuado com sucesso');
          this.router.navigate(['/dashboard']);
        },
        error: () => this.toastService.error('Senha ou Email Incorreto!'),
      });
  }
}
