import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecionarcontadialogComponent } from './selecionarcontadialog.component';

describe('SelecionarcontadialogComponent', () => {
  let component: SelecionarcontadialogComponent;
  let fixture: ComponentFixture<SelecionarcontadialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecionarcontadialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelecionarcontadialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
