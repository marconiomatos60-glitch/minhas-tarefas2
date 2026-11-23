import { Component, OnInit } from '@angular/core';

export type CategoriaTarefa = 'Trabalho' | 'Casa' | 'Saúde' | 'Estudos';
export type PrioridadeTarefa = 'Alta' | 'Média' | 'Baixa';

export interface FocoItem {
  id: number;
  titulo: string;
  concluida: boolean;
  prioritario: boolean;
}

export interface Tarefa {
  id: number;
  titulo: string;
  categoria: CategoriaTarefa;
  prioridade: PrioridadeTarefa;
  concluida: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  private readonly STORAGE_ATIVIDADES = 'minhas_tarefas_atividades_v1';
  private readonly STORAGE_FOCO = 'minhas_tarefas_foco_v1';

  dataAtualTexto = '';
  categoriaSelecionada: 'Todas' | CategoriaTarefa = 'Todas';
  caixaAberta = false;

  categorias: Array<'Todas' | CategoriaTarefa> = [
    'Todas',
    'Trabalho',
    'Casa',
    'Saúde',
    'Estudos',
  ];

  novaTarefaTitulo = '';
  novaTarefaPrioridade: PrioridadeTarefa = 'Média';

  focoPrincipal: FocoItem[] = [
    { id: 101, titulo: 'Revisar projeto', concluida: false, prioritario: true },
    { id: 102, titulo: 'Estudar programação', concluida: false, prioritario: false },
    { id: 103, titulo: 'Finalizar atividades', concluida: false, prioritario: false },
  ];

  atividades: Tarefa[] = [
    { id: 1, titulo: 'Revisar e-mails', categoria: 'Trabalho', prioridade: 'Alta', concluida: false },
    { id: 2, titulo: 'Pagar contas', categoria: 'Casa', prioridade: 'Média', concluida: false },
    { id: 3, titulo: 'Treino 45 minutos', categoria: 'Saúde', prioridade: 'Alta', concluida: false },
    { id: 4, titulo: 'Ler 15 páginas', categoria: 'Estudos', prioridade: 'Baixa', concluida: false },
  ];

  ngOnInit(): void {
    this.atualizarDataFormatada();
    this.carregarDados();
  }

  atualizarDataFormatada(): void {
    const hoje = new Date();
    this.dataAtualTexto = hoje.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  selecionarCategoria(categoria: 'Todas' | CategoriaTarefa): void {
    if (this.categoriaSelecionada === categoria && categoria !== 'Todas') {
      this.caixaAberta = !this.caixaAberta;
    } else {
      this.categoriaSelecionada = categoria;
      this.caixaAberta = categoria !== 'Todas';
    }
  }

  fecharCaixa(): void {
    this.caixaAberta = false;
    this.novaTarefaTitulo = '';
  }

  adicionarTarefa(): void {
    if (this.categoriaSelecionada === 'Todas') return;
    const titulo = this.novaTarefaTitulo.trim();
    if (!titulo) return;

    this.atividades.unshift({
      id: Date.now(),
      titulo,
      categoria: this.categoriaSelecionada,
      prioridade: this.novaTarefaPrioridade,
      concluida: false,
    });

    this.novaTarefaTitulo = '';
    this.novaTarefaPrioridade = 'Média';
    this.salvarDados();
  }

  removerTarefa(id: number): void {
    this.atividades = this.atividades.filter((t) => t.id !== id);
    this.salvarDados();
  }

  aoAlterarStatus(): void {
    this.salvarDados();
  }

  get atividadesFiltradas(): Tarefa[] {
    if (this.categoriaSelecionada === 'Todas') {
      return this.atividades;
    }
    return this.atividades.filter((t) => t.categoria === this.categoriaSelecionada);
  }

  get percentualProgresso(): number {
    const totalItens = this.focoPrincipal.length + this.atividades.length;
    if (totalItens === 0) return 0;

    const focoConcluido = this.focoPrincipal.filter((f) => f.concluida).length;
    const atividadesConcluidas = this.atividades.filter((a) => a.concluida).length;

    return Math.round(((focoConcluido + atividadesConcluidas) / totalItens) * 100);
  }

  getClassePrioridade(prioridade: PrioridadeTarefa): string {
    if (prioridade === 'Alta') return 'badge-alta';
    if (prioridade === 'Média') return 'badge-media';
    return 'badge-baixa';
  }

  private salvarDados(): void {
    try {
      localStorage.setItem(this.STORAGE_ATIVIDADES, JSON.stringify(this.atividades));
      localStorage.setItem(this.STORAGE_FOCO, JSON.stringify(this.focoPrincipal));
    } catch {
      // Ignora em ambientes sem localStorage acessível
    }
  }

  private carregarDados(): void {
    try {
      const atividadesSalvas = localStorage.getItem(this.STORAGE_ATIVIDADES);
      const focoSalvo = localStorage.getItem(this.STORAGE_FOCO);

      if (atividadesSalvas) {
        const parsed = JSON.parse(atividadesSalvas);
        if (Array.isArray(parsed)) this.atividades = parsed;
      }

      if (focoSalvo) {
        const parsed = JSON.parse(focoSalvo);
        if (Array.isArray(parsed)) this.focoPrincipal = parsed;
      }
    } catch {
      // Ignora em ambientes sem localStorage acessível
    }
  }
}
