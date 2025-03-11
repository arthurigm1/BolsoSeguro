import { Component } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  constructor() {}

  ngOnInit(): void {
    this.renderChart();
  }

  renderChart(): void {
    const ctx = document.getElementById(
      'incomeExpenseChart'
    ) as HTMLCanvasElement;
    const incomeExpenseChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [
          {
            label: 'Receitas',
            data: [5000, 6000, 5500, 7000, 6500, 8000],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Despesas',
            data: [4000, 4500, 5000, 5500, 6000, 6500],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}
