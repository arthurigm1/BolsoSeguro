import { Component, OnInit } from '@angular/core';
import { UsuarioInfoResponse } from '../../Interface/UsuarioInfoResponse.interface';
import { LoginService } from '../../Services/UserService/login.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-minhaconta',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './minhaconta.component.html',
  styleUrl: './minhaconta.component.scss',
})
export class MinhacontaComponent implements OnInit {
  usuario: UsuarioInfoResponse | null = null;
  loading = true;
  error: string | null = null;
  isSubmitting = false;

  senhaForm = new FormGroup({
    senhaAtual: new FormControl('', Validators.required),
    novaSenha: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmarSenha: new FormControl('', Validators.required),
  });

  constructor(
    private usuarioService: LoginService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarDadosUsuario();
  }

  carregarDadosUsuario() {
    this.usuarioService.getUsuarioInfo().subscribe({
      next: (response: UsuarioInfoResponse) => {
        this.usuario = response;
        this.loading = false;
      },
      error: () => {
        this.toastService.error(
          'Erro ao carregar os dados do usuário. Tente novamente mais tarde.'
        );
        this.loading = false;
      },
    });
  }

  alterarSenha(): void {
    if (this.senhaForm.invalid) {
      this.toastService.error('Preencha todos os campos corretamente.');
      return;
    }

    const { senhaAtual, novaSenha, confirmarSenha } = this.senhaForm.value;

    if (novaSenha !== confirmarSenha) {
      this.toastService.error('As senhas não coincidem!');
      return;
    }

    if (novaSenha === senhaAtual) {
      this.toastService.error(
        'A nova senha deve ser diferente da senha atual.'
      );
      return;
    }

    this.isSubmitting = true;
    const alterarSenhaDTO = { senhaAtual, novaSenha };

    this.usuarioService.alterarSenha(alterarSenhaDTO).subscribe({
      next: () => {
        this.toastService.success('Senha atualizada com sucesso!');
        this.senhaForm.reset();
      },
      error: () => {
        this.senhaForm.reset();
        this.isSubmitting = false;

        this.toastService.error('Sua senha atual não corresponde.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
