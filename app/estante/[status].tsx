import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpDown, ChevronLeft, Search, SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { Chip, IconButton, ProgressBar, Stars } from '../../src/components/ui';
import { useStore } from '../../src/data/store';
import type { ShelfStatus } from '../../src/data/types';
import { colors, fonts, type } from '../../src/theme';

const TITULO: Record<ShelfStatus, string> = { lendo: 'Lendo', lido: 'Lidos', 'quero-ler': 'Quero ler', abandonei: 'Abandonei' };
const ORDENS = ['recentes', 'título', 'nota'] as const;

export default function Estante() {
  const { status = 'lido' } = useLocalSearchParams<{ status?: ShelfStatus }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { byStatus } = useStore();
  const [ordem, setOrdem] = useState<(typeof ORDENS)[number]>('recentes');
  const itens = useMemo(() => {
    const list = byStatus(status);
    if (ordem === 'título') return [...list].sort((a, b) => a.book.title.localeCompare(b.book.title));
    if (ordem === 'nota') return [...list].sort((a, b) => (b.reading.rating ?? 0) - (a.reading.rating ?? 0));
    return list;
  }, [byStatus, status, ordem]);
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
        <IconButton label="Buscar na estante">
          <Search size={22} color={colors.ink} />
        </IconButton>
        <Pressable hitSlop={8}>
          <Text style={s.link}>Selecionar</Text>
        </Pressable>
      </View>
      <View style={s.filters}>
        <Chip label="Filtrar" icon={<SlidersHorizontal size={16} color={colors.ink} />} />
        <Chip
          label={ordem}
          icon={<ArrowUpDown size={16} color={colors.ink} />}
          onPress={() => setOrdem(ORDENS[(ORDENS.indexOf(ordem) + 1) % ORDENS.length])}
        />
      </View>
      <FlatList
        data={itens}
        numColumns={3}
        keyExtractor={(i) => i.book.id}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24, gap: 18 }}
        renderItem={({ item }) => (
          <Pressable style={{ width: col, gap: 6 }} onPress={() => router.push(`/livro/${item.book.id}`)}>
            <BookCover book={item.book} width={col} />
            {status === 'lendo' ? (
              <ProgressBar pct={(item.reading.page / item.book.pages) * 100} height={4} />
            ) : item.reading.rating ? (
              <Stars value={item.reading.rating} />
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6 },
  count: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.muted },
  link: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.accentDark, paddingHorizontal: 8 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
});
