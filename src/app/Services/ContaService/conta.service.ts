import { Injectable } from '@angular/core';
import { ContaSaldoDTO } from '../../Interface/ContaSaldoDTO.type';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContaCadastroDTO } from '../../Interface/ContaCadastroDTO.type';

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  private apiUrl = 'https://bolsoseguroapi-production.up.railway.app'; // URL do seu backend

  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  getSaldoContas(): Observable<ContaSaldoDTO[]> {
    // Realiza a requisição GET ao backend para obter o saldo das contas
    return this.http.get<ContaSaldoDTO[]>(`${this.apiUrl}/contas/saldo`, {
      headers: this.getAuthHeaders(),
    });
  }
  cadastrarConta(conta: ContaCadastroDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/contas`, conta, {
      headers: this.getAuthHeaders(),
    });
  }

  deletarConta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contas/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
