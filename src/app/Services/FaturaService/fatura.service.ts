import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import {
  CartaoDetalhesDTO,
  PagamentoFaturaRequest,
} from '../../Interface/FaturaCartaoDTO.interface';

@Injectable({
  providedIn: 'root',
})
export class FaturaService {
  private apiUrl = 'https://bolsoseguroapi-production.up.railway.app/faturas';
  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  buscarFaturaPorMes(
    cartaoId: string,
    mes: number,
    ano: number
  ): Observable<CartaoDetalhesDTO[]> {
    const params = new HttpParams()
      .set('cartaoId', cartaoId)
      .set('mes', mes.toString())
      .set('ano', ano.toString());

    return this.http.get<CartaoDetalhesDTO[]>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders(),
      params: params,
    });
  }

  pagarFatura(request: PagamentoFaturaRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/pagar`, request, {
      headers: this.getAuthHeaders(),
    });
  }

  exportarFaturaPorMes(
    cartaoId: string,
    mes: number,
    ano: number
  ): Observable<ArrayBuffer> {
    const url = `${this.apiUrl}/exportar/${cartaoId}/${mes}/${ano}`;

    return this.http.get<ArrayBuffer>(url, {
      headers: this.getAuthHeaders(),
      responseType: 'arraybuffer' as 'json',
    });
  }
}
