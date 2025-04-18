import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContaSaldoDTO } from '../../Interface/ContaSaldoDTO.type';
import { ContaService } from '../../Services/ContaService/conta.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { NovaContaDialogComponent } from '../../Dialog/nova-conta-dialog/nova-conta-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatListModule,
  ],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.scss',
})
export class ContasComponent implements OnInit {
  isLoading = true;
  accounts: ContaSaldoDTO[] = [];

  constructor(
    private contaService: ContaService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarContas();
  }

  openModal() {
    const dialogRef = this.dialog.open(NovaContaDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.carregarContas();
      }
    });
  }

  carregarContas() {
    this.isLoading = true;
    this.contaService.getSaldoContas().subscribe({
      next: (data) => {
        this.accounts = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar contas:', err);
        this.toastrService.error('Erro ao carregar contas.');
        this.isLoading = false;
      },
    });
  }

  deleteAccount(id: string) {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Se você excluir esta conta, o saldo e todas as transações serão apagadas permanentemente!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.contaService.deletarConta(id).subscribe({
          next: () => {
            this.carregarContas();
            this.toastrService.success('Conta deletada com sucesso');
          },
          error: (error) => {
            this.toastrService.error('Erro ao deletar conta');
          },
        });
      }
    });
  }

  getTotalBalance(): number {
    return this.accounts.reduce((total, account) => total + account.saldo, 0);
  }

  getBankIcon(banco: string): string {
    const bankIcons: Record<string, { icon: string; name: string }> = {
      NUBANK: { icon: 'assets/iconbank/nubank.png', name: 'Nubank' },
      INTER: { icon: 'assets/iconbank/inter.png', name: 'Inter' },
      CAIXA: { icon: 'assets/iconbank/caixa.png', name: 'Caixa' },
      ITAU: { icon: 'assets/iconbank/itau.png', name: 'Itaú' },
      SANTANDER: { icon: 'assets/iconbank/santander.png', name: 'Santander' },
      BRADESCO: { icon: 'assets/iconbank/bradesco.png', name: 'Bradesco' },
      BANCO_DO_BRASIL: { icon: 'assets/iconbank/bb.png', name: 'BB' },
      OUTROS: { icon: 'assets/iconbank/outros.png', name: 'Outros' },
    };

    // Garantir maiúsculas para compatibilidade com as chaves
    const bancoKey = banco?.toUpperCase() || 'OUTROS';

    // Retorna o caminho do ícone ou o de "OUTROS"
    return bankIcons[bancoKey]?.icon || bankIcons['OUTROS'].icon;
  }
}
