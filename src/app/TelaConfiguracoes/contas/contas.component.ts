import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransacoesService } from '../../Services/TransacaoService/transacoes.service';
import { ContaSaldoDTO } from '../../Interface/ContaSaldoDTO.type';
import { ContaService } from '../../Services/ContaService/conta.service';

@Component({
  selector: 'app-contas',
  imports: [CommonModule, FormsModule],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.scss',
})
export class ContasComponent {
  isModalOpen = false;

  constructor(private contaService: ContaService) {}
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
}
