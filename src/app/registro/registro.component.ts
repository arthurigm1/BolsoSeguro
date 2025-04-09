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

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
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
