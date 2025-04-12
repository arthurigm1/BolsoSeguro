import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CartaoResponseDTO } from '../../Interface/CartaoDTO.interface';
import { CartaoService } from '../../Services/CartaoService/cartao.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EditCardDialogComponent } from '../../Dialog/edit-card-dialog/edit-card-dialog.component';

@Component({
  selector: 'app-cartao',
  imports: [CommonModule],
  templateUrl: './cartao.component.html',
  styleUrls: ['./cartao.component.scss'],
})
export class CartaoComponent implements OnInit {
  creditCards: CartaoResponseDTO[] = [];
  isAddingCard = false;
  isLoadingPage = false;
  deletingCardId: string | null = null;
  cartoes: any[] = [];
  constructor(
    private dialog: MatDialog,
    private cartaoService: CartaoService,

    private toastr: ToastrService
  ) {}
  @Output() openModalEvent = new EventEmitter<void>();
  @Output() showFaturaEvent = new EventEmitter<string>();
  verDetalhesFatura(cartaoId: string): void {
    this.showFaturaEvent.emit(cartaoId);
  }
  isLoading = true;
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
        this.buscarCartoes();
      },
      error: (err) => {
        this.toastr.error('Erro ao atualizar cartão!');
      },
    });
  }
  openModal() {
    this.openModalEvent.emit();
  }
  ngOnInit() {
    this.buscarCartoes();
  }
  buscarCartoes() {
    this.isLoading = true;
    this.cartaoService.buscarCartoesPorUsuario().subscribe(
      (response: CartaoResponseDTO[]) => {
        this.creditCards = response;
        this.isLoading = false;
      },
      (error) => {
        this.toastr.error(
          'Erro ao carregar os cartões. Tente novamente mais tarde.'
        );
        this.isLoading = false;
      }
    );
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
            this.buscarCartoes();
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
}
