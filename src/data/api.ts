// Camada de acesso a dados. HOJE: devolve os dados de exemplo de ./mock.
// PARA CONECTAR AO BACKEND (capitulando.com): troque o corpo de cada função
// por uma chamada HTTP e converta a resposta para os tipos de ./types.
// As telas só conhecem estas funções — não é preciso mexer nelas.
import * as mock from './mock';
import type { Book, Reading, ShelfStatus } from './types';

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// ---- Leitura (usuário logado)
export const getMe = () => delay(mock.me);
export const getReadings = () => delay(mock.readings);
export const getBook = (id: string) => delay(mock.books[id] ?? mock.books.memorias);

export const saveProgress = (bookId: string, page: number) => delay({ bookId, page });
export const setShelfStatus = (bookId: string, status: ShelfStatus) => delay({ bookId, status });
export interface ReadingDetails {
  bookId: string;
  rating?: number;
  review?: string;
  spoiler: boolean;
  tags: string[];
  isPublic: boolean;
}
export const saveReadingDetails = (d: ReadingDetails) => delay(d);

// ---- Início
export const getHome = () =>
  delay({
    agenda: mock.todayAgenda,
    unreadNotices: mock.unreadNotices,
    pageOfTheDay: mock.pageOfTheDay,
    clubFeed: mock.clubFeed,
    because: { title: mock.becauseYouRead.title, books: mock.becauseYouRead.bookIds.map((id) => mock.books[id]) },
  });

// ---- Livro
export const getBookDetails = (id: string) => delay(mock.bookDetails(id));
export const searchBooks = (q: string): Promise<Book[]> =>
  delay(
    q.trim()
      ? Object.values(mock.books).filter((b) => (b.title + ' ' + b.author).toLowerCase().includes(q.trim().toLowerCase()))
      : mock.searchCatalog,
  );

// ---- Perfil
export const getProfile = () =>
  delay({
    shelves: mock.shelves,
    lists: mock.lists,
    diary: mock.diary,
    stats: mock.stats,
    clubs: mock.myClubs,
    projects: mock.myProjects,
    favorites: ['torto', 'despejo', 'estrela', 'vista'].map((id) => mock.books[id]),
  });

// ---- Descobrir
export const getFeed = () => delay(mock.feed);
export const getForYou = () => delay(mock.forYou);
export const getExplore = () => delay({ rows: mock.explore, clubs: mock.clubs, projects: mock.projects });

// ---- Onboarding
export const getOnboarding = () => delay({ genres: mock.genres, books: mock.onboardingBooks, people: mock.suggestedPeople });
export interface OnboardingResult {
  genres: string[];
  ratings: Record<string, number>;
  follows: string[];
  yearGoal?: number;
}
export const finishOnboarding = (r: OnboardingResult) => delay(r);

// ---- Pessoas
export const getPerson = (id: string) => delay(mock.otherProfile(id));
export const follow = (personId: string, on: boolean) => delay({ personId, on });

// ---- Caixa (avisos e mensagens)
export const getNotices = () => delay(mock.notices);
export const markNoticesRead = (ids: string[]) => delay(ids);
export const getConversations = () => delay(mock.conversations);
export const getMessages = (conversationId: string) => delay(conversationId ? mock.messages : []);
export const sendMessage = (conversationId: string, text: string) => delay({ conversationId, text });

// ---- Listas e diário
export const getList = (id: string) => delay({ ...mock.listDetail, id });
export const getDiaryEntry = (bookId: string) => delay(mock.diaryEntry(bookId));

// ---- Conta
export interface ProfileUpdate {
  name: string;
  handle: string;
  bio: string;
  favorites: string[];
}
export const updateProfile = (u: ProfileUpdate) => delay(u);
export interface Settings {
  publicProfile: boolean;
  diaryVisibility: 'todos' | 'seguidores' | 'eu';
  spoilerVeil: boolean;
  notify: { clubes: boolean; desafios: boolean; projetos: boolean; resumo: boolean };
}
export const getSettings = () =>
  delay<Settings>({
    publicProfile: true,
    diaryVisibility: 'seguidores',
    spoilerVeil: true,
    notify: { clubes: true, desafios: true, projetos: false, resumo: true },
  });
export const saveSettings = (s: Settings) => delay(s);
export const logout = () => delay(true);

export type { Reading };

// ---- Juntos (Fase 3)
export * from './juntos/criar';
