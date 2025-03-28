import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CartaoDTO,
  CartaoResponseDTO,
} from '../../Interface/CartaoDTO.interface';

@Injectable({
  providedIn: 'root',
})
export class CartaoService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'http://localhost:8080/cartoes';
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  criarCartao(cartaoDTO: CartaoDTO): Observable<void> {
    return this.http.post<void>(this.apiUrl, cartaoDTO, {
      headers: this.getAuthHeaders(),
    });
  }

  buscarCartoesPorUsuario(): Observable<CartaoResponseDTO[]> {
    return this.http.get<CartaoResponseDTO[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }
}
