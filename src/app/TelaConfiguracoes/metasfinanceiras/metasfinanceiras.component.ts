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

    // Preenche o formulário com os valores da meta selecionada
    this.metaForm.patchValue({
      nome: meta.nome,
      valorMeta: meta.valorMeta,
    });
  }

  closeModal(): void {
    this.selectedMeta = null;
    this.metaForm.reset();
  }

  atualizarMeta(): void {
    // Verifica se o formulário é válido e há uma meta selecionada
    if (this.metaForm.valid && this.selectedMeta) {
      this.isSaving = true;

      // Pega os valores do formulário
      const formValues = this.metaForm.value;
      const valorAtual = this.selectedMeta.valorAtual ?? 0;

      // Cria o objeto com os dados atualizados
      const metaAtualizada: MetaFinanceiraRequestDTO = {
        nome: formValues.nome,
        valorMeta: Number(formValues.valorMeta),
        valorAtual: Number(valorAtual),
      };

      this.metaService
        .editarMeta(
          this.selectedMeta.id.toString(),
          metaAtualizada.nome,
          metaAtualizada.valorMeta,
          metaAtualizada.valorAtual ?? 0
        )
        .subscribe({
          next: () => {
            this.toasrtservice.success('Meta atualizada com sucesso!');
            this.carregarMetas();
            this.closeModal();
          },
          error: (err) => {
            this.isSaving = false;
            this.toasrtservice.error('Erro ao atualizar meta');
            console.error('Erro ao atualizar meta:', err);
          },
          complete: () => {
            this.isSaving = false;
          },
        });
    } else {
      // Marca os campos como tocados para mostrar erros de validação
      this.metaForm.markAllAsTouched();
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
