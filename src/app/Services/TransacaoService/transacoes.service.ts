import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ContaSaldoDTO } from '../../Interface/ContaSaldoDTO.type';

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

  // Obtém categorias de despesas
  obterCategoriasDespesas(): Observable<
    { id: number; nome: string; fixa: boolean; tipo: string }[]
  > {
    return this.http.get<
      { id: number; nome: string; fixa: boolean; tipo: string }[]
    >(`${this.apiUrl}/categorias/despesas`, { headers: this.getAuthHeaders() });
  }

  // Obtém categorias de receitas
  obterCategoriasReceitas(): Observable<
    { id: number; nome: string; fixa: boolean; tipo: string }[]
  > {
    return this.http.get<
      { id: number; nome: string; fixa: boolean; tipo: string }[]
    >(`${this.apiUrl}/categorias/receitas`, { headers: this.getAuthHeaders() });
  }

  obterContas(): Observable<{ id: string; nome: string }[]> {
    return this.http.get<{ id: string; nome: string }[]>(
      `${this.apiUrl}/contas`,
      { headers: this.getAuthHeaders() }
    );
  }

  obterSaldoInvestimentos(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/transacoes/investimento`, {
      headers: this.getAuthHeaders(),
    });
  }
}
