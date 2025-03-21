import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartaoComponent } from './cartao.component';

describe('CartaoComponent', () => {
  let component: CartaoComponent;
  let fixture: ComponentFixture<CartaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
