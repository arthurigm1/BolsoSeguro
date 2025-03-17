import { Routes } from '@angular/router';
import { HomeComponent } from './TelaInicial/home/home.component';
import { RegistroComponent } from './registro/registro.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './TelaDashboard/dashboard/dashboard.component';
import { HomedashboardComponent } from './TelaDashboard/homedashboard/homedashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'registro',
    component: RegistroComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: HomedashboardComponent,
  },
];
