import { router, useLocalSearchParams } from 'expo-router';
import { Bookmark, BookOpen, Check, ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '../src/components/BookCover';
import { Sheet } from '../src/components/Sheet';
import { T } from '../src/components/ui';
import { useStore } from '../src/data/store';
import type { ShelfStatus } from '../src/data/types';
import { colors, fonts, radius, type } from '../src/theme';

export default function Status() {
  const { id = 'quincas' } = useLocalSearchParams<{ id?: string }>();
  const store = useStore();
  const book = store.book(id);
  const atual = store.reading(id)?.status;

  const escolher = (st: ShelfStatus) => {
    store.setStatus(id, st);
    if (st === 'lendo') router.replace({ pathname: '/progresso', params: { id } });
    else if (st === 'lido') router.replace({ pathname: '/detalhes', params: { id, terminei: '1' } });
    else router.back();
  };

  return (
    <Sheet onBack={() => router.replace('/busca')}>
      <View style={{ paddingHorizontal: 20, alignItems: 'center', gap: 6 }}>
        <BookCover book={book} width={114} />
        <Text style={[type.h1, { textAlign: 'center', marginTop: 16 }]}>{book.title}</Text>
        <T style={type.small}>
          {book.author} · <Text style={{ fontFamily: fonts.monoBold }}>{book.pages} páginas</Text>
        </T>
        <T style={{ marginVertical: 14, color: colors.inkSoft }}>Como esse livro está na sua vida?</T>

        <Option
          icon={<BookOpen size={22} color={colors.ink} />}
          title="Lendo"
          sub="entra em Lendo agora"
          on={atual === 'lendo' || !atual}
          onPress={() => escolher('lendo')}
        />
        <Option icon={<Check size={22} color={colors.ink} />} title="Lido" sub="vai para o diário com a data de hoje" on={atual === 'lido'} onPress={() => escolher('lido')} />
        <Option icon={<Bookmark size={22} color={colors.ink} />} title="Quero ler" sub="guarda na estante, sem pressa" on={atual === 'quero-ler'} onPress={() => escolher('quero-ler')} />

        <Pressable onPress={() => escolher('abandonei')} style={{ paddingVertical: 12 }}>
          <T style={{ color: colors.muted }}>Abandonei</T>
        </Pressable>
      </View>
    </Sheet>
  );
}

function Option({ icon, title, sub, on, onPress }: { icon: ReactNode; title: string; sub: string; on?: boolean; onPress: () => void }) {
  return (
    <Pressable style={[s.opt, on && { backgroundColor: colors.accentSoft }]} onPress={onPress}>
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={[type.title, on && { color: colors.accentDark }]}>{title}</Text>
        <T style={type.small}>{sub}</T>
      </View>
      <ChevronRight size={18} color={colors.muted} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  opt: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    marginBottom: 8,
  },
});
