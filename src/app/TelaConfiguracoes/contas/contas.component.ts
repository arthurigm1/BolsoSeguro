import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransacoesService } from '../../Services/TransacaoService/transacoes.service';
import { ContaSaldoDTO } from '../../Interface/ContaSaldoDTO.type';
import { ContaService } from '../../Services/ContaService/conta.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contas',
  imports: [CommonModule, FormsModule],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.scss',
})
export class ContasComponent {
  isModalOpen = false;

  constructor(
    private contaService: ContaService,
    private toastrService: ToastrService
  ) {}
  ngOnInit(): void {
    this.carregarContas();
  }
  accounts: ContaSaldoDTO[] = [];

  @Output() openModalEvent = new EventEmitter<void>();
  openModal() {
    this.openModalEvent.emit();
  }
  carregarContas() {
    this.contaService
      .getSaldoContas()
      .subscribe((data) => (this.accounts = data));
  }
  atualizarContas() {
    this.carregarContas();
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
        this.contaService.deletarConta(id).subscribe(
          () => {
            this.carregarContas();
            this.toastrService.success('Conta deletada com sucesso');
          },
          (error) => {
            this.toastrService.error('Erro ao deletar conta');
          }
        );
      }
    });
  }
}
