import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MetaFinanceiraResponseDTO } from '../../Interface/MetaFinanceiraResponseDTO.interface';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MetaService } from '../../Services/MetaService/meta.service';

@Component({
  selector: 'app-metasfinanceiras',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './metasfinanceiras.component.html',
  styleUrl: './metasfinanceiras.component.scss',
})
export class MetasfinanceirasComponent implements OnInit {
  metas: MetaFinanceiraResponseDTO[] = [];

  metaForm: FormGroup;
  selectedMeta: MetaFinanceiraResponseDTO | null = null;

  @Output() openModalEvent = new EventEmitter<void>();

  constructor(private metaService: MetaService, private fb: FormBuilder) {
    this.metaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      valorMeta: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    this.carregarMetas();
  }

  carregarMetas(): void {
    this.metaService.listarMetas().subscribe({
      next: (metas) => {
        this.metas = metas.map((meta) => ({
          ...meta,
          progresso: this.calcularProgresso(meta),
        }));
      },
      error: (err) => {
        console.error('Erro ao carregar metas', err);
      },
    });
  }

  calcularProgresso(meta: MetaFinanceiraResponseDTO): number {
    return Math.round(((meta.valorAtual ?? 0) / meta.valorMeta) * 100);
  }

  openCreateModal(): void {
    this.openModalEvent.emit();
  }

  editMeta(meta: MetaFinanceiraResponseDTO): void {
    this.selectedMeta = { ...meta };
    this.metaForm.patchValue({
      nome: meta.nome,
      valorMeta: meta.valorMeta,
    });
  }

  closeModal(): void {
    this.selectedMeta = null;
    this.metaForm.reset();
  }

  criarMeta(): void {
    if (this.metaForm.invalid) return;

    const novaMeta = {
      nome: this.metaForm.value.nome,
      valorMeta: this.metaForm.value.valorMeta,
      valorAtual: 0,
    };

    this.metaService.criarMeta(novaMeta).subscribe({
      next: () => {
        this.carregarMetas();
      },
      error: (err) => {
        console.error('Erro ao criar meta', err);
      },
    });
  }

  saveMeta(): void {}
}
