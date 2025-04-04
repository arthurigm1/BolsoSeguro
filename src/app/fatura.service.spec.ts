import { TestBed } from '@angular/core/testing';

import { FaturaService } from './fatura.service';

describe('FaturaService', () => {
  let service: FaturaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaturaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
