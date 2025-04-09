import { Routes } from '@angular/router';
import { HomeComponent } from './TelaInicial/home/home.component';
import { RegistroComponent } from './registro/registro.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './TelaDashboard/dashboard/dashboard.component';
import { HomedashboardComponent } from './TelaDashboard/homedashboard/homedashboard.component';
import { AuthGuard } from './Services/UserService/auth.guard.service';
import { ContasComponent } from './TelaConfiguracoes/contas/contas.component';
import { CategoriasComponent } from './TelaConfiguracoes/categorias/categorias.component';
import { CartaoComponent } from './TelaConfiguracoes/cartao/cartao.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyComponent } from './verify/verify.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { animation: 'HomePage' },
  },
  {
    path: 'registro',
    component: RegistroComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'LoginPage' },
  },
  {
    path: 'dashboard',
    component: HomedashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'verify',
    component: VerifyComponent,
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
