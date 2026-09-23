// Modelos usados pelas telas. Quem for conectar ao backend do capitulando.com
// deve mapear as respostas da API para estes tipos (ver src/data/api.ts).

export type ShelfStatus = 'lendo' | 'lido' | 'quero-ler' | 'abandonei';

export interface Book {
  id: string;
  title: string;
  author: string;
  edition?: string; // ex.: "Companhia das Letras, 2014"
  year?: number;
  pages: number;
  coverColor: string; // cor usada enquanto não há imagem de capa
  coverUrl?: string;
}

export interface Reading {
  bookId: string;
  status: ShelfStatus;
  page: number;
  rating?: number; // 0–5, aceita meia estrela (4.5)
  finishedAt?: string; // ISO
  tag?: string; // "releitura", "resenha", nome do clube...
}

export interface User {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  memberSince: number;
  bio: string[];
  stats: { books: number; followers: number; following: number };
  links: { kind: 'instagram' | 'youtube' | 'site'; label: string }[];
  yearGoal: { year: number; target: number; done: number; note: string };
  streakDays: number;
}

export interface Agenda {
  id: string;
  time: string;
  sub: string; // "36 min" / "em 2h"
  title: string;
  context: string;
  action?: string; // rótulo do botão, ex.: "entrar"
  highlight?: boolean;
}

export interface ClubPost {
  id: string;
  kind: 'enquete' | 'aviso' | 'post' | 'terminaram';
  title: string;
  sub: string;
  initials?: string;
  avatarBg?: string;
  avatarFg?: string;
}

export interface Review {
  id: string;
  author: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  when: string;
  rating: number;
  text: string;
  spoilerPage?: number;
}

export interface Quote {
  id: string;
  text: string;
  where: string;
  count: number;
  spoiler?: string;
}

export interface FriendReading {
  name: string;
  rating?: number;
  badge?: string;
}

export interface ClubSummary {
  id: string;
  name: string;
  desc: string;
  meta: string;
  iconBg: string;
  iconFg: string;
  open?: boolean;
  coverColor?: string;
  coverTitle?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  desc: string;
  pct: number;
  raised: string;
  daysLeft: string;
  coverColor?: string;
}

export interface BookDetails {
  book: Book;
  rating: number;
  ratingsCount: number;
  distribution: number[]; // 1★..5★, 0–1
  friends: { count: number; avg: number; list: FriendReading[] };
  reviewsCount: number;
  reviews: Review[];
  quotes: Quote[];
  clubs: ClubSummary[];
  project?: ProjectSummary;
  alsoRead: Book[];
  editions: { id: string; label: string; sub: string; coverColor: string; mine?: boolean }[];
}

export interface DiaryMonth {
  month: string;
  items: { day: string; mon: string; book: Book; rating: number; extra?: string }[];
}

export interface Stats {
  pagesPerMonth: { m: string; v: number }[];
  pagesYear: number;
  booksYear: number;
  booksLife: number;
  avgRating: number;
  communityAvg: number;
  streak: number;
  streakRecord: number;
  authorOfYear: { name: string; sub: string };
  genres: { name: string; pct: number }[];
}

export interface ShelfSummary {
  status: ShelfStatus;
  label: string;
  count: number;
  covers: string[];
}

export interface List {
  id: string;
  name: string;
  meta: string;
  private?: boolean;
}

// ---- Fase 2

export interface Person {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  why?: string; // motivo da sugestão
}

export type FeedItem =
  | { id: string; kind: 'terminou'; who: Person; when: string; book: Book; rating: number; text: string; likes: number; comments: number }
  | { id: string; kind: 'citacao'; who: Person; when: string; book: Book; quote: string; page: number; likes: number; comments: number }
  | { id: string; kind: 'avancou'; who: Person; when: string; book: Book; page: number; challenge?: string; likes: number; comments: number }
  | { id: string; kind: 'resenha'; who: Person; when: string; book: Book; rating: number; badge?: string; text: string; spoilerPage?: number; likes: number; comments: number }
  | { id: string; kind: 'sessao'; club: string; day: string; mon: string; title: string; when: string; confirmed: number };

export interface Recommendation {
  reason: string;
  book: Book;
  blurb: string;
}

export interface Notice {
  id: string;
  group: 'hoje' | 'semana' | 'antes';
  kind: 'clube' | 'desafio' | 'projeto' | 'pessoa' | 'casa';
  initials: string;
  who: string;
  text: string;
  when: string;
  action?: string;
  unread: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  preview: string;
  when: string;
  unread: number;
  group?: boolean;
  muted?: boolean;
}

export interface Message {
  id: string;
  text: string;
  mine: boolean;
  time: string;
}

export interface ListDetail {
  id: string;
  name: string;
  description: string;
  owner: string;
  isPublic: boolean;
  saves: number;
  updated: string;
  items: { book: Book; note?: string }[];
}

export interface OtherProfile extends Person {
  bio: string;
  stats: { books: number; followers: number; following: number };
  inCommon: { count: number; text: string; covers: string[] };
  favorites: Book[];
  reading: { book: Book; chapter: string; pct: number };
  diaryPrivate: boolean;
}

export interface DiaryEntry {
  book: Book;
  rating: number;
  finished: string;
  days: number;
  kind?: string;
  text?: string;
}
