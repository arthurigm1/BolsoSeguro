import { TestBed } from '@angular/core/testing';
import { TransacoesService } from './transacoes.service';

describe('TransacoesService', () => {
  let service: TransacoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransacoesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
