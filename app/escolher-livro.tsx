import { router, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '../src/components/BookCover';
import { Sheet } from '../src/components/Sheet';
import { Divider, ProgressBar, T } from '../src/components/ui';
import { useStore } from '../src/data/store';
import { colors, fonts, type } from '../src/theme';

/** Escolhe qual dos livros em curso vai receber a sessão ou as páginas. ?para=progresso|detalhes */
export default function EscolherLivro() {
  const { para = 'progresso' } = useLocalSearchParams<{ para?: 'progresso' | 'detalhes' }>();
  const { byStatus } = useStore();
  const lendo = byStatus('lendo');

  const ir = (id: string) =>
    router.replace(para === 'detalhes' ? { pathname: '/detalhes', params: { id, terminei: '1' } } : { pathname: '/progresso', params: { id } });

  return (
    <Sheet title={para === 'detalhes' ? 'Qual você terminou?' : 'Qual livro?'} subtitle={`${lendo.length} em curso`}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        {lendo.map(({ book, reading }, i) => {
          const pct = Math.round((reading.page / book.pages) * 100);
          return (
            <View key={book.id}>
              {i > 0 ? <Divider /> : null}
              <Pressable style={s.row} onPress={() => ir(book.id)}>
                <BookCover book={book} width={48} />
                <View style={{ flex: 1, gap: 4 }}>
                  <T style={type.title} numberOfLines={2}>
                    {book.title}
                  </T>
                  <T style={type.small}>{book.author}</T>
                  <ProgressBar pct={pct} height={4} />
                  <Text style={type.mono}>
                    p. {reading.page} de {book.pages} · {pct}%
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </Pressable>
            </View>
          );
        })}
        <Divider />
        <Pressable style={[s.row, { paddingVertical: 16 }]} onPress={() => router.replace('/busca')}>
          <Search size={20} color={colors.ink} />
          <Text style={s.outro}>Outro livro</Text>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>
      </ScrollView>
    </Sheet>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  outro: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
});
