import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse } from '../../Interface/LoginResponse.type';
import { BehaviorSubject, Observable, interval, tap, timeout } from 'rxjs';
import { UsuarioInfoResponse } from '../../Interface/UsuarioInfoResponse.interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkToken());
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  apiUrl: string = 'https://bolsoseguroapi-production.up.railway.app/auth';
  private timeoutDuration = 15000;

  constructor(private httpClient: HttpClient, private router: Router) {
    this.startTokenExpirationCheck();
  }

  /** Verifica se o token é válido */
  public checkToken(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const decodedToken = this.decodeToken(token);
      const currentTime = Date.now() / 1000; // Tempo atual em segundos
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Erro ao decodificar o token', error);
      return false;
    }
  }

  /** Obtém os headers com o token */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /** Decodifica o token JWT */
  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  /** Inicia um verificador de expiração do token */
  private hasLoggedOut = false;

  private startTokenExpirationCheck() {
    interval(5000).subscribe(() => {
      const tokenIsValid = this.checkToken();
      if (!tokenIsValid && !this.hasLoggedOut) {
        this.hasLoggedOut = true;
        this.logout(); // Redireciona apenas uma vez
      }
    });
  }

  /** Realiza login do usuário */
  login(email: string, senha: string) {
    return this.httpClient
      .post<LoginResponse>(this.apiUrl + '/login', { email, senha })
      .pipe(
        timeout(this.timeoutDuration),
        tap((value) => {
          localStorage.setItem('authToken', value.token);
          this.hasLoggedOut = false;
          this.isLoggedInSubject.next(true);
        })
      );
  }

  /** Realiza cadastro */
  signup(nome: string, email: string, senha: string) {
    return this.httpClient
      .post<LoginResponse>(this.apiUrl + '/register', { email, nome, senha })
      .pipe(timeout(this.timeoutDuration));
  }

  /** Faz logout e redireciona */
  logout(): void {}

  /** Obtém informações do usuário autenticado */
  getUsuarioInfo(): Observable<UsuarioInfoResponse> {
    return this.httpClient.get<UsuarioInfoResponse>(
      `https://bolsoseguroapi-production.up.railway.app/user/info`,
      { headers: this.getAuthHeaders() }
    );
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}/reset-password`, {
        token,
        password,
      })
      .pipe(timeout(this.timeoutDuration));
  }
  forgotPassword(email: string): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}/forgot-password`, { email })
      .pipe(timeout(this.timeoutDuration));
  }

  /** Altera a senha do usuário autenticado */
  alterarSenha(alterarSenhaDTO: any): Observable<string> {
    return this.httpClient
      .put<string>(`${this.apiUrl}/changepass`, alterarSenhaDTO, {
        headers: this.getAuthHeaders(),
      })
      .pipe(timeout(this.timeoutDuration));
  }
  verifyAccount(code: string): Observable<string> {
    return this.httpClient.get(`${this.apiUrl}/verify?code=${code}`, {
      responseType: 'text',
    });
  }
}
