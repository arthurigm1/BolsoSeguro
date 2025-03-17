import { Component } from '@angular/core';
import { DivtopComponent } from '../divtop/divtop.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-homedashboard',
  imports: [DivtopComponent, DashboardComponent],
  templateUrl: './homedashboard.component.html',
  styleUrl: './homedashboard.component.scss',
})
export class HomedashboardComponent {}
