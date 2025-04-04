import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaturaDetalhesComponent } from './fatura-detalhes.component';

describe('FaturaDetalhesComponent', () => {
  let component: FaturaDetalhesComponent;
  let fixture: ComponentFixture<FaturaDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaturaDetalhesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaturaDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
