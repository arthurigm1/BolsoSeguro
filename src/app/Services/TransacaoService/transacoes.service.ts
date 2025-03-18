import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransacoesService {
  private apiUrl = 'http://localhost:8080'; // URL do seu backend

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  obterSaldo(): Observable<{ saldo: number; nome: string }> {
    return this.http.get<{ saldo: number; nome: string }>(
      `${this.apiUrl}/user`,
      { headers: this.getAuthHeaders() }
    );
  }

  obterUltimasTransacoes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transacoes`, {
      headers: this.getAuthHeaders(),
    });
  }

  obterTotalDespesasMes(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/transacoes/despesa`, {
      headers: this.getAuthHeaders(),
    });
  }

  obterTotalReceitasMes(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/transacoes/receita`, {
      headers: this.getAuthHeaders(),
    });
  }

  obterCategorias(): Observable<{ id: number; nome: string; fixa: boolean }[]> {
    return this.http.get<{ id: number; nome: string; fixa: boolean }[]>(
      `${this.apiUrl}/categorias`,
      { headers: this.getAuthHeaders() }
    );
  }

  obterContas(): Observable<{ id: string; nome: string }[]> {
    return this.http.get<{ id: string; nome: string }[]>(
      `${this.apiUrl}/contas`,
      { headers: this.getAuthHeaders() }
    );
  }
}
