import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse } from '../../Interface/LoginResponse.type';
import { BehaviorSubject, Observable, tap, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkToken());
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  public checkToken(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const decodedToken = this.decodeToken(token);
      const currentTime = Date.now() / 1000; // Tempo atual em segundos
      // Verifica se o token não está expirado
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Erro ao decodificar o token', error);
      return false;
    }
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  apiUrl: string = 'http://localhost:8080/auth';
  private timeoutDuration = 15000;

  constructor(private httpClient: HttpClient, private router: Router) {}

  login(email: string, senha: string) {
    return this.httpClient
      .post<LoginResponse>(this.apiUrl + '/login', { email, senha })
      .pipe(
        timeout(this.timeoutDuration),
        tap((value) => {
          localStorage.setItem('authToken', value.token);
          this.isLoggedInSubject.next(true);
        })
      );
  }

  signup(nome: string, email: string, senha: string) {
    return this.httpClient
      .post<LoginResponse>(this.apiUrl + '/register', { email, nome, senha })
      .pipe(
        timeout(this.timeoutDuration),
        tap((value) => {
          sessionStorage.setItem('username', value.email);
        })
      )
      .pipe(timeout(this.timeoutDuration));
  }
}
