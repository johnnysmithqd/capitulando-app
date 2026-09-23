import type { DiarioFiltro } from './store';
import type { DiaryMonth } from './types';

export function filtrarDiario(diary: DiaryMonth[], f: DiarioFiltro): DiaryMonth[] {
  return diary
    .map((m) => ({
      ...m,
      items: m.items.filter((it) => {
        if (f.ano !== 'todos' && !m.month.endsWith(f.ano)) return false;
        if (it.rating < f.notaMin) return false;
        if (f.tipo === 'resenha' && it.extra !== 'resenha') return false;
        if (f.tipo === 'releitura' && it.extra !== 'releitura') return false;
        if (f.tipo === 'clube' && !it.extra?.startsWith('Clube')) return false;
        return true;
      }),
    }))
    .filter((m) => m.items.length);
}
