import { router } from 'expo-router';
import { Barcode, ChevronLeft, ChevronRight, Search, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BookCover } from '../src/components/BookCover';
import { Sheet } from '../src/components/Sheet';
import { Divider, Eyebrow, T } from '../src/components/ui';
import * as api from '../src/data/api';
import type { Book } from '../src/data/types';
import { colors, fonts, radius, type } from '../src/theme';

export default function Busca() {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<Book[]>([]);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => api.searchBooks(q).then((r) => alive && setRes(r)), 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <Sheet showClose={false} full>
      <View style={s.bar}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
          <ChevronLeft size={24} color={colors.ink} />
        </Pressable>
        <View style={s.input}>
          <Search size={18} color={colors.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            autoFocus
            placeholder="Título, autor ou ISBN"
            placeholderTextColor={colors.faint}
            style={s.inputText}
          />
          {q ? (
            <Pressable onPress={() => setQ('')} hitSlop={8} accessibilityLabel="Limpar">
              <XCircle size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable hitSlop={8} accessibilityLabel="Ler código de barras">
          <Barcode size={24} color={colors.ink} />
        </Pressable>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={res}
        keyExtractor={(b) => b.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListHeaderComponent={<Eyebrow style={{ marginVertical: 10 }}>{`${res.length} resultados`}</Eyebrow>}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => (
          <Pressable style={s.row} onPress={() => router.replace({ pathname: '/status', params: { id: item.id } })}>
            <BookCover book={item} width={60} />
            <View style={{ flex: 1, gap: 4 }}>
              <T style={type.title}>{item.title}</T>
              <T style={type.small}>
                {[item.author, item.edition, `${item.pages} p.`].filter(Boolean).join(' · ')}
              </T>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
        )}
        ListFooterComponent={
          <>
            <Divider />
            <Text style={s.footer}>
              Não achou? Aponte a câmera para o código de barras ou <Text style={s.link}>cadastre a edição</Text>.
            </Text>
          </>
        }
      />
    </Sheet>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  input: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.paper,
  },
  inputText: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  footer: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center', marginTop: 16 },
  link: { color: colors.accentDark, textDecorationLine: 'underline' },
});
