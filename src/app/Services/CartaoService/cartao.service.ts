import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CartaoDTO,
  CartaoResponseDTO,
  CartaoUpdateDTO,
} from '../../Interface/CartaoDTO.interface';

@Injectable({
  providedIn: 'root',
})
export class CartaoService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'https://bolsoseguroapi-production.up.railway.app/cartoes';
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

  updateCartao(id: string, cartao: CartaoUpdateDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, cartao, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteCartao(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
