import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivtopComponent } from './divtop.component';

describe('DivtopComponent', () => {
  let component: DivtopComponent;
  let fixture: ComponentFixture<DivtopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DivtopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivtopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
