import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-selecionar-tipo-transacao-dialog',
  templateUrl: './selecionar-tipo-transacao-dialog.component.html',
})
export class SelecionarTipoTransacaoDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<SelecionarTipoTransacaoDialogComponent>
  ) {}

  selecionarTipo(tipo: 'DESPESA' | 'RECEITA') {
    this.dialogRef.close(tipo);
  }

  fechar() {
    this.dialogRef.close();
  }
}
