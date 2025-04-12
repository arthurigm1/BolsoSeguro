import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CartaoService } from '../../Services/CartaoService/cartao.service';
import { ContaService } from '../../Services/ContaService/conta.service';
import { ToastrService } from 'ngx-toastr';
import { CartaoResponseDTO } from '../../Interface/CartaoDTO.interface';
import { TransacoesService } from '../../Services/TransacaoService/transacoes.service';
import { ReceitaService } from '../../Services/ReceitaService/receita.service';
import { DespesaService } from '../../Services/DespesaService/despesa.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-nova-transacao-dialog',
  templateUrl: './nova-transacao-dialog.component.html',
  styleUrls: ['./nova-transacao-dialog.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})
export class NovaTransacaoDialogComponent implements OnInit {
  form: FormGroup;
  cartoes: CartaoResponseDTO[] = [];
  contas: { id: string; nome: string }[] = [];
  categoriasDespesas: any[] = [];
  categoriasReceitas: any[] = [];
  isLoading = false;
  step: 'select' | 'form' = 'select';
  tipoTransacao?: 'DESPESA' | 'RECEITA';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NovaTransacaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cartaoService: CartaoService,
    private contaService: ContaService,
    private transacaoService: TransacoesService,
    private toastr: ToastrService,
    private despesaService: DespesaService,
    private receitaService: ReceitaService
  ) {
    this.form = this.fb.group({
      valor: ['', [Validators.required, Validators.min(0.01)]],
      data: [new Date().toISOString().substring(0, 10), Validators.required],
      categoria: ['', Validators.required],
      descricao: ['', Validators.required],
      contaId: ['', Validators.required],
      cartaoId: [''],
      tipoPagamento: ['CONTA'],
    });
  }

  ngOnInit(): void {
    // Se já veio com tipo definido, vai direto para o form
    if (this.data?.tipo) {
      this.tipoTransacao = this.data.tipo;
      this.step = 'form';
      this.loadData();
    }
  }

  selectTipo(tipo: 'DESPESA' | 'RECEITA'): void {
    this.tipoTransacao = tipo;
    this.step = 'form';
    this.loadData();
  }

  backToSelection(): void {
    this.step = 'select';
    this.tipoTransacao = undefined;
  }

  async loadData() {
    try {
      this.isLoading = true;

      // Carregar contas
      this.contaService.getSaldoContas().subscribe((contas) => {
        this.contas = contas;
      });

      // Carregar categorias
      if (this.tipoTransacao === 'DESPESA') {
        this.transacaoService
          .obterCategoriasDespesas()
          .subscribe((categorias) => {
            this.categoriasDespesas = categorias;
          });
      } else {
        this.transacaoService
          .obterCategoriasReceitas()
          .subscribe((categorias) => {
            this.categoriasReceitas = categorias;
          });
      }

      // Carregar cartões apenas para despesas
      if (this.tipoTransacao === 'DESPESA') {
        this.cartaoService.buscarCartoesPorUsuario().subscribe((cartoes) => {
          this.cartoes = cartoes;
        });
      }
    } catch (error) {
      this.toastr.error('Erro ao carregar dados');
    } finally {
      this.isLoading = false;
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      const formData = this.form.value;

      if (this.tipoTransacao === 'DESPESA') {
        this.despesaService.adicionarDespesa(formData).subscribe({
          next: () => {
            this.toastr.success('Despesa adicionada com sucesso!');
            this.dialogRef.close(true);
          },
          error: () => {
            this.toastr.error('Erro ao adicionar despesa');
            this.isLoading = false;
          },
        });
      } else {
        this.receitaService.adicionarReceita(formData).subscribe({
          next: () => {
            this.toastr.success('Receita adicionada com sucesso!');
            this.dialogRef.close(true);
          },
          error: () => {
            this.toastr.error('Erro ao adicionar receita');
            this.isLoading = false;
          },
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
