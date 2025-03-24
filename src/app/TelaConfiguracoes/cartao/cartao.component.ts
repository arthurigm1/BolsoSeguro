import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cartao',
  imports: [CommonModule],
  templateUrl: './cartao.component.html',
  styleUrls: ['./cartao.component.scss'],
})
export class CartaoComponent {
  creditCards: any[] = [
    {
      id: 1,
      name: 'Cartão Mastercard',
      lastDigits: '5555',
      type: 'Crédito',
      logo: 'https://assets.organizze.com.br/institutions/logos/mastercard.png',
    },
    {
      id: 2,
      name: 'Cartão Visa',
      lastDigits: '1234',
      type: 'Débito',
      logo: 'https://assets.organizze.com.br/institutions/logos/visa.png',
    },
  ];
}
