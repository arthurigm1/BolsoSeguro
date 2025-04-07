import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../Services/UserService/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {
  code: string = '';
  verificado: boolean | null = null;
  isLoading: boolean = true; // Adicionado estado de loading

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastService: ToastrService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.code = params['code'];
      if (this.code) {
        this.verifyUser();
      } else {
        this.isLoading = false;
        this.verificado = false;
        this.toastService.warning(
          'Nenhum código de verificação encontrado na URL!',
          'Aviso'
        );
      }
    });
  }

  verifyUser(): void {
    this.loginService.verifyAccount(this.code).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response === 'verify_success') {
          this.verificado = true;
          this.toastService.success('Conta verificada com sucesso!', 'Sucesso');
          setTimeout(() => this.router.navigate(['/login']), 3000);
        } else {
          this.verificado = false;
          this.toastService.error('Código de verificação inválido!', 'Erro');
        }
      },
      error: () => {
        this.isLoading = false;
        this.verificado = false;
        this.toastService.error('Erro ao verificar o usuário.', 'Erro');
      },
    });
  }
}
