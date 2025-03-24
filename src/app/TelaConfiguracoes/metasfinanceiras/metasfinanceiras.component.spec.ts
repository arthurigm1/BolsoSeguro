import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetasfinanceirasComponent } from './metasfinanceiras.component';

describe('MetasfinanceirasComponent', () => {
  let component: MetasfinanceirasComponent;
  let fixture: ComponentFixture<MetasfinanceirasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetasfinanceirasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetasfinanceirasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
