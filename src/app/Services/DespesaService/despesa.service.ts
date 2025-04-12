import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Despesa } from '../../Interface/Despesapost.type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DespesaService {
  private apiUrl = 'https://bolsoseguroapi-production.up.railway.app'; // URL do seu backend

  constructor(private http: HttpClient) {}

  adicionarDespesa(despesa: Despesa): Observable<Despesa> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<Despesa>(`${this.apiUrl}/despesa`, despesa, {
      headers,
    });
  }
  buscarDespesasPorMes(
    cartaoId: string,
    ano: number,
    mes: number
  ): Observable<any[]> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const params = new HttpParams()
      .set('cartaoId', cartaoId)
      .set('ano', ano.toString())
      .set('mes', mes.toString());

    return this.http.get<any[]>(`${this.apiUrl}/despesa`, { headers, params });
  }
}
