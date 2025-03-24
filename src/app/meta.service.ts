import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  MetaFinanceiraRequestDTO,
  MetaFinanceiraResponseDTO,
} from './Interface/MetaFinanceiraResponseDTO.interface';
import { Observable } from 'rxjs';

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
}
