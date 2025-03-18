import { TestBed } from '@angular/core/testing';

import { DespesaService } from './despesa.service';

describe('DespesaService', () => {
  let service: DespesaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DespesaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
