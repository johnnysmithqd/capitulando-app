// Juntos: desafios, pódio, check-in e a aba Juntos. HOJE: devolve dados de exemplo.
// PARA CONECTAR AO BACKEND (capitulando.com): troque o corpo de cada função
// por uma chamada HTTP e converta a resposta para os tipos abaixo.
// As telas só conhecem estas funções (via ../api) — não é preciso mexer nelas.
import { books } from '../mock';

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// ---- Tipos
export interface ParticipanteDesafio {
  id: string;
  nome: string;
  ini: string;
  bg: string;
  fg: string;
  /** id em /pessoa/[id]; ausente quando é o próprio usuário */
  pessoaId?: string;
  eu?: boolean;
}

export interface RankingLinha {
  pessoa: ParticipanteDesafio;
  /** páginas no desafio; a do usuário é calculada na tela a partir da leitura atual */
  paginas: number;
  delta: string;
  tendencia: 'sobe' | 'desce' | 'igual';
  sequencia: number;
}

export interface MuralDesafioPost {
  id: string;
  autor: ParticipanteDesafio;
  quando: string;
  texto: string;
  foto: boolean;
  reacoes: string;
  livro: string;
  paginas: number;
}

export interface MensagemDesafio {
  id: string;
  autor: ParticipanteDesafio;
  texto: string;
  hora: string;
}

export interface Desafio {
  id: string;
  nome: string;
  resumo: string;
  meta: number;
  /** dias de sequência do usuário */
  minhaSequencia: number;
  /** base para calcular as páginas do usuário: total no desafio quando o livro estava na página indicada */
  base: { paginas: number; bookId: string; pagina: number };
  ranking: RankingLinha[];
  resumoSemana: { destaque: string; antes: string; depois: string };
  mural: MuralDesafioPost[];
  chat: MensagemDesafio[];
  conversaNovas: number;
  link: string;
}

export interface DesafioCard {
  id: string;
  nome: string;
  desc: string;
  /** 'grupo' usa as páginas do usuário (calculadas na tela) */
  tipo: 'grupo' | 'meta' | 'futuro';
  valor?: string;
  pct?: number;
}

export interface DesafioEncerrado {
  id: string;
  nome: string;
  desc: string;
}

export interface ItemJuntos {
  id: string;
  nome: string;
  linha1: string;
  linha2: string;
  cor?: string;
}

export interface LeituraColetiva {
  id: string;
  bookId: string;
  titulo: string;
  cor: string;
  pessoas: string;
  ritmo: string;
}

export interface JuntosResumo {
  desafios: DesafioCard[];
  encerrado: DesafioEncerrado;
  clubes: { participo: ItemJuntos[]; conduzo: ItemJuntos[] };
  projetos: { participo: (ItemJuntos & { envio: string })[]; conduzo: ItemJuntos[] };
  leituras: LeituraColetiva[];
}

export interface PodioLugar {
  pessoa: ParticipanteDesafio;
  pos: number;
  valor: string;
}

export interface Podio {
  id: string;
  nome: string;
  titulo: string;
  lugares: PodioLugar[];
  pessoas: number;
  total: string;
  dias: number;
  destaques: { rotulo: string; titulo: string; sub: string }[];
  selos: { id: 'lugar' | 'sequencia' | 'livros'; nome: string }[];
}

export type MetricaDesafio = 'paginas' | 'minutos' | 'livros' | 'dias';
export type PeriodoDesafio = 'semana' | 'mes' | 'tri' | 'custom';

export interface OpcoesDesafio {
  sugestoes: string[];
  nomePadrao: string;
  linkPadrao: string;
  inicio: string;
  inicioCurto: string;
  metricas: { id: MetricaDesafio; nome: string; desc: string; unidade: string }[];
  periodos: { id: PeriodoDesafio; nome: string; dias: number }[];
  metaPadrao: number;
}

export interface NovoDesafio {
  nome: string;
  metrica: MetricaDesafio;
  periodo: PeriodoDesafio;
  meta?: number;
}

export interface CheckinDesafio {
  desafioId: string;
  bookId: string;
  pagina: number;
  paginasNoDesafio: number;
  frase?: string;
  foto: boolean;
}

// ---- Dados de exemplo
const P: Record<string, ParticipanteDesafio> = {
  helena: { id: 'helena', nome: 'Helena', ini: 'HS', bg: '#F7E8B5', fg: '#6F5410', pessoaId: 'helena' },
  marina: { id: 'marina', nome: 'Marina', ini: 'MA', bg: '#CFE0D2', fg: '#3D5A41', eu: true },
  tiago: { id: 'tiago', nome: 'Tiago', ini: 'TB', bg: '#F6D8CE', fg: '#8E4A3C', pessoaId: 'tiago' },
  camila: { id: 'camila', nome: 'Camila', ini: 'CF', bg: '#DCD3E8', fg: '#4E4573', pessoaId: 'camila' },
  rafael: { id: 'rafael', nome: 'Rafael', ini: 'RN', bg: '#CFE0D2', fg: '#3D5A41', pessoaId: 'rafael' },
  luiza: { id: 'luiza', nome: 'Luiza', ini: 'LP', bg: '#F7E8B5', fg: '#6F5410', pessoaId: 'luiza' },
};

const setembro: Desafio = {
  id: 'setembro',
  nome: 'Setembro de 1.500 páginas',
  resumo: '5 pessoas · termina em 11 dias',
  meta: 1500,
  minhaSequencia: 9,
  base: { paginas: 1130, bookId: 'memorias', pagina: 196 },
  ranking: [
    { pessoa: P.helena, paginas: 1284, delta: '—', tendencia: 'igual', sequencia: 18 },
    { pessoa: P.marina, paginas: 1130, delta: '↑2', tendencia: 'sobe', sequencia: 9 },
    { pessoa: P.tiago, paginas: 964, delta: '↓1', tendencia: 'desce', sequencia: 4 },
    { pessoa: P.camila, paginas: 712, delta: '—', tendencia: 'igual', sequencia: 12 },
    { pessoa: P.rafael, paginas: 690, delta: '↓1', tendencia: 'desce', sequencia: 2 },
  ],
  resumoSemana: {
    destaque: '1.912 páginas',
    antes: 'O grupo leu ',
    depois: ' — recorde do mês. Helena manteve a maior sequência (18 dias). Você foi quem mais subiu: de 4º para 2º.',
  },
  mural: [
    {
      id: 'm1',
      autor: P.marina,
      quando: 'há 40 min',
      texto: 'o capítulo do emplasto me pegou de novo.',
      foto: true,
      reacoes: '3 · 1 comentário',
      livro: 'Memórias Póstumas',
      paginas: 16,
    },
    {
      id: 'm2',
      autor: P.tiago,
      quando: 'há 3 h',
      texto: 'Terminei O Avesso da Pele. Alguém aguenta conversar sobre o final?',
      foto: false,
      reacoes: '6 · 4 comentários',
      livro: 'O Avesso da Pele',
      paginas: 62,
    },
    {
      id: 'm3',
      autor: P.camila,
      quando: 'ontem',
      texto: 'Sequência de 12 dias. Meta é não quebrar até o fim do mês.',
      foto: false,
      reacoes: '8',
      livro: 'Grande Sertão',
      paginas: 28,
    },
  ],
  chat: [
    { id: 'c1', autor: P.luiza, texto: 'Gente, quem tá lendo Machado esse mês? Quero comparar edições.', hora: '18h02' },
    { id: 'c2', autor: P.marina, texto: 'Eu! Companhia das Letras, a de capa roxa.', hora: '18h10' },
    { id: 'c3', autor: P.tiago, texto: 'A Antofágica tem as ilustrações do Candido Portinari. Vale muito.', hora: '18h11' },
    { id: 'c4', autor: P.rafael, texto: 'Alguém aceita um desafio paralelo de só clássicos em outubro?', hora: '19h20' },
  ],
  conversaNovas: 3,
  link: 'capitulando.com/d/set1500-x7k',
};

const agosto: Podio = {
  id: 'agosto',
  nome: 'Agosto de 1.200 páginas',
  titulo: 'Campeã',
  // ordem de exibição: 2º, 1º, 3º
  lugares: [
    { pessoa: P.helena, pos: 2, valor: '1.212' },
    { pessoa: P.marina, pos: 1, valor: '1.284' },
    { pessoa: P.tiago, pos: 3, valor: '964' },
  ],
  pessoas: 5,
  total: '4.780',
  dias: 31,
  destaques: [
    { rotulo: 'Maior sequência', titulo: 'Helena · 31 dias', sub: 'não quebrou um dia' },
    { rotulo: 'Maior virada', titulo: 'Tiago · 5º → 3º', sub: 'na última semana' },
  ],
  selos: [
    { id: 'lugar', nome: 'Primeiro lugar' },
    { id: 'sequencia', nome: '21 dias seguidos' },
    { id: 'livros', nome: '3 livros terminados' },
  ],
};

const juntos: JuntosResumo = {
  desafios: [
    { id: 'setembro', nome: 'Setembro de 1.500 páginas', desc: '5 pessoas · termina em 11 dias', tipo: 'grupo' },
    { id: 'meta-anual', nome: 'Meta anual · 40 livros', desc: 'só você · termina em 31 de dez', tipo: 'meta', valor: '34 de 40', pct: 85 },
    { id: 'cortico-outubro', nome: 'Clube do Cortiço · outubro', desc: '24 membros · começa em 12 dias', tipo: 'futuro', valor: 'ainda não começou', pct: 0 },
  ],
  encerrado: { id: 'agosto', nome: 'Agosto de 1.200 páginas', desc: 'encerrado · você ficou em 1º · ver pódio' },
  clubes: {
    participo: [
      {
        id: 'cortico',
        nome: 'Clube do Cortiço',
        linha1: 'Leitura em voz alta · O Cortiço · qui, 19h30',
        linha2: 'você no cap. 11 do livro · 3 mensagens novas',
        cor: '#8C332B',
      },
    ],
    conduzo: [
      { id: 'sarau', nome: 'Sarau da Rua Nova', linha1: '18 membros · sessão sábado, 16h', linha2: '2 pedidos de entrada · 1 Pix vence amanhã', cor: '#6F5410' },
    ],
  },
  projetos: {
    participo: [
      {
        id: 'quadrinhos',
        nome: 'Memórias Póstumas em quadrinhos',
        linha1: 'você apoiou com R$ 90 · recompensa: capa dura assinada',
        linha2: '',
        envio: 'Postado nos Correios · chega até 28 de set',
      },
    ],
    conduzo: [{ id: 'poetas', nome: 'Antologia Poetas do Recife', linha1: '31% · 38 dias · 2 envios pendentes', linha2: '' }],
  },
  leituras: [
    {
      id: 'lc1',
      bookId: 'memorias',
      titulo: books.memorias.title,
      cor: books.memorias.coverColor,
      pessoas: 'com Tiago e Camila · até 12 out',
      ritmo: 'você p. 196 · grupo na p. 140',
    },
    {
      id: 'lc2',
      bookId: 'despejo',
      titulo: books.despejo.title,
      cor: books.despejo.coverColor,
      pessoas: 'com Luiza · começa 1 out',
      ritmo: '2 capítulos por semana',
    },
  ],
};

const opcoes: OpcoesDesafio = {
  sugestoes: ['Maratona de férias', '30 dias, 30 páginas', 'Só autoras'],
  nomePadrao: 'Outubro dos clássicos',
  linkPadrao: 'capitulando.com/d/out-classicos',
  inicio: '20 de setembro',
  inicioCurto: '20 de set',
  metricas: [
    { id: 'paginas', nome: 'Páginas', desc: 'justo para quem lê calhamaço', unidade: 'páginas' },
    { id: 'minutos', nome: 'Minutos', desc: 'conta a sessão, não o livro', unidade: 'minutos' },
    { id: 'livros', nome: 'Livros', desc: 'simples, mas pune livro grosso', unidade: 'livros' },
    { id: 'dias', nome: 'Dias lidos', desc: 'constância, não volume', unidade: 'dias lidos' },
  ],
  periodos: [
    { id: 'semana', nome: '1 semana', dias: 7 },
    { id: 'mes', nome: '1 mês', dias: 30 },
    { id: 'tri', nome: '3 meses', dias: 90 },
    { id: 'custom', nome: 'Escolher datas', dias: 30 },
  ],
  metaPadrao: 1500,
};

// ---- Funções (ponto de integração)
export const getJuntos = () => delay(juntos);
export const getDesafio = (id: string) => delay(id === setembro.id ? setembro : { ...setembro, id });
export const getPodio = (id: string) => delay(id === agosto.id ? agosto : { ...agosto, id });
export const getOpcoesDesafio = () => delay(opcoes);

export const createChallenge = (d: NovoDesafio) =>
  delay({
    ...d,
    id:
      d.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'novo-desafio',
  });
export const sendCheckin = (c: CheckinDesafio) => delay(c);
export const sendChallengeMessage = (desafioId: string, texto: string) => delay({ desafioId, texto });
export const inviteToChallenge = (desafioId: string, via: 'link' | 'whatsapp' | 'seguindo') => delay({ desafioId, via });
