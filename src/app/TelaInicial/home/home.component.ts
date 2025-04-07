import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FaqComponent } from '../faq/faq.component';
import { FuncionalidadesComponent } from '../funcionalidades/funcionalidades.component';
import { PlanosComponent } from '../planos/planos.component';
import { SobreComponent } from '../sobre/sobre.component';
import { GraficosComponent } from '../graficos/graficos.component';
import * as AOS from 'aos';
@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    FooterComponent,
    FaqComponent,
    FuncionalidadesComponent,
    PlanosComponent,
    SobreComponent,
    GraficosComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  // Inicializado o AOS
  ngOnInit(): void {
    AOS.init({
      duration: 800, // milissegundos
      once: true, // só anima uma vez
    });
  }
}
