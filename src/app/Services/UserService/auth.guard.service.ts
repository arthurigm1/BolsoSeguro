import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Verifica se o token é válido
    if (this.loginService.checkToken()) {
      // Se o token for válido e a rota for login, redireciona para o dashboard
      if (state.url === '/login') {
        this.router.navigate(['/dashboard']);
        return false; // Impede o acesso à página de login
      }
      return true; // Permite o acesso à rota (ex: dashboard)
    }
    // Se o token não for válido, redireciona para a página de login
    if (state.url !== '/login') {
      localStorage.removeItem('authToken');
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
