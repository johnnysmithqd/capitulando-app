import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, Check, ChevronDown, ChevronLeft, EyeOff, MoreHorizontal, Plus, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { ClubCard, ProjectCard } from '../../src/components/cards';
import { menu } from '../../src/components/menu';
import { Avatar, Card, Divider, Eyebrow, IconButton, Segmented, Stars, T, Tag } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { useApi, useStore } from '../../src/data/store';
import { colors, fonts, radius, type } from '../../src/theme';

const STATUS_LABEL = { lendo: 'Lendo', lido: 'Lido', 'quero-ler': 'Quero ler', abandonei: 'Abandonei' } as const;

export default function Livro() {
  const { id = 'memorias' } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const d = useApi(() => api.getBookDetails(id), [id]);
  const store = useStore();
  const reading = store.reading(id);
  const [aba, setAba] = useState<'amigos' | 'populares' | 'recentes'>('amigos');
  const [revelados, setRevelados] = useState<string[]>([]);

  if (!d) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const { book } = d;
  const minhaPag = reading?.page ?? 0;

  return (
    <View style={{ flex: 1 }}>
      <View style={[s.top, { paddingTop: insets.top + 4 }]}>
        <IconButton label="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.ink} />
        </IconButton>
        <View style={{ flexDirection: 'row' }}>
          <IconButton label="Compartilhar" onPress={() => Share.share({ message: `${book.title}, de ${book.author} — no Capitulando` })}>
            <Share2 size={20} color={colors.ink} />
          </IconButton>
          <IconButton
            label="Mais opções"
            onPress={() =>
              menu(book.title, [
                { label: 'Adicionar a uma lista', onPress: () => router.push('/lista/l1') },
                { label: 'Fazer um card', onPress: () => router.push({ pathname: '/estudio', params: { tipo: 'progresso', id } }) },
                { label: reading ? 'Trocar status' : 'Pôr na estante', onPress: () => router.push({ pathname: reading ? '/trocar' : '/status', params: { id } }) },
                { label: 'Informar erro na ficha', onPress: () => Share.share({ message: `Erro na ficha de ${book.title}` }) },
              ])
            }
          >
            <MoreHorizontal size={22} color={colors.ink} />
          </IconButton>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom, gap: 26 }}>
        <View style={{ alignItems: 'center', paddingHorizontal: 20, gap: 4 }}>
          <BookCover book={book} width={190} style={{ marginVertical: 20 }} />
          <Text style={s.title}>{book.title}</Text>
          <Text style={s.author}>{book.author}</Text>
          <Text style={type.mono}>{[`${book.pages} páginas`, book.year, book.edition?.split(',')[0]].filter(Boolean).join(' · ')}</Text>
        </View>

        {/* Nota */}
        <View style={s.rating}>
          <View>
            <Text style={s.ratingNum}>{String(d.rating).replace('.', ',')}</Text>
            <Stars value={d.rating} size={14} />
            <Text style={[type.mono, { marginTop: 2 }]}>{d.ratingsCount.toLocaleString('pt-BR')} notas</Text>
          </View>
          <View style={s.bars}>
            {d.distribution.map((v, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View style={{ height: 42, justifyContent: 'flex-end', alignSelf: 'stretch' }}>
                  <View style={{ height: Math.max(4, v * 42), borderRadius: 3, backgroundColor: i === 4 ? colors.gold : colors.lineStrong }} />
                </View>
                <Text style={[type.mono, { fontSize: 9 }]}>{i + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Amigos */}
        <View style={s.section}>
          <Eyebrow>O que seus amigos acharam</Eyebrow>
          <Card style={{ paddingHorizontal: 14 }}>
            <View style={[s.rowPad, { gap: 10 }]}>
              <View style={{ flexDirection: 'row' }}>
                {[
                  ['TB', colors.rose],
                  ['CF', colors.lilac],
                  ['LP', colors.goldSoft],
                ].map(([ini, bg], i) => (
                  <View key={ini} style={{ marginLeft: i ? -8 : 0 }}>
                    <Avatar initials={ini} bg={bg} fg={colors.inkSoft} size={30} />
                  </View>
                ))}
                <View style={{ marginLeft: -8 }}>
                  <Avatar initials={`+${d.friends.count - 3}`} bg={colors.cream} fg={colors.inkSoft} size={30} />
                </View>
              </View>
              <T>
                {d.friends.count} amigos leram · média <Text style={{ fontFamily: fonts.monoBold }}>{String(d.friends.avg).replace('.', ',')}</Text>
              </T>
            </View>
            {d.friends.list.map((f) => (
              <View key={f.name}>
                <Divider />
                <View style={[s.rowPad, { justifyContent: 'space-between' }]}>
                  <T>{f.name}</T>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {f.rating ? <Stars value={f.rating} /> : null}
                    {f.badge ? <Tag label={f.badge} tone={f.rating ? 'cream' : 'accent'} /> : null}
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Resenhas */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Eyebrow>{`Resenhas · ${d.reviewsCount}`}</Eyebrow>
            <Segmented
              value={aba}
              onChange={setAba}
              items={[
                { key: 'amigos', label: 'Amigos' },
                { key: 'populares', label: 'Populares' },
                { key: 'recentes', label: 'Recentes' },
              ]}
            />
          </View>
          {d.reviews.map((r) => {
            const escondida = r.spoilerPage && minhaPag < r.spoilerPage && !revelados.includes(r.id);
            return (
              <Card key={r.id} style={{ padding: 14, gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Avatar initials={r.initials} bg={r.avatarBg} fg={r.avatarFg} />
                  <View style={{ flex: 1 }}>
                    <T style={type.title}>{r.author}</T>
                    <T style={type.small}>{r.when}</T>
                  </View>
                  <Stars value={r.rating} size={13} />
                </View>
                {escondida ? (
                  <View style={s.spoiler}>
                    <EyeOff size={16} color={colors.inkSoft} />
                    <T style={[type.small, { color: colors.inkSoft }]}>
                      Visível para quem passou da p. {r.spoilerPage} ·{' '}
                      <Text style={{ textDecorationLine: 'underline' }} onPress={() => setRevelados([...revelados, r.id])}>
                        Revelar
                      </Text>
                    </T>
                  </View>
                ) : (
                  <T style={{ fontSize: 15, lineHeight: 22 }}>{r.text}</T>
                )}
              </Card>
            );
          })}
        </View>

        {/* Citações */}
        <View style={s.section}>
          <Eyebrow>Citações populares</Eyebrow>
          {d.quotes.map((q) => (
            <View key={q.id} style={s.quote}>
              {q.spoiler && !revelados.includes(q.id) ? (
                <Pressable style={s.spoiler} onPress={() => setRevelados([...revelados, q.id])}>
                  <EyeOff size={16} color={colors.inkSoft} />
                  <T style={[type.small, { color: colors.inkSoft }]}>{q.spoiler}</T>
                </Pressable>
              ) : (
                <>
                  <Text style={s.quoteText}>“{q.text}”</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={type.mono}>{q.where}</Text>
                    <Text style={type.mono}>{q.count} marcaram</Text>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>

        {/* Clubes */}
        <View style={s.section}>
          <Eyebrow>Clubes lendo este livro agora</Eyebrow>
          {d.clubs.map((c) => (
            <ClubCard key={c.id} club={c} onPress={() => router.push(`/clube/${c.id}`)} />
          ))}
        </View>

        {/* Projeto */}
        {d.project ? (
          <View style={s.section}>
            <Eyebrow>Projeto relacionado</Eyebrow>
            <ProjectCard project={d.project} onPress={() => router.push(`/projeto/${d.project!.id}`)} />
          </View>
        ) : null}

        {/* Quem leu também leu */}
        <View style={{ gap: 12 }}>
          <Eyebrow style={{ paddingHorizontal: 20 }}>Quem leu este também leu</Eyebrow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {d.alsoRead.map((b) => (
              <BookCover key={b.id} book={b} width={102} onPress={() => router.push(`/livro/${b.id}`)} />
            ))}
          </ScrollView>
        </View>

        {/* Edições */}
        <View style={s.section}>
          <Eyebrow>{`Edições · ${d.editions.length}`}</Eyebrow>
          <View>
            {d.editions.map((e, i) => (
              <View key={e.id}>
                {i > 0 ? <Divider /> : null}
                <View style={[s.rowPad, { gap: 12 }]}>
                  <View style={{ width: 24, height: 34, borderRadius: 2, backgroundColor: e.coverColor }} />
                  <View style={{ flex: 1 }}>
                    <T style={[type.title, { fontFamily: fonts.sansSemi }]}>{e.label}</T>
                    <T style={type.small}>{e.sub}</T>
                  </View>
                  {e.mine ? <Check size={18} color={colors.ink} /> : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Barra de ação */}
      <View style={[s.action, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={s.main}
          onPress={() =>
            reading ? router.push({ pathname: '/trocar', params: { id } }) : router.push({ pathname: '/status', params: { id } })
          }
        >
          <BookOpen size={20} color={colors.paper} />
          <Text style={s.mainText}>
            {reading ? STATUS_LABEL[reading.status] : 'Adicionar à estante'}
            {reading?.status === 'lendo' ? ` · p. ${reading.page}` : ''}
          </Text>
          <ChevronDown size={16} color={colors.paper} />
        </Pressable>
        <Pressable style={s.add} accessibilityLabel="Mudar status" onPress={() => router.push({ pathname: '/status', params: { id } })}>
          <Plus size={22} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { position: 'absolute', zIndex: 2, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  title: { fontFamily: fonts.serifBold, fontSize: 24, lineHeight: 30, color: colors.ink, textAlign: 'center', marginTop: 8 },
  author: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.accentDark },
  rating: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, paddingHorizontal: 20 },
  ratingNum: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 38, color: colors.ink },
  bars: { flex: 1, flexDirection: 'row', gap: 8 },
  section: { paddingHorizontal: 20, gap: 12 },
  rowPad: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  spoiler: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.cream, borderRadius: radius.sm, padding: 18 },
  quote: { backgroundColor: colors.cream, borderRadius: radius.md, padding: 16, gap: 12 },
  quoteText: { fontFamily: fonts.serifItalic, fontSize: 18, lineHeight: 27, color: colors.ink },
  action: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12 },
  main: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mainText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.paper },
  add: { width: 52, height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accentLine, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
});
