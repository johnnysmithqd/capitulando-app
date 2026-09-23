// Criação de clube e de projeto (Juntos). HOJE: devolve rascunhos e opções de exemplo.
// PARA CONECTAR AO BACKEND (capitulando.com): troque o corpo de cada função
// por uma chamada HTTP e converta a resposta para os tipos abaixo.
// As telas só conhecem estas funções — não é preciso mexer nelas.
import { books } from '../mock';
import type { Book } from '../types';

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// ---- Tipos: clube

export type ClubPace = 'um' | 'tres' | 'livre';

/** Livro que pode abrir o clube, com as partes usadas no cronograma (contos, capítulos…). */
export interface ClubBookOption {
  book: Book;
  parts: number;
  unit: { one: string; many: string }; // ex.: conto / contos
}

export interface ClubScheduleRow {
  dates: string; // "6–12 out"
  label: string; // "Contos 1–3"
}

export interface ClubDraft {
  name: string;
  about: string;
  where: string[];
  genres: string[];
  bookId: string;
  pace: ClubPace;
  session: string;
  price: number; // Cadeira, R$ por mês; 0 = só porta aberta
}

export interface ClubSetup {
  draft: ClubDraft;
  whereOptions: string[];
  genreOptions: string[];
  bookOptions: ClubBookOption[];
  sessionOptions: string[];
  startDate: string; // ISO, início do primeiro livro
  city: string;
  priceRange: string;
  houseFee: number; // fração que a casa fica
  benefits: string[];
}

export interface CreatedClub {
  id: string;
  draft: ClubDraft;
}

// ---- Tipos: projeto

export type ProjectDeadline = 30 | 45 | 60;

export interface ProjectReward {
  id: string;
  title: string;
  price: number;
  physical: boolean;
  details: string; // "digital · nov 2026 · sem limite"
}

export interface ProjectDraft {
  title: string;
  summary: string;
  story: string;
  goal: number;
  deadline: ProjectDeadline;
  rewards: ProjectReward[];
  openSupport: boolean; // aceitar "só apoiar", qualquer valor
}

export interface ProjectCheck {
  title: string;
  text: string;
  done: boolean;
}

export interface ProjectSetup {
  draft: ProjectDraft;
  byline: string; // "Coletivo Mangue · 24 poetas inéditos"
  deadlines: ProjectDeadline[];
  startDate: string; // ISO; o prazo conta a partir daqui
  expectedBackers: number;
  fee: { pct: number; perBacker: number };
  costHint: string;
  deadlineHint: string;
  minSupport: number;
  checks: ProjectCheck[];
}

export interface CreatedProject {
  id: string;
  draft: ProjectDraft;
}

// ---- Dados de exemplo

const clubBooks: ClubBookOption[] = [
  { book: books.olhos, parts: 15, unit: { one: 'conto', many: 'contos' } },
  { book: books.insubmissas, parts: 13, unit: { one: 'conto', many: 'contos' } },
  { book: books.becos, parts: 12, unit: { one: 'capítulo', many: 'capítulos' } },
  { book: books.poncia, parts: 10, unit: { one: 'capítulo', many: 'capítulos' } },
].filter((o) => !!o.book);

const clubSetup: ClubSetup = {
  draft: {
    name: 'Sarau da Rua Nova',
    about: 'Poesia brasileira contemporânea, um livro por mês, com sarau no fim. Recife, presencial, com transmissão.',
    where: ['Presencial · Recife', 'On-line'],
    genres: ['Poesia', 'Literatura brasileira'],
    bookId: 'olhos',
    pace: 'tres',
    session: 'toda quinta · 19h30 · 1 h',
    price: 24,
  },
  whereOptions: ['Presencial · Recife', 'On-line'],
  genreOptions: ['Poesia', 'Literatura brasileira', 'Contos', 'Romance', 'Não ficção', 'Teatro', 'Quadrinhos'],
  bookOptions: clubBooks,
  sessionOptions: ['toda quinta · 19h30 · 1 h', 'toda terça · 20h · 1 h', 'sábado sim, sábado não · 10h · 1 h 30'],
  startDate: '2026-10-06',
  city: 'Recife',
  priceRange: 'Clubes parecidos em Recife cobram entre R$ 18 e R$ 34.',
  houseFee: 0.14,
  benefits: ['Sessões ao vivo e gravações', 'Material (PDFs, áudios) no mural'],
};

const projectSetup: ProjectSetup = {
  draft: {
    title: 'Antologia Poetas do Recife',
    summary: '24 poetas inéditos da cidade num livro impresso. Coletivo Mangue, 2026.',
    story:
      'Há dois anos o Coletivo Mangue faz sarau na Rua Nova toda última sexta. Vinte e quatro vozes que ninguém publicou ainda. Queremos imprimir 500 exemplares e distribuir metade em escolas públicas da Zona Norte.',
    goal: 15000,
    deadline: 45,
    rewards: [
      { id: 'pdf', title: 'PDF + nome nos agradecimentos', price: 25, physical: false, details: 'digital · nov 2026 · sem limite' },
      { id: 'livro', title: 'Livro impresso', price: 60, physical: true, details: 'Correios · dez 2026 · 250 unidades' },
      { id: 'sarau', title: 'Livro + entrada no sarau de lançamento', price: 120, physical: true, details: 'Correios + presencial · dez 2026 · 40 unidades' },
    ],
    openSupport: true,
  },
  byline: 'Coletivo Mangue · 24 poetas inéditos',
  deadlines: [30, 45, 60],
  startDate: '2026-09-19',
  expectedBackers: 300,
  fee: { pct: 0.05, perBacker: 0.5 },
  costHint: 'Impressão de 500 exemplares em Recife costuma custar entre R$ 9 e R$ 14 mil. Deixe folga para frete.',
  deadlineHint: 'Projetos de 45 dias batem a meta com mais frequência que os de 60.',
  minSupport: 5,
  checks: [
    { title: 'Conta para receber', text: 'Pix ligado (coletivo.mangue@…)', done: true },
    { title: 'Identidade verificada', text: 'CPF do responsável', done: true },
    { title: 'Taxa', text: '5% + R$ 0,50 por apoio, só se a meta bater. Repasse em até 7 dias após o prazo.', done: false },
  ],
};

// ---- Cronograma sugerido (a casa monta; quem conduz ajusta)

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d;
}

function faixa(a: Date, b: Date) {
  if (a.getMonth() === b.getMonth()) return `${a.getDate()}–${b.getDate()} ${MESES[b.getMonth()]}`;
  return `${a.getDate()} ${MESES[a.getMonth()]}–${b.getDate()} ${MESES[b.getMonth()]}`;
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function montarCronograma(opt: ClubBookOption, pace: ClubPace, startIso: string): ClubScheduleRow[] {
  const porSemana = pace === 'um' ? 1 : 3;
  // Ritmo livre: um bloco só, com a mesma duração do ritmo sugerido
  if (pace === 'livre') {
    const semanas = Math.ceil(opt.parts / 3);
    return [{ dates: faixa(addDays(startIso, 0), addDays(startIso, semanas * 7 - 1)), label: `${cap(opt.unit.many)} 1–${opt.parts} + sarau` }];
  }
  const rows: ClubScheduleRow[] = [];
  for (let i = 0, w = 0; i < opt.parts; i += porSemana, w++) {
    const a = i + 1;
    const b = Math.min(opt.parts, i + porSemana);
    const label = a === b ? `${cap(opt.unit.one)} ${a}` : `${cap(opt.unit.many)} ${a}–${b}`;
    rows.push({ dates: faixa(addDays(startIso, w * 7), addDays(startIso, w * 7 + 6)), label });
  }
  rows[rows.length - 1].label += ' + sarau';
  return rows;
}

// ---- API

export const getClubSetup = () => delay(clubSetup);

export const getClubSchedule = (bookId: string, pace: ClubPace) => {
  const opt = clubBooks.find((o) => o.book.id === bookId) ?? clubBooks[0];
  const rows = montarCronograma(opt, pace, clubSetup.startDate);
  const weeks = pace === 'livre' ? Math.ceil(opt.parts / 3) : rows.length;
  return delay({ rows, weeks }, 60);
};

export const createClub = (draft: ClubDraft) => delay<CreatedClub>({ id: 'sarau', draft }, 300);

export const getProjectSetup = () => delay(projectSetup);

export const createProject = (draft: ProjectDraft) => delay<CreatedProject>({ id: 'poetas', draft }, 300);
