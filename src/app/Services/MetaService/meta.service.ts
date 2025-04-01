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
  private apiUrl = 'http://localhost:8080/api/metas'; // URL do seu backend

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
    valorMeta: number,
    valorAtual: number
  ): Observable<MetaFinanceiraResponseDTO> {
    const url = `${this.apiUrl}/${metaId}`;

    const body = {
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
