import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  MetaFinanceiraRequestDTO,
  MetaFinanceiraResponseDTO,
  MetaFinanceiraResponseDTOComId,
} from '../../Interface/MetaFinanceiraResponseDTO.interface';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MetaService } from '../../Services/MetaService/meta.service';
import { ToastrService } from 'ngx-toastr';
import { th } from 'date-fns/locale';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-metasfinanceiras',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './metasfinanceiras.component.html',
  styleUrl: './metasfinanceiras.component.scss',
})
export class MetasfinanceirasComponent implements OnInit {
  metas: MetaFinanceiraResponseDTO[] = [];
  isLoading: boolean = true;
  isSaving: boolean = false;
  metaForm: FormGroup;
  selectedMeta: MetaFinanceiraResponseDTOComId | null = null;

  @Output() openModalEvent = new EventEmitter<void>();

  constructor(
    private metaService: MetaService,
    private fb: FormBuilder,
    private toasrtservice: ToastrService
  ) {
    this.metaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      valorMeta: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

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
        this.toasrtservice.error('Erro ao carregar metas financeiras');
      },
    });
  }

  calcularProgresso(meta: MetaFinanceiraResponseDTO): number {
    return Math.round(((meta.valorAtual ?? 0) / meta.valorMeta) * 100);
  }

  openCreateModal(): void {
    this.openModalEvent.emit();
  }

  editMeta(meta: MetaFinanceiraResponseDTOComId): void {
    this.selectedMeta = { ...meta };
  }

  closeModal(): void {
    this.selectedMeta = null;
    this.metaForm.reset();
  }

  atualizarMeta(): void {
    if (this.metaForm.valid && this.selectedMeta) {
      const { nome, valorMeta } = this.metaForm.value;
      const valorAtual = this.selectedMeta.valorAtual || 0;
      this.isSaving = true;
      this.metaService
        .editarMeta(
          this.selectedMeta.id.toString(),
          nome,
          valorMeta,
          valorAtual
        )
        .subscribe({
          next: (metaAtualizada) => {
            this.carregarMetas(); // Recarrega as metas para refletir as alterações
            this.closeModal(); // Fecha o modal após a atualização
            this.isSaving = false;
            this.toasrtservice.success(
              'Meta financeira atualizada com sucesso!'
            );
          },
          error: (err) => {
            this.isSaving = false;
            this.toasrtservice.error('Erro ao atualizar meta financeira');
          },
        });
    }
  }

  deletarMeta(id: number): void {
    // Exibe o SweetAlert2 para confirmar a exclusão
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
        // Se o usuário confirmar, chama o serviço de exclusão
        this.metaService.deletarMeta(id.toString()).subscribe(
          () => {
            this.carregarMetas(); // Atualiza a lista de metas após a exclusão
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
