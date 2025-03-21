import { Component } from '@angular/core';
import { DivtopComponent } from '../divtop/divtop.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ContasComponent } from '../contas/contas.component';
import { CommonModule } from '@angular/common';
import { ConfiguracoesComponent } from '../../configuracoes/configuracoes.component';

@Component({
  selector: 'app-homedashboard',
  imports: [
    DivtopComponent,
    DashboardComponent,
    ContasComponent,
    CommonModule,
    ConfiguracoesComponent,
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
