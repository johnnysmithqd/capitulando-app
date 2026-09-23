import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Lock, MessageCircle, MoreHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { Avatar, Button, Card, Eyebrow, IconButton, ProgressBar, T } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { useApi } from '../../src/data/store';
import { colors, fonts, radius, type } from '../../src/theme';

export default function Pessoa() {
  const { id = 'camila' } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const p = useApi(() => api.getPerson(id), [id]);
  const [seguindo, setSeguindo] = useState(false);

  if (!p) return <View style={{ flex: 1 }} />;
  const favW = (width - 40 - 24) / 4;

  const toggle = () => {
    api.follow(p.id, !seguindo);
    setSeguindo(!seguindo);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={s.head}>
        <IconButton label="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.ink} />
        </IconButton>
        <Text style={s.handle}>@{p.handle}</Text>
        <IconButton label="Mais opções">
          <MoreHorizontal size={22} color={colors.ink} />
        </IconButton>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: insets.bottom + 30 }}>
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <Avatar initials={p.initials} bg={p.avatarBg} fg={p.avatarFg} size={76} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.name}>{p.name}</Text>
            <T style={{ color: colors.inkSoft }}>{p.bio}</T>
            <View style={{ flexDirection: 'row', gap: 18, marginTop: 4 }}>
              {[
                [p.stats.books, 'livros'],
                [p.stats.followers, 'seguidores'],
                [p.stats.following, 'seguindo'],
              ].map(([n, l]) => (
                <View key={l}>
                  <Text style={s.count}>{Number(n).toLocaleString('pt-BR')}</Text>
                  <T style={type.small}>{l}</T>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label={seguindo ? 'Seguindo' : 'Seguir'} variant={seguindo ? 'soft' : 'primary'} onPress={toggle} style={{ flex: 1 }} />
          <Button
            label="Mensagem"
            variant="outline"
            icon={<MessageCircle size={18} color={colors.ink} />}
            onPress={() => router.push({ pathname: '/caixa', params: { conversa: p.id } })}
            style={{ flex: 1 }}
          />
        </View>

        <View style={s.common}>
          <View style={{ flexDirection: 'row' }}>
            {p.inCommon.covers.map((c, i) => (
              <View key={i} style={[s.miniCover, { backgroundColor: c, marginLeft: i ? -16 : 0 }]} />
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.title, { color: '#4E4573' }]}>{p.inCommon.count} livros em comum</Text>
            <T style={type.small}>{p.inCommon.text}</T>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Eyebrow>Favoritos</Eyebrow>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {p.favorites.map((b) => (
              <BookCover key={b.id} book={b} width={favW} onPress={() => router.push(`/livro/${b.id}`)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Eyebrow>Lendo agora</Eyebrow>
          <Pressable onPress={() => router.push(`/livro/${p.reading.book.id}`)}>
            <Card style={{ padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <BookCover book={p.reading.book} width={42} showTitle={false} />
              <View style={{ flex: 1, gap: 4 }}>
                <T style={type.title}>{p.reading.book.title}</T>
                <T style={type.small}>
                  {p.reading.book.author} · {p.reading.chapter}
                </T>
                <ProgressBar pct={p.reading.pct} height={4} />
              </View>
            </Card>
          </Pressable>
        </View>

        {p.diaryPrivate && !seguindo ? (
          <View style={s.private}>
            <Lock size={18} color={colors.inkSoft} />
            <T style={[type.small, { flex: 1, color: colors.inkSoft, fontSize: 13, lineHeight: 19 }]}>
              O diário de @{p.handle} é só para quem segue. As estantes e as listas ficam abertas.
            </T>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  handle: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.inkSoft },
  name: { fontFamily: fonts.serifBold, fontSize: 24, color: colors.ink },
  count: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.ink },
  common: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.lilacSoft, borderRadius: radius.md, padding: 14 },
  miniCover: { width: 30, height: 44, borderRadius: 3, borderWidth: 1, borderColor: 'rgba(0,0,0,.1)' },
  private: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.cream, borderRadius: radius.md, padding: 14 },
});
