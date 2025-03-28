import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CartaoResponseDTO } from '../../Interface/CartaoDTO.interface';
import { CartaoService } from '../../Services/CartaoService/cartao.service';

@Component({
  selector: 'app-cartao',
  imports: [CommonModule],
  templateUrl: './cartao.component.html',
  styleUrls: ['./cartao.component.scss'],
})
export class CartaoComponent implements OnInit {
  creditCards: CartaoResponseDTO[] = [];
  constructor(private cartaoService: CartaoService) {}
  @Output() openModalEvent = new EventEmitter<void>();
  openModal() {
    this.openModalEvent.emit();
  }
  ngOnInit() {
    this.buscarCartoes();
  }
  buscarCartoes() {
    this.cartaoService.buscarCartoesPorUsuario().subscribe(
      (response: CartaoResponseDTO[]) => {
        this.creditCards = response; // Atribui a resposta ao array de cartões
      },
      (error) => {
        console.error('Erro ao buscar cartões', error);
      }
    );
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
