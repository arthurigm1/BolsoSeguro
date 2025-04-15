import { Component, OnInit } from '@angular/core';
import {
  MetaFinanceiraRequestDTO,
  MetaFinanceiraResponseDTO,
  MetaFinanceiraResponseDTOComId,
} from '../../Interface/MetaFinanceiraResponseDTO.interface';
import { CommonModule } from '@angular/common';
import { MetaService } from '../../Services/MetaService/meta.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { NovaMetaDialogComponent } from '../../Dialog/nova-meta-dialog/nova-meta-dialog.component';

@Component({
  selector: 'app-metasfinanceiras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metasfinanceiras.component.html',
  styleUrl: './metasfinanceiras.component.scss',
})
export class MetasfinanceirasComponent implements OnInit {
  metas: MetaFinanceiraResponseDTO[] = [];
  isLoading: boolean = true;

  constructor(
    private metaService: MetaService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarMetas();
  }

  carregarMetas(): void {
    this.isLoading = true;
    this.metaService.listarMetas().subscribe({
      next: (metas) => {
        this.isLoading = false;
        this.metas = metas.map((meta) => ({
          ...meta,
          progresso: this.calcularProgresso(meta),
        }));
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Erro ao carregar metas financeiras');
      },
    });
  }

  calcularProgresso(meta: MetaFinanceiraResponseDTO): number {
    return Math.round(((meta.valorAtual ?? 0) / meta.valorMeta) * 100);
  }

  calcularTotalMetas(): number {
    return this.metas.reduce((total, meta) => total + meta.valorMeta, 0);
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(NovaMetaDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.carregarMetas();
      }
    });
  }

  editMeta(meta: MetaFinanceiraResponseDTOComId): void {
    const dialogRef = this.dialog.open(NovaMetaDialogComponent, {
      width: '500px',
      data: meta,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.carregarMetas();
      }
    });
  }

  deletarMeta(id: number): void {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.metaService.deletarMeta(id.toString()).subscribe(
          () => {
            this.carregarMetas();
            Swal.fire(
              'Excluído!',
              'A meta foi excluída com sucesso.',
              'success'
            );
          },
          (error) => {
            Swal.fire('Erro!', 'Ocorreu um erro ao excluir a meta.', 'error');
          }
        );
      }
    });
  }
}
