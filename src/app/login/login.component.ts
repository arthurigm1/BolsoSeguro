import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { LoginService } from '../Services/UserService/login.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

interface LoginForm {
  email: FormControl;
  senha: FormControl;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm!: FormGroup<LoginForm>;

  constructor(
    private loginService: LoginService,
    private toastService: ToastrService,
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      senha: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }
  ngOnInit(): void {
    // Verifica o token assim que o componente for carregado
    if (this.loginService.checkToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

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
