import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateService {
  private apiUrl =
    'https://v6.exchangerate-api.com/v6/82d926ef74c1ae257a67eb8e/latest/USD'; // URL da API

  constructor(private http: HttpClient) {}

  // Método para obter as taxas de câmbio
  getExchangeRates(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
