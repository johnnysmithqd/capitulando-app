// Estado compartilhado da sessão (leituras do usuário). As alterações são
// otimistas: a tela atualiza na hora e a chamada vai para ./api em seguida.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as api from './api';
import { books } from './mock';
import type { Book, Reading, ShelfStatus } from './types';

interface Store {
  readings: Reading[];
  book: (id: string) => Book;
  reading: (bookId: string) => Reading | undefined;
  byStatus: (s: ShelfStatus) => { book: Book; reading: Reading }[];
  setPage: (bookId: string, page: number) => void;
  setStatus: (bookId: string, status: ShelfStatus) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    api.getReadings().then(setReadings);
  }, []);

  const upsert = useCallback((bookId: string, patch: Partial<Reading>) => {
    setReadings((rs) => {
      const i = rs.findIndex((r) => r.bookId === bookId);
      if (i < 0) return [{ bookId, status: 'lendo', page: 0, ...patch }, ...rs];
      const next = [...rs];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }, []);

  const value = useMemo<Store>(
    () => ({
      readings,
      book: (id) => books[id] ?? books.memorias,
      reading: (bookId) => readings.find((r) => r.bookId === bookId),
      byStatus: (s) =>
        readings.filter((r) => r.status === s).map((reading) => ({ reading, book: books[reading.bookId] ?? books.memorias })),
      setPage: (bookId, page) => {
        upsert(bookId, { page });
        api.saveProgress(bookId, page);
      },
      setStatus: (bookId, status) => {
        upsert(bookId, status === 'lido' ? { status, page: (books[bookId] ?? books.memorias).pages } : { status });
        api.setShelfStatus(bookId, status);
      },
    }),
    [readings, upsert],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fora do StoreProvider');
  return s;
}

/** Carrega dados de uma função de ./api. */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    fn().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
}
