import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.loginService.isLoggedIn$.pipe(
      map((isAuthenticated: boolean): boolean => {
        if (isAuthenticated) {
          if (state.url === '/login') {
            this.router.navigate(['/dashboard']);
            return false;
          }
          return true;
        }

        // Se o usuário não estiver autenticado, redireciona para login
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
