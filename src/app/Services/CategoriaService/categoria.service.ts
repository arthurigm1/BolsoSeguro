import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoriaDTO } from '../../Interface/CategoriaDTO.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private apiUrl =
    'https://bolsoseguroapi-production.up.railway.app/categorias'; // URL do seu backend

  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  criarCategoria(categoriaDTO: CategoriaDTO): Observable<any> {
    return this.http.post(this.apiUrl, categoriaDTO, {
      headers: this.getAuthHeaders(),
    });
  }
  deletarCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
