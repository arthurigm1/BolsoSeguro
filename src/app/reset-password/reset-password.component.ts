import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../Services/UserService/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastrService,
    private fb: FormBuilder
  ) {
    this.resetForm = this.fb.group(
      {
        senha: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
            ),
          ],
        ],
        confirmarSenha: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.toastService.error('Token inválido ou expirado');
        this.router.navigate(['/login']);
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const senha = formGroup.get('senha')?.value;
    const confirmarSenha = formGroup.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { mismatch: true };
  }

  get senha() {
    return this.resetForm.get('senha');
  }
  get confirmarSenha() {
    return this.resetForm.get('confirmarSenha');
  }

  submit() {
    if (this.resetForm.invalid || !this.token) {
      this.toastService.error(
        'Por favor, preencha todos os campos corretamente'
      );
      return;
    }

    this.isLoading = true;
    this.loginService
      .resetPassword(this.token, this.resetForm.value.senha)
      .subscribe({
        next: (response) => {
          this.toastService.success(
            response.message || 'Senha redefinida com sucesso!'
          );
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage =
            error.error?.message ||
            error.error?.error ||
            'Erro ao redefinir a senha. Tente novamente mais tarde.';
          this.toastService.error(errorMessage);

          // Redireciona se o token for inválido ou expirado
          if (error.status === 400 && error.error?.error?.includes('Token')) {
            setTimeout(() => this.router.navigate(['/login']), 3000);
          }
        },
        complete: () => (this.isLoading = false),
      });
  }
  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}
