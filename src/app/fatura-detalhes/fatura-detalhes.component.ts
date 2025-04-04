import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FaturaService } from '../fatura.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import {
  CartaoDetalhesDTO,
  FaturaCartaoDTO,
} from '../Interface/FaturaCartaoDTO.interface';
import { DespesaService } from '../Services/DespesaService/despesa.service';
import { SelecionarcontadialogComponent } from '../selecionarcontadialog/selecionarcontadialog.component';

@Component({
  selector: 'app-fatura-detalhes',
  imports: [CommonModule],
  templateUrl: './fatura-detalhes.component.html',
  styleUrl: './fatura-detalhes.component.scss',
  providers: [DatePipe],
})
export class FaturaDetalhesComponent {
  @Input() faturaData: any;
  @Output() backEvent = new EventEmitter<void>();

  fatura: CartaoDetalhesDTO | null = null;
  loading: boolean = false;
  error: string | null = null;
  despesas: any[] = [];
  constructor(
    private faturaService: FaturaService,
    private datePipe: DatePipe,
    private despesaService: DespesaService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.faturaData) {
      this.loadFatura();
    }
  }
  getNomeMes(mes: number): string {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return meses[mes - 1] || '';
  }
  loadFatura(): void {
    this.loading = true;
    this.error = null;

    this.faturaService
      .buscarFaturaPorMes(
        this.faturaData.cartaoId,
        this.faturaData.mes,
        this.faturaData.ano
      )
      .subscribe({
        next: (faturas) => {
          if (faturas && faturas.length > 0) {
            this.fatura = {
              ...faturas[0],
              nomeCartao: faturas[0].nomeCartao || '',
              bandeira: faturas[0].bandeira || '',
              limiteTotal: faturas[0].limiteTotal || 0,
              limiteDisponivel: faturas[0].limiteDisponivel || 0,
              // Add other missing properties with default values if necessary
            };
          } else {
            this.error = 'Nenhuma fatura encontrada para este período.';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar fatura. Tente novamente.';
          this.loading = false;
          console.error(err);
        },
      });

    // Buscar despesas
    this.despesaService
      .buscarDespesasPorMes(
        this.faturaData.cartaoId,
        this.faturaData.ano,
        this.faturaData.mes
      )
      .subscribe({
        next: (despesas) => {
          this.despesas = despesas;
        },
        error: (err) => {
          console.error('Erro ao carregar despesas:', err);
        },
      });
  }

  alterarMes(direcao: number): void {
    this.loading = true;

    // Atualiza o mês/ano
    let newMonth = this.faturaData.mes + direcao;
    let newYear = this.faturaData.ano;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    // Atualiza os dados do período
    this.faturaData = {
      ...this.faturaData,
      mes: newMonth,
      ano: newYear,
    };

    // Zera os dados antes de carregar
    if (this.fatura) {
      this.fatura = {
        ...this.fatura, // Mantém todas as outras propriedades
        valor: 0, // Reseta o valor
        dataVencimento: '', // Reseta a data
        paga: false, // Reseta o status
      };
    }

    this.despesas = [];
    this.error = null;

    // Carrega os novos dados
    this.loadFatura();
  }

  voltar(): void {
    this.backEvent.emit();
  }

  pagarFatura(): void {
    if (!this.fatura) return;

    this.loading = true;

    // Abre o diálogo para selecionar a conta
    const dialogRef = this.dialog.open(SelecionarcontadialogComponent, {
      width: '500px',
      data: { cartaoId: this.faturaData.cartaoId },
    });

    dialogRef.afterClosed().subscribe((contaId) => {
      if (contaId) {
        this.faturaService
          .pagarFatura({
            cartaoId: this.faturaData.cartaoId,
            mes: this.faturaData.mes,
            ano: this.faturaData.ano,
            contaId: contaId,
          })
          .subscribe({
            next: () => {
              if (this.fatura) {
                this.fatura.paga = true;
              }
              this.loading = false;
            },
            error: (err) => {
              this.error = 'Erro ao processar pagamento. Tente novamente.';
              this.loading = false;
              console.error(err);
            },
          });
      } else {
        this.loading = false;
      }
    });
  }

  formatarData(data: string): string {
    return this.datePipe.transform(data, 'dd/MM/yyyy') || '';
  }

  getCardLogo(bandeira: string): string {
    const basePath = 'assets/img/';
    switch (bandeira?.toUpperCase()) {
      case 'VISA':
        return basePath + 'visa.png';
      case 'MASTERCARD':
        return basePath + 'mastercard.png';
      default:
        return basePath + 'outroscard.png';
    }
  }

  downloadReport(): void {
    if (!this.faturaData) return;

    this.loading = true;
    this.error = null;

    this.faturaService
      .exportarFaturaPorMes(
        this.faturaData.cartaoId,
        this.faturaData.mes,
        this.faturaData.ano
      )
      .subscribe({
        next: (pdfBytes: ArrayBuffer) => {
          this.loading = false;

          // Cria um blob a partir dos bytes recebidos
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });

          // Cria um link para download
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');

          // Obtém o nome do mês em português
          const nomeMes = this.getNomeMes(this.faturaData.mes).toLowerCase();

          // Define o nome do arquivo
          link.download = `fatura-${nomeMes}-${this.faturaData.mes}-${this.faturaData.ano}.pdf`;
          link.href = downloadUrl;

          // Dispara o download
          document.body.appendChild(link);
          link.click();

          // Limpa o objeto URL
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
          }, 100);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Erro ao baixar relatório. Tente novamente.';
          console.error(err);
        },
      });
  }
}
