import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CartaoService } from '../../Services/CartaoService/cartao.service';
import { CartaoResponseDTO } from '../../Interface/CartaoDTO.interface';
import { NovoCartaoDialogComponent } from '../../Dialog/novo-cartao-dialog/novo-cartao-dialog.component';
import Swal from 'sweetalert2';
import { EditCardDialogComponent } from '../../Dialog/edit-card-dialog/edit-card-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cartao',
  templateUrl: './cartao.component.html',
  styleUrls: ['./cartao.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
})
export class CartaoComponent implements OnInit {
  creditCards: CartaoResponseDTO[] = [];
  isLoading = false;
  isAddingCartao = false;
  @Output() showFaturaEvent = new EventEmitter<string>();
  constructor(
    private cartaoService: CartaoService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarCartoes();
  }

  carregarCartoes(): void {
    this.isLoading = true;
    this.cartaoService.buscarCartoesPorUsuario().subscribe({
      next: (cartoes: CartaoResponseDTO[]) => {
        this.creditCards = cartoes;
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.toastr.error('Erro ao carregar cartões', 'Erro');
        this.isLoading = false;
      },
    });
  }

  openModal(): void {
    this.isAddingCartao = true;
    const dialogRef = this.dialog.open(NovoCartaoDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.isAddingCartao = false;
      if (result) {
        this.carregarCartoes();
      }
    });
  }

  deletarCartao(id: string) {
    Swal.fire({
      title:
        'Tem certeza que deseja excluir este cartão? Todas as despesas e faturas associadas também serão removidas.',
      text: 'Você não poderá reverter isso!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartaoService.deleteCartao(id).subscribe({
          next: () => {
            Swal.fire(
              'Excluído!',
              'O cartão foi removido com sucesso.',
              'success'
            );
            this.carregarCartoes();
          },
          error: () => {
            Swal.fire('Erro!', 'Ocorreu um erro ao deletar o cartão.', 'error');
          },
        });
      }
    });
  }

  getCardLogo(bandeira: string): string {
    switch (bandeira) {
      case 'VISA':
        return 'assets/img/visa.png'; // Atualize com o caminho correto das imagens
      case 'MASTERCARD':
        return 'assets/img/mastercard.png';
      case 'ELO':
        return 'assets/logos/elo.png';
      case 'AMEX':
        return 'assets/logos/amex.png';
      case 'HIPERCARD':
        return 'assets/logos/hipercard.png';
      case 'OUTROS':
        return 'assets/img/outroscard.png';
      default:
        return 'assets/logos/default.png'; // Logo padrão
    }
  }

  getTotalAvailableLimit(): number {
    return this.creditCards.reduce(
      (total, card) => total + card.limiteDisponivel,
      0
    );
  }

  verDetalhesFatura(cartaoId: string): void {
    this.showFaturaEvent.emit(cartaoId);
  }

  editarCartao(card: any) {
    const dialogRef = this.dialog.open(EditCardDialogComponent, {
      width: '500px',
      data: { card },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.atualizarCartao(card.id, result);
      }
    });
  }

  atualizarCartao(id: string, dados: any) {
    this.cartaoService.updateCartao(id, dados).subscribe({
      next: () => {
        this.toastr.success('Cartão atualizado com sucesso!');
        this.carregarCartoes();
      },
      error: (err) => {
        this.toastr.error('Erro ao atualizar cartão!');
      },
    });
  }
}
