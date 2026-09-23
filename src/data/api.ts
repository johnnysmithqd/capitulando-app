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

export type { Reading };
