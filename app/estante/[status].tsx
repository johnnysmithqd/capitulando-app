import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpDown, Check, ChevronLeft, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { menu } from '../../src/components/menu';
import { Button, Chip, IconButton, ProgressBar, Stars } from '../../src/components/ui';
import { useStore } from '../../src/data/store';
import type { ShelfStatus } from '../../src/data/types';
import { colors, fonts, type } from '../../src/theme';

const TITULO: Record<ShelfStatus, string> = { lendo: 'Lendo', lido: 'Lidos', 'quero-ler': 'Quero ler', abandonei: 'Abandonei' };
const ORDEM_LABEL = { recentes: 'recentes', nota: 'nota', titulo: 'título', autor: 'autor', paginas: 'páginas' } as const;

export default function Estante() {
  const { status = 'lido' } = useLocalSearchParams<{ status?: ShelfStatus }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { byStatus, estanteFiltro: f, setStatus, removeReading } = useStore();
  const [busca, setBusca] = useState<string | null>(null);
  const [sel, setSel] = useState<string[] | null>(null);
  const itens = useMemo(() => {
    const q = (busca ?? '').trim().toLowerCase();
    const list = byStatus(status).filter(
      (x) => (x.reading.rating ?? 0) >= f.notaMin && (!q || `${x.book.title} ${x.book.author}`.toLowerCase().includes(q)),
    );
    const by = {
      recentes: () => 0,
      nota: (a: (typeof list)[0], b: (typeof list)[0]) => (b.reading.rating ?? 0) - (a.reading.rating ?? 0),
      titulo: (a: (typeof list)[0], b: (typeof list)[0]) => a.book.title.localeCompare(b.book.title),
      autor: (a: (typeof list)[0], b: (typeof list)[0]) => a.book.author.localeCompare(b.book.author),
      paginas: (a: (typeof list)[0], b: (typeof list)[0]) => b.book.pages - a.book.pages,
    }[f.ordem];
    return [...list].sort(by);
  }, [byStatus, status, f, busca]);
  const filtrando = f.notaMin > 0 || f.genero !== 'todos' || f.ano !== 'todos';
  const col = (width - 40 - 24) / 3;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={s.head}>
        <IconButton label="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.ink} />
        </IconButton>
        <Text style={[type.h1, { flex: 1 }]}>
          {TITULO[status]} <Text style={s.count}>{itens.length}</Text>
        </Text>
        <IconButton label="Buscar na estante" onPress={() => setBusca(busca === null ? '' : null)}>
          <Search size={22} color={colors.ink} />
        </IconButton>
        <Pressable hitSlop={8} onPress={() => setSel(sel ? null : [])}>
          <Text style={s.link}>{sel ? 'Cancelar' : 'Selecionar'}</Text>
        </Pressable>
      </View>
      {busca !== null ? (
        <View style={s.busca}>
          <Search size={16} color={colors.muted} />
          <TextInput value={busca} onChangeText={setBusca} autoFocus placeholder="Título ou autor" placeholderTextColor={colors.faint} style={s.buscaInput} />
          <Pressable onPress={() => setBusca(null)} hitSlop={8} accessibilityLabel="Fechar busca">
            <X size={16} color={colors.muted} />
          </Pressable>
        </View>
      ) : null}
      <View style={s.filters}>
        <Chip label="Filtrar" active={filtrando} icon={<SlidersHorizontal size={16} color={colors.ink} />} onPress={() => router.push('/filtrar')} />
        <Chip label={ORDEM_LABEL[f.ordem]} icon={<ArrowUpDown size={16} color={colors.ink} />} onPress={() => router.push('/ordenar')} />
      </View>
      <FlatList
        data={itens}
        numColumns={3}
        keyExtractor={(i) => i.book.id}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24, gap: 18 }}
        renderItem={({ item }) => (
          <Pressable
            style={{ width: col, gap: 6 }}
            onPress={() =>
              sel
                ? setSel(sel.includes(item.book.id) ? sel.filter((x) => x !== item.book.id) : [...sel, item.book.id])
                : router.push(`/livro/${item.book.id}`)
            }
          >
            <View>
              <BookCover book={item.book} width={col} style={sel && !sel.includes(item.book.id) ? { opacity: 0.55 } : null} />
              {sel?.includes(item.book.id) ? (
                <View style={s.check}>
                  <Check size={14} color={colors.paper} strokeWidth={3} />
                </View>
              ) : null}
            </View>
            {status === 'lendo' ? (
              <ProgressBar pct={(item.reading.page / item.book.pages) * 100} height={4} />
            ) : item.reading.rating ? (
              <Stars value={item.reading.rating} />
            ) : null}
          </Pressable>
        )}
      />
      {sel?.length ? (
        <View style={[s.barra, { paddingBottom: insets.bottom + 12 }]}>
          <Button
            label={`Mover ${sel.length} ${sel.length === 1 ? 'livro' : 'livros'}`}
            style={{ flex: 1 }}
            onPress={() =>
              menu('Mover para', [
                ...(['lendo', 'lido', 'quero-ler', 'abandonei'] as ShelfStatus[])
                  .filter((st) => st !== status)
                  .map((st) => ({ label: TITULO[st], onPress: () => (sel.forEach((id) => setStatus(id, st)), setSel(null)) })),
                { label: 'Tirar das estantes', destrutiva: true, onPress: () => (sel.forEach(removeReading), setSel(null)) },
              ])
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6 },
  count: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.muted },
  link: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.accentDark, paddingHorizontal: 8 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  busca: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 12, height: 42, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.accentLine, backgroundColor: colors.paper },
  buscaInput: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  check: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  barra: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row' },
});
