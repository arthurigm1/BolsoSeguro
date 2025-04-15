import { Component } from '@angular/core';
import { DivtopComponent } from '../divtop/divtop.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

import { CommonModule } from '@angular/common';
import { ConfiguracoesComponent } from '../../TelaConfiguracoes/configuracoes/configuracoes.component';
import { LancamentosComponent } from '../../lancamentos/lancamentos.component';
import { GraficosgeraisComponent } from '../../graficosgerais/graficosgerais.component';

@Component({
  selector: 'app-homedashboard',
  imports: [
    DivtopComponent,
    DashboardComponent,

    CommonModule,
    ConfiguracoesComponent,
    LancamentosComponent,
    GraficosgeraisComponent,
  ],
  templateUrl: './homedashboard.component.html',
  styleUrl: './homedashboard.component.scss',
})
export class HomedashboardComponent {
  paginaAtual: string = 'dashboard'; // Página inicial
  activeComponent: string = 'categorias'; // Componente inicial

  alterarComponente(novoComponente: string): void {
    this.paginaAtual = novoComponente;
  }

  alterarSubcomponente(componente: string) {
    this.activeComponent = componente;
  }
}
