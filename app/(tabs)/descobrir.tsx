import { router } from 'expo-router';
import {
  Armchair,
  Barcode,
  Bookmark,
  Check,
  EyeOff,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Search,
  Share2,
  Sparkles,
  Trophy,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { ClubCard, ProjectCard } from '../../src/components/cards';
import { Avatar, Button, Card, Eyebrow, ProgressBar, Stars, T, Tag } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { useApi, useStore } from '../../src/data/store';
import type { FeedItem } from '../../src/data/types';
import { colors, fonts, radius, type } from '../../src/theme';

type Aba = 'seguindo' | 'paravoce' | 'explorar';
const ABAS: [Aba, string][] = [
  ['seguindo', 'Seguindo'],
  ['paravoce', 'Para você'],
  ['explorar', 'Explorar'],
];

export default function Descobrir() {
  const insets = useSafeAreaInsets();
  const [aba, setAba] = useState<Aba>('seguindo');

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 8 }}>
      <View style={s.searchRow}>
        <Pressable style={s.search} onPress={() => router.push('/busca')}>
          <Search size={18} color={colors.muted} />
          <Text style={s.searchText}>Livros, clubes, projetos…</Text>
        </Pressable>
        <Pressable style={s.barcode} accessibilityLabel="Ler código de barras" onPress={() => router.push('/busca')}>
          <Barcode size={22} color={colors.ink} />
        </Pressable>
      </View>
      <View style={s.tabs}>
        {ABAS.map(([k, label]) => (
          <Pressable key={k} onPress={() => setAba(k)} style={s.tab}>
            <Text style={[s.tabText, aba === k && { color: colors.accent }]}>{label}</Text>
            {aba === k ? <View style={s.tabMarker} /> : null}
          </Pressable>
        ))}
      </View>
      {aba === 'seguindo' && <Seguindo />}
      {aba === 'paravoce' && <ParaVoce />}
      {aba === 'explorar' && <Explorar />}
    </View>
  );
}

function Seguindo() {
  const feed = useApi(api.getFeed);
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
      {feed?.map((f) => <Post key={f.id} item={f} />)}
    </ScrollView>
  );
}

function Post({ item }: { item: FeedItem }) {
  const store = useStore();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState(false);

  if (item.kind === 'sessao') {
    return (
      <Card style={{ padding: 14, gap: 12 }}>
        <View style={s.who}>
          <View style={[s.clubIcon]}>
            <Armchair size={18} color={colors.accentDark} />
          </View>
          <View>
            <T style={type.title}>{item.club}</T>
            <T style={type.small}>próxima sessão</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={s.date}>
            <Text style={s.dateDay}>{item.day}</Text>
            <Text style={s.dateMon}>{item.mon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <T style={type.title}>{item.title}</T>
            <T style={type.small}>{item.when}</T>
            <T style={type.small}>{item.confirmed} confirmaram</T>
          </View>
        </View>
        <Button label="Confirmar presença" variant="outline" small={false} style={{ height: 44 }} />
      </Card>
    );
  }

  const verb = {
    terminou: 'terminou um livro',
    citacao: 'marcou uma citação',
    avancou: 'avançou na leitura',
    resenha: `resenhou ${item.book.title}`,
  }[item.kind];
  const hidden = item.kind === 'resenha' && item.spoilerPage && (store.reading(item.book.id)?.page ?? 0) < item.spoilerPage && !revealed;

  return (
    <Card style={{ padding: 14, gap: 12 }}>
      <View style={s.who}>
        <Pressable onPress={() => router.push(`/pessoa/${item.who.id}`)}>
          <Avatar initials={item.who.initials} bg={item.who.avatarBg} fg={item.who.avatarFg} />
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => router.push(`/pessoa/${item.who.id}`)}>
          <T style={type.title}>{item.who.name}</T>
          <T style={type.small}>
            {verb} · {item.when}
          </T>
        </Pressable>
        <MoreHorizontal size={20} color={colors.muted} />
      </View>

      {item.kind === 'terminou' && (
        <>
          <Pressable style={{ flexDirection: 'row', gap: 14 }} onPress={() => router.push(`/livro/${item.book.id}`)}>
            <BookCover book={item.book} width={78} />
            <View style={{ flex: 1, gap: 6, paddingTop: 2 }}>
              <View style={s.stamp}>
                <Text style={s.stampText}>TERMINEI</Text>
              </View>
              <Text style={s.bookTitle}>{item.book.title}</Text>
              <T style={type.small}>{item.book.author}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Stars value={item.rating} size={15} />
                <Text style={type.mono}>{item.rating.toFixed(1).replace('.', ',')}</Text>
              </View>
            </View>
          </Pressable>
          <T style={{ fontSize: 15, lineHeight: 22 }}>{item.text}</T>
        </>
      )}

      {item.kind === 'citacao' && (
        <View style={s.quote}>
          <Text style={s.quoteText}>“{item.quote}”</Text>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} onPress={() => router.push(`/livro/${item.book.id}`)}>
            <BookCover book={item.book} width={24} showTitle={false} />
            <T style={type.small}>
              {item.book.title} · <Text style={{ fontFamily: fonts.monoBold }}>p. {item.page}</Text>
            </T>
          </Pressable>
        </View>
      )}

      {item.kind === 'avancou' && (
        <>
          <Pressable style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }} onPress={() => router.push(`/livro/${item.book.id}`)}>
            <BookCover book={item.book} width={62} />
            <View style={{ flex: 1, gap: 8 }}>
              <T style={type.title}>{item.book.title}</T>
              <ProgressBar pct={(item.page / item.book.pages) * 100} />
              <Text style={type.mono}>
                p. {item.page} de {item.book.pages} · {Math.round((item.page / item.book.pages) * 100)}%
              </Text>
            </View>
          </Pressable>
          {item.challenge ? (
            <Pressable style={s.challenge} onPress={() => router.push('/desafio/setembro')}>
              <Trophy size={16} color={colors.accentDark} />
              <Text style={s.challengeText}>{item.challenge}</Text>
            </Pressable>
          ) : null}
        </>
      )}

      {item.kind === 'resenha' && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Stars value={item.rating} size={15} />
            <Text style={type.mono}>{item.rating.toFixed(1).replace('.', ',')}</Text>
            {item.badge ? <Tag label={item.badge} /> : null}
          </View>
          {hidden ? (
            <View style={s.spoiler}>
              <EyeOff size={16} color={colors.inkSoft} />
              <View>
                <T style={[type.small, { color: colors.inkSoft }]}>Visível para quem passou da p. {item.spoilerPage}</T>
                <Text style={[type.small, { color: colors.inkSoft, textDecorationLine: 'underline' }]} onPress={() => setRevealed(true)}>
                  Revelar mesmo assim
                </Text>
              </View>
            </View>
          ) : (
            <T style={{ fontSize: 15, lineHeight: 22 }}>{item.text}</T>
          )}
        </>
      )}

      <View style={s.actions}>
        <Pressable style={s.action} onPress={() => setLiked(!liked)} accessibilityLabel="Curtir">
          <Heart size={20} color={liked ? colors.accent : colors.inkSoft} fill={liked ? colors.accent : 'transparent'} />
          <Text style={type.mono}>{item.likes + (liked ? 1 : 0)}</Text>
        </Pressable>
        <View style={s.action}>
          <MessageCircle size={20} color={colors.inkSoft} />
          <Text style={type.mono}>{item.comments}</Text>
        </View>
        {item.kind !== 'resenha' ? <Repeat2 size={20} color={colors.inkSoft} /> : null}
        <Pressable onPress={() => setSaved(!saved)} accessibilityLabel="Salvar">
          <Bookmark size={20} color={colors.inkSoft} fill={saved ? colors.inkSoft : 'transparent'} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => router.push({ pathname: '/estudio', params: { tipo: item.kind === 'citacao' ? 'citacao' : item.kind === 'terminou' ? 'terminado' : 'leitura', id: item.book.id } })}
          accessibilityLabel="Compartilhar"
        >
          <Share2 size={20} color={colors.inkSoft} />
        </Pressable>
      </View>
    </Card>
  );
}

function ParaVoce() {
  const recs = useApi(api.getForYou);
  const store = useStore();
  const [done, setDone] = useState<Record<string, string>>({});
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      {recs?.map((r) => (
        <View key={r.book.id} style={{ gap: 8 }}>
          <Eyebrow>{r.reason}</Eyebrow>
          <Card style={{ padding: 14, flexDirection: 'row', gap: 14 }}>
            <BookCover book={r.book} width={102} onPress={() => router.push(`/livro/${r.book.id}`)} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={s.bookTitle}>{r.book.title}</Text>
              <T style={type.small}>
                {r.book.author} · {r.book.pages} páginas
              </T>
              <T style={[type.small, { color: colors.inkSoft }]}>{r.blurb}</T>
              {done[r.book.id] ? (
                <Tag label={done[r.book.id]} tone="green" />
              ) : (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <Pressable
                    style={[s.pillBtn, { backgroundColor: colors.accentSoft }]}
                    onPress={() => {
                      store.setStatus(r.book.id, 'quero-ler');
                      setDone({ ...done, [r.book.id]: 'na sua estante' });
                    }}
                  >
                    <Text style={[s.pillText, { color: colors.accentDark }]}>quero ler</Text>
                  </Pressable>
                  <Pressable
                    style={[s.pillBtn, { backgroundColor: colors.cream }]}
                    onPress={() => router.push({ pathname: '/status', params: { id: r.book.id } })}
                  >
                    <Text style={s.pillText}>já li</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </Card>
        </View>
      ))}
      <T style={[type.small, { textAlign: 'center', marginTop: 8 }]}>Toque em “quero ler” para guardar na estante, ou em “já li” para registrar.</T>
    </ScrollView>
  );
}

const ESCOPOS = ['Tudo', 'Livros', 'Pessoas', 'Clubes', 'Projetos', 'Listas'];

function Explorar() {
  const data = useApi(api.getExplore);
  const store = useStore();
  const [escopo, setEscopo] = useState('Tudo');
  const [marks, setMarks] = useState<Record<string, 'quero' | 'li'>>({});
  const show = (k: string) => escopo === 'Tudo' || escopo === k;

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 16, gap: 26 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {ESCOPOS.map((e) => (
          <Pressable key={e} onPress={() => setEscopo(e)} style={[s.scope, escopo === e && { backgroundColor: colors.ink }]}>
            <Text style={[s.scopeText, escopo === e && { color: colors.creamSoft }]}>{e}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {show('Livros') &&
        data?.rows.map((row) => (
          <View key={row.title} style={{ gap: 12 }}>
            <View style={s.rowHead}>
              <Text style={type.h2}>{row.title}</Text>
              <Text style={s.link}>ver mais</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {row.books.map((b) => {
                const m = marks[b.id];
                return (
                  <View key={b.id} style={{ width: 120, gap: 4 }}>
                    <BookCover book={b} width={120} onPress={() => router.push(`/livro/${b.id}`)} />
                    <T style={[type.title, { fontSize: 13, marginTop: 6 }]} numberOfLines={1}>
                      {b.title}
                    </T>
                    <T style={[type.small, { fontSize: 11 }]} numberOfLines={1}>
                      {b.author}
                    </T>
                    <View style={s.split}>
                      <Pressable
                        style={[s.splitBtn, { backgroundColor: m === 'quero' ? colors.accent : colors.accentSoft }]}
                        accessibilityLabel="Quero ler"
                        onPress={() => {
                          store.setStatus(b.id, 'quero-ler');
                          setMarks({ ...marks, [b.id]: 'quero' });
                        }}
                      >
                        <Bookmark size={16} color={m === 'quero' ? colors.paper : colors.ink} />
                      </Pressable>
                      <Pressable
                        style={[s.splitBtn, { flex: 0.7, backgroundColor: m === 'li' ? colors.green : colors.cream }]}
                        accessibilityLabel="Já li"
                        onPress={() => {
                          store.setStatus(b.id, 'lido');
                          setMarks({ ...marks, [b.id]: 'li' });
                        }}
                      >
                        <Check size={16} color={m === 'li' ? colors.paper : colors.ink} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ))}

      {show('Clubes') && data ? (
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <View style={[s.rowHead, { paddingHorizontal: 0 }]}>
            <Text style={type.h2}>Clubes que combinam com você</Text>
            <Text style={s.link}>filtrar</Text>
          </View>
          {data.clubs.map((c) => (
            <ClubCard key={c.id} club={c} onPress={() => router.push(`/clube/${c.id}`)} />
          ))}
        </View>
      ) : null}

      {show('Projetos') && data ? (
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <Text style={type.h2}>Projetos para você</Text>
          {data.projects.map((p) => (
            <ProjectCard key={p.id} project={p} onPress={() => router.push(`/projeto/${p.id}`)} />
          ))}
        </View>
      ) : null}

      <View style={s.better}>
        <View style={s.betterIcon}>
          <Sparkles size={20} color={colors.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <T style={type.title}>Quer sugestões melhores?</T>
          <T style={type.small}>Você avaliou 34 livros. Cada nota nova afina as fileiras acima.</T>
        </View>
        <Pressable style={s.betterBtn} onPress={() => router.push('/onboarding')}>
          <Text style={s.pillText}>Avaliar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  search: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentLine,
    backgroundColor: colors.paper,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  searchText: { fontFamily: fonts.sans, fontSize: 15, color: colors.faint },
  barcode: { width: 46, height: 46, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accentLine, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', gap: 22, paddingHorizontal: 20, marginTop: 12, borderBottomWidth: 1, borderBottomColor: colors.accentLine },
  tab: { paddingVertical: 12, alignItems: 'center' },
  tabText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.muted },
  tabMarker: { position: 'absolute', bottom: -8, width: 12, height: 12, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] },
  who: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clubIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.rose, alignItems: 'center', justifyContent: 'center' },
  stamp: { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: colors.green, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 2, transform: [{ rotate: '-2deg' }] },
  stampText: { fontFamily: fonts.monoBold, fontSize: 10, letterSpacing: 2, color: colors.green },
  bookTitle: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 23, color: colors.ink },
  quote: { backgroundColor: colors.cream, borderRadius: radius.md, padding: 16, gap: 14 },
  quoteText: { fontFamily: fonts.serifItalic, fontSize: 18, lineHeight: 27, color: colors.ink },
  challenge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.accentSoft, borderRadius: radius.sm, padding: 10 },
  challengeText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.accentDark },
  spoiler: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.cream, borderRadius: radius.sm, padding: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingTop: 4 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  dateDay: { fontFamily: fonts.serifBold, fontSize: 22, lineHeight: 24, color: colors.accentDark },
  dateMon: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.accentDark },
  pillBtn: { borderRadius: radius.pill, paddingHorizontal: 12, height: 34, justifyContent: 'center' },
  pillText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.ink },
  scope: { borderRadius: radius.pill, paddingHorizontal: 14, height: 36, justifyContent: 'center', backgroundColor: colors.cream },
  scopeText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  link: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.accentDark },
  split: { flexDirection: 'row', height: 36, borderRadius: radius.sm, overflow: 'hidden', marginTop: 6 },
  splitBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  better: { marginHorizontal: 20, backgroundColor: colors.cream, borderRadius: radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  betterIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  betterBtn: { backgroundColor: colors.paper, borderRadius: radius.sm, paddingHorizontal: 14, height: 38, justifyContent: 'center' },
});
