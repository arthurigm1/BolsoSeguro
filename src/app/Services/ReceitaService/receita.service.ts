import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Receita } from '../../Interface/Receitapost.type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private apiUrl = 'http://localhost:8080'; // URL do seu backend

  constructor(private http: HttpClient) {}

  adicionarReceita(receita: Receita): Observable<Receita> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<Receita>(`${this.apiUrl}/receita`, receita, {
      headers,
    });
  }
}
