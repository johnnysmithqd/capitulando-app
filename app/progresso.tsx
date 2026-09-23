import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronRight, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '../src/components/BookCover';
import { Sheet } from '../src/components/Sheet';
import { Slider } from '../src/components/Slider';
import { Button, Divider, Segmented, T } from '../src/components/ui';
import { useStore } from '../src/data/store';
import { colors, fonts, radius, type } from '../src/theme';

export default function Progresso() {
  const { id = 'memorias' } = useLocalSearchParams<{ id?: string }>();
  const store = useStore();
  const book = store.book(id);
  const [page, setPage] = useState(store.reading(id)?.page ?? 0);
  const [modo, setModo] = useState<'pagina' | 'pct'>('pagina');
  const pct = Math.round((page / book.pages) * 100);
  const add = (n: number) => setPage((p) => Math.min(book.pages, p + n));

  const salvar = () => {
    store.setPage(id, page);
    router.replace({ pathname: '/salvo', params: { id } });
  };

  return (
    <Sheet showClose={false}>
      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        <View style={s.head}>
          <BookCover book={book} width={50} />
          <View style={{ flex: 1 }}>
            <T style={type.title} numberOfLines={1}>
              {book.title}
            </T>
            <T style={type.small}>
              {book.author} · {book.pages} páginas
            </T>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Fechar">
            <X size={22} color={colors.ink} />
          </Pressable>
        </View>

        <View style={s.numRow}>
          <Text style={s.num}>{modo === 'pagina' ? page : `${pct}%`}</Text>
          <Text style={s.of}>{modo === 'pagina' ? `de ${book.pages}` : `p. ${page}`}</Text>
          <View style={{ flex: 1 }} />
          <Segmented
            value={modo}
            onChange={setModo}
            items={[
              { key: 'pagina', label: 'página' },
              { key: 'pct', label: `${pct}%` },
            ]}
          />
        </View>

        <Slider value={page} max={book.pages} onChange={setPage} />

        <View style={s.quick}>
          {[10, 25, 50].map((n) => (
            <Pressable key={n} style={s.quickBtn} onPress={() => add(n)}>
              <Text style={s.quickText}>+{n}</Text>
            </Pressable>
          ))}
          <Pressable style={[s.quickBtn, { flex: 1.4, flexDirection: 'row', gap: 6 }]} onPress={() => setPage(book.pages)}>
            <Check size={16} color={colors.ink} />
            <Text style={[s.quickText, { fontFamily: fonts.sansSemi }]}>Terminei</Text>
          </Pressable>
        </View>

        <Divider />
        <Pressable style={s.more} onPress={() => {
            store.setPage(id, page);
            router.replace({ pathname: '/detalhes', params: { id } });
          }}>
          <View style={{ flex: 1 }}>
            <T style={[type.title, { fontFamily: fonts.sansSemi }]}>Mais detalhes</T>
            <T style={type.small}>nota, resenha, citação, tags — tudo opcional</T>
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>

        <Button label="Salvar" onPress={salvar} />
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  num: { fontFamily: fonts.monoBold, fontSize: 52, lineHeight: 58, color: colors.ink },
  of: { fontFamily: fonts.sans, fontSize: 15, color: colors.muted, marginBottom: 10 },
  quick: { flexDirection: 'row', gap: 8 },
  quickBtn: { flex: 1, height: 46, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.accentLine, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  quickText: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.ink },
  more: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
});
