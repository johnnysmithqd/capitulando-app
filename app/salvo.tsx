import { router, useLocalSearchParams } from 'expo-router';
import { Share2 } from 'lucide-react-native';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '../src/components/BookCover';
import { Sheet } from '../src/components/Sheet';
import { Button, Eyebrow, ProgressBar, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { useApi, useStore } from '../src/data/store';
import { colors, fonts, radius, shadow, type } from '../src/theme';

export default function Salvo() {
  const { id = 'memorias', tipo } = useLocalSearchParams<{ id?: string; tipo?: string }>();
  const store = useStore();
  const me = useApi(api.getMe);
  const book = store.book(id);
  const page = store.reading(id)?.page ?? 0;
  const pct = Math.round((page / book.pages) * 100);
  const lido = tipo === 'lido' || page >= book.pages;

  const compartilhar = () =>
    Share.share({
      message: lido
        ? `Terminei ${book.title}, de ${book.author}. #Capitulando`
        : `p. ${page} de ${book.title} (${pct}%). #Capitulando`,
    });

  return (
    <Sheet showClose={false}>
      <View style={{ paddingHorizontal: 20, alignItems: 'center', gap: 10 }}>
        <View style={s.stamp}>
          <Text style={s.stampText}>SALVO</Text>
        </View>
        <Text style={[type.h1, { textAlign: 'center' }]}>{lido ? `Você terminou ${book.title}` : `p. ${page} de ${book.title}`}</Text>
        <T style={[type.small, { textAlign: 'center', fontSize: 14, lineHeight: 20 }]}>
          {lido ? (
            'Entrou na estante de lidos e no seu diário.'
          ) : (
            <>
              Faltam <Text style={{ fontFamily: fonts.monoBold }}>{book.pages - page}</Text> páginas. Entrou no seu diário, no feed e no desafio do mês.
            </>
          )}
        </T>

        <View style={s.card}>
          <Eyebrow color={book.coverColor}>{lido ? 'Terminei' : 'Lendo agora'}</Eyebrow>
          <BookCover book={book} width={76} style={{ marginTop: 12 }} />
          <Text style={s.cardTitle}>{book.title}</Text>
          <T style={type.small}>{book.author}</T>
          <View style={{ marginTop: 22, gap: 6, alignSelf: 'stretch' }}>
            <ProgressBar pct={pct} color={book.coverColor} height={4} />
            <Text style={type.mono}>
              p. {page} de {book.pages} · {pct}%
            </Text>
          </View>
          <View style={s.cardFoot}>
            <Text style={[type.small, { fontSize: 10 }]}>@{me?.handle}</Text>
            <Text style={s.brand}>Capitulando</Text>
          </View>
        </View>

        <Button label="Compartilhar" icon={<Share2 size={18} color={colors.paper} />} onPress={compartilhar} style={{ alignSelf: 'stretch' }} />
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ paddingVertical: 8 }}>
          <Text style={[type.body, { color: colors.muted, fontSize: 15 }]}>Agora não</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  stamp: { borderWidth: 2, borderColor: colors.accentDark, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 4, transform: [{ rotate: '-3deg' }] },
  stampText: { fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 2, color: colors.accentDark },
  card: {
    width: 200,
    padding: 18,
    borderRadius: radius.md,
    backgroundColor: colors.creamSoft,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'flex-start',
    marginVertical: 12,
    ...shadow.card,
  },
  cardTitle: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 24, color: colors.ink, marginTop: 14 },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 12 },
  brand: { fontFamily: fonts.serif, fontSize: 11, color: colors.muted },
});
