import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import {
  MetaFinanceiraRequestDTO,
  MetaFinanceiraResponseDTO,
} from '../../Interface/MetaFinanceiraResponseDTO.interface';

@Injectable({
  providedIn: 'root',
})
export class MetaService {
  private apiUrl = 'https://bolsoseguroapi-production.up.railway.app/api/metas';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  listarMetas(): Observable<MetaFinanceiraResponseDTO[]> {
    return this.http.get<MetaFinanceiraResponseDTO[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  criarMeta(
    dto: MetaFinanceiraRequestDTO
  ): Observable<MetaFinanceiraResponseDTO> {
    return this.http.post<MetaFinanceiraResponseDTO>(this.apiUrl, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  editarMeta(
    metaId: string,
    nomeMeta: string,
    valorMeta: number,
    valorAtual: number
  ): Observable<MetaFinanceiraResponseDTO> {
    const url = `${this.apiUrl}/${metaId}`;

    const body = {
      nomeMeta,
      valorMeta,
      valorAtual,
    };

    return this.http.put<MetaFinanceiraResponseDTO>(url, body, {
      headers: this.getAuthHeaders(),
      responseType: 'json',
    });
  }

  // Deletar meta financeira
  deletarMeta(metaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${metaId}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
