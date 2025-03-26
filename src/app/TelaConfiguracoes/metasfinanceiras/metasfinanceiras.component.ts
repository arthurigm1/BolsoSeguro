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
  showCreateModal = false;
  metaForm: FormGroup;
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
    // Implemente a lógica de cálculo de progresso conforme sua necessidade
    return 0; // Substitua pelo cálculo real
  }

  openCreateModal(): void {
    this.openModalEvent.emit();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.metaForm.reset();
  }
}
