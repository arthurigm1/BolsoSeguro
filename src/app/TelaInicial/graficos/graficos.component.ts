import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';

Chart.register(
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineController,
  LineElement,
  PointElement
);

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.scss'],
})
export class GraficosComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    this.createBarChart();
    this.createPieChart();
    this.createLineChart();
    this.createHorizontalBarChart();
  }

  createBarChart() {
    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas', 'Lucro'],
        datasets: [
          {
            label: 'Receitas',
            data: [5000, 0, 0],
            backgroundColor: '#1C6956', // Verde Principal
          },
          {
            label: 'Despesas',
            data: [0, 3000, 0],
            backgroundColor: '#748389', // Cinza Neutro
          },
          {
            label: 'Lucro',
            data: [0, 0, 2000],
            backgroundColor: '#013E4C', // Azul Escuro
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Desempenho Financeiro',
          },
        },
      },
    });
  }

  createPieChart() {
    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: ['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Outros'],
        datasets: [
          {
            label: 'Gastos por Categoria',
            data: [300, 150, 100, 500, 50],
            backgroundColor: [
              '#1C6956', // Verde Principal
              '#013E4C', // Azul Escuro
              '#748389', // Cinza Neutro
              '#D8EAE5', // Verde Suave
              '#E0E5E7', // Cinza Claro
            ],
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Distribuição de Gastos',
          },
        },
      },
    });
  }

  createLineChart() {
    new Chart('lineChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Receitas',
            data: [2000, 2100, 2200, 2300, 2400, 2500],
            borderColor: '#1C6956',
            backgroundColor: '#D8EAE5',
            fill: false,
            tension: 0.3,
            pointRadius: 4,
          },
          {
            label: 'Despesas',
            data: [1500, 1600, 1700, 1800, 1900, 2000],
            borderColor: '#748389',
            backgroundColor: '#E0E5E7',
            fill: false,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
        plugins: {
          title: {
            display: true,
            text: 'Evolução de Receitas e Despesas',
          },
        },
      },
    });
  }

  createHorizontalBarChart() {
    new Chart('horizontalBarChart', {
      type: 'bar',
      data: {
        labels: ['Meta de Economia', 'Gastos Reais'],
        datasets: [
          {
            label: 'Meta de Economia',
            data: [2000, 0],
            backgroundColor: '#D8EAE5',
          },
          {
            label: 'Gastos Reais',
            data: [0, 1800],
            backgroundColor: '#1C6956',
          },
        ],
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true },
        },
        plugins: {
          title: {
            display: true,
            text: 'Metas de Economia vs. Gastos Reais',
          },
        },
      },
    });
  }
}
