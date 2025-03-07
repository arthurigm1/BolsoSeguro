import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanosComponent } from './planos.component';

describe('PlanosComponent', () => {
  let component: PlanosComponent;
  let fixture: ComponentFixture<PlanosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
