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
  apiUrl: string = 'http://localhost:8080/auth';
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
  private startTokenExpirationCheck() {
    interval(5000).subscribe(() => {
      if (!this.checkToken()) {
        this.logout();
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
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('id');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  /** Obtém informações do usuário autenticado */
  getUsuarioInfo(): Observable<UsuarioInfoResponse> {
    return this.httpClient.get<UsuarioInfoResponse>(
      `http://localhost:8080/user/info`,
      { headers: this.getAuthHeaders() }
    );
  }

  /** Reseta a senha do usuário */
  resetPassword(
    token: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(this.apiUrl, {
      token,
      password: newPassword,
    });
  }

  /** Altera a senha do usuário autenticado */
  alterarSenha(alterarSenhaDTO: any): Observable<string> {
    return this.httpClient
      .put<string>(`${this.apiUrl}/changepass`, alterarSenhaDTO, {
        headers: this.getAuthHeaders(),
      })
      .pipe(timeout(this.timeoutDuration));
  }
}
