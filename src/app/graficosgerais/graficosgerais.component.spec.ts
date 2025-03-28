import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficosgeraisComponent } from './graficosgerais.component';

describe('GraficosgeraisComponent', () => {
  let component: GraficosgeraisComponent;
  let fixture: ComponentFixture<GraficosgeraisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficosgeraisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficosgeraisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
