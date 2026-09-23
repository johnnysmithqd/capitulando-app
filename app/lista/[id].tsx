import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronUp, Globe, MoreHorizontal, Share2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { menu } from '../../src/components/menu';
import { Avatar, Button, Divider, Eyebrow, IconButton, T } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { useApi } from '../../src/data/store';
import type { ListDetail } from '../../src/data/types';
import { colors, fonts, shadow, type } from '../../src/theme';

export default function Lista() {
  const { id = 'l1' } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const loaded = useApi(() => api.getList(id), [id]);
  const [items, setItems] = useState<ListDetail['items']>([]);
  const [reordenando, setReordenando] = useState(false);
  useEffect(() => {
    if (loaded) setItems(loaded.items);
  }, [loaded]);

  if (!loaded) return <View style={{ flex: 1 }} />;
  const l = loaded;

  const mover = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={s.head}>
        <IconButton label="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.ink} />
        </IconButton>
        <View style={{ flexDirection: 'row' }}>
          <IconButton label="Compartilhar" onPress={() => Share.share({ message: `${l.name} — lista de @${l.owner} no Capitulando` })}>
            <Share2 size={20} color={colors.ink} />
          </IconButton>
          <IconButton
            label="Mais opções"
            onPress={() =>
              menu(l.name, [
                { label: reordenando ? 'Terminar de reordenar' : 'Reordenar', onPress: () => setReordenando(!reordenando) },
                { label: 'Copiar link', onPress: () => Share.share({ message: `https://capitulando.com/@${l.owner}/listas/${l.id}` }) },
                { label: 'Apagar lista', destrutiva: true, onPress: () => router.back() },
              ])
            }
          >
            <MoreHorizontal size={22} color={colors.ink} />
          </IconButton>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <View style={{ flexDirection: 'row', marginVertical: 8 }}>
            {items.slice(0, 6).map((it, i) => (
              <View key={it.book.id} style={[s.stack, shadow.cover, { backgroundColor: it.book.coverColor, marginLeft: i ? -14 : 0 }]} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Globe size={13} color={colors.accentDark} />
            <Eyebrow color={colors.accentDark}>{l.isPublic ? 'Lista pública' : 'Lista privada'}</Eyebrow>
          </View>
          <Text style={s.title}>{l.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Avatar initials="MA" bg={colors.greenMint} fg={colors.green} size={24} />
            <T style={type.small}>sua lista · @{l.owner}</T>
          </View>
          <Text style={type.mono}>
            {items.length} livros · {l.saves} salvaram · atualizada em {l.updated}
          </Text>
          <T style={{ fontSize: 15, lineHeight: 23, color: colors.inkSoft }}>{l.description}</T>
          <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8 }}>
            <Button label={reordenando ? 'Pronto' : 'Reordenar'} variant="outline" style={{ flex: 1 }} onPress={() => setReordenando(!reordenando)} />
            <Button label="Adicionar livro" style={{ flex: 1 }} onPress={() => router.push('/busca')} />
          </View>
        </View>

        {items.map((it, i) => (
          <View key={it.book.id}>
            {i > 0 ? <Divider style={{ marginHorizontal: 20 }} /> : null}
            <Pressable style={s.row} onPress={() => !reordenando && router.push(`/livro/${it.book.id}`)}>
              {reordenando ? (
                <View style={{ gap: 4 }}>
                  <Pressable onPress={() => mover(i, -1)} hitSlop={6} style={{ opacity: i === 0 ? 0.3 : 1 }} accessibilityLabel="Subir">
                    <ChevronUp size={18} color={colors.ink} />
                  </Pressable>
                  <Pressable onPress={() => mover(i, 1)} hitSlop={6} style={{ opacity: i === items.length - 1 ? 0.3 : 1 }} accessibilityLabel="Descer">
                    <ChevronDown size={18} color={colors.ink} />
                  </Pressable>
                </View>
              ) : (
                <Text style={s.pos}>{i + 1}</Text>
              )}
              <BookCover book={it.book} width={46} showTitle={false} />
              <View style={{ flex: 1, gap: 2 }}>
                <T style={type.title}>{it.book.title}</T>
                <T style={type.small}>{it.book.author}</T>
                {it.note && !reordenando ? <Text style={s.note}>{it.note}</Text> : null}
              </View>
              {reordenando ? (
                <Pressable onPress={() => setItems(items.filter((x) => x !== it))} hitSlop={8} accessibilityLabel="Remover">
                  <X size={18} color={colors.muted} />
                </Pressable>
              ) : null}
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  stack: { width: 44, height: 88, borderRadius: 3 },
  title: { fontFamily: fonts.serifBold, fontSize: 28, lineHeight: 34, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 12 },
  pos: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.inkSoft, width: 18 },
  note: { fontFamily: fonts.serifItalic, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginTop: 2 },
});
