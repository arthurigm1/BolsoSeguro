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

// Registrar todos os elementos necessários do Chart.js
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

  // Gráfico de Barras (Desempenho Financeiro)
  createBarChart() {
    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas', 'Lucro'], // Rótulos representando as categorias financeiras
        datasets: [
          {
            label: 'Receitas',
            data: [5000, 0, 0], // Apenas o valor de Receitas será atribuído a esta barra
            backgroundColor: '#000000', // Cor preta para Receitas
          },
          {
            label: 'Despesas',
            data: [0, 3000, 0], // Apenas o valor de Despesas será atribuído a esta barra
            backgroundColor: '#2F4F4F', // Cor cinza escuro para Despesas
          },
          {
            label: 'Lucro',
            data: [0, 0, 2000], // Apenas o valor de Lucro será atribuído a esta barra
            backgroundColor: '#808080', // Cor cinza para Lucro
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true, // Começar a escala Y no valor zero
          },
        },
        plugins: {
          title: {
            display: true, // Exibir o título do gráfico
            text: 'Desempenho Financeiro', // Título do gráfico
          },
        },
      },
    });
  }

  // Gráfico de Pizza (Distribuição de Gastos)
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
              '#000000',
              '#2F4F4F',
              '#808080',
              '#505050',
              '#A9A9A9',
            ], // Cores atualizadas com tons de cinza escuro e preto
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

  // Gráfico de Linha (Evolução de Receitas e Despesas)
  createLineChart() {
    new Chart('lineChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Receitas',
            data: [2000, 2100, 2200, 2300, 2400, 2500],
            borderColor: '#000000', // Cor alterada para preto
            fill: false,
          },
          {
            label: 'Despesas',
            data: [1500, 1600, 1700, 1800, 1900, 2000],
            borderColor: '#2F4F4F', // Cor alterada para cinza escuro
            fill: false,
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
            text: 'Evolução de Receitas e Despesas',
          },
        },
      },
    });
  }

  // Gráfico de Barras Horizontal (Metas de Economia)
  createHorizontalBarChart() {
    new Chart('horizontalBarChart', {
      type: 'bar',
      data: {
        labels: ['Meta de Economia', 'Gastos Reais'],
        datasets: [
          {
            label: 'Metas de Economia',
            data: [2000, 0], // Adicionei o valor 0 para 'Gastos Reais' nesta série
            backgroundColor: '#000000', // Preto para metas
          },
          {
            label: 'Gastos Reais',
            data: [0, 1800], // Adicionei o valor 0 para 'Meta de Economia' nesta série
            backgroundColor: '#2F4F4F', // Cinza escuro para gastos reais
          },
        ],
      },
      options: {
        indexAxis: 'y', // Transforma o gráfico em barras horizontais
        scales: {
          x: {
            beginAtZero: true,
          },
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
