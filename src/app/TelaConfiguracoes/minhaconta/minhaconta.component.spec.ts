import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhacontaComponent } from './minhaconta.component';

describe('MinhacontaComponent', () => {
  let component: MinhacontaComponent;
  let fixture: ComponentFixture<MinhacontaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhacontaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhacontaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
