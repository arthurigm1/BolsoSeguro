import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomedashboardComponent } from './homedashboard.component';

describe('HomedashboardComponent', () => {
  let component: HomedashboardComponent;
  let fixture: ComponentFixture<HomedashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomedashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomedashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
