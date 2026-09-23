import { router } from 'expo-router';
import { Bell, ChevronRight, ListChecks, Plus } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { Avatar, Card, Divider, Eyebrow, ProgressBar, SectionHeader, T, Tag } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { useApi, useStore } from '../../src/data/store';
import { colors, fonts, radius, type } from '../../src/theme';

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function saudacao(h: number) {
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const home = useApi(api.getHome);
  const me = useApi(api.getMe);
  const store = useStore();
  const lendo = store.byStatus('lendo');
  const now = new Date();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 32, gap: 22 }}>
      {/* Cabeçalho */}
      <View style={s.header}>
        <View style={{ gap: 2, flex: 1 }}>
          <Eyebrow>{`${DIAS[now.getDay()]}, ${now.getDate()} de ${MESES[now.getMonth()]}`}</Eyebrow>
          <Text style={type.h1}>
            {saudacao(now.getHours())}, {me?.name.split(' ')[0] ?? ''}
          </Text>
        </View>
        <Pressable style={s.bell} accessibilityLabel="Avisos e mensagens" onPress={() => router.push('/caixa')}>
          <Bell size={22} color={colors.ink} />
          {home?.unreadNotices ? (
            <View style={s.badge}>
              <Text style={s.badgeText}>{home.unreadNotices}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* Hoje */}
      {home?.agenda.length ? (
        <View>
          <SectionHeader title={`Hoje · ${home.agenda.length} compromissos`} action="avisos" onAction={() => router.push('/caixa')} />
          <View style={s.agenda}>
            {home.agenda.map((a, i) => (
              <View key={a.id}>
                {i > 0 ? <Divider /> : null}
                <View style={[s.agendaRow, a.highlight && { backgroundColor: colors.accentSoft }]}>
                  <View style={s.agendaTime}>
                    <Text style={[s.time, a.highlight && { color: colors.accentDark, fontSize: 22 }]}>{a.time}</Text>
                    <Text style={[s.timeSub, a.highlight && { color: colors.accentDark, fontFamily: fonts.monoBold }]}>{a.sub}</Text>
                  </View>
                  <View style={s.agendaBody}>
                    <T style={type.title}>{a.title}</T>
                    <T style={type.small} numberOfLines={2}>
                      {a.context}
                    </T>
                  </View>
                  {a.action ? (
                    <Pressable style={s.enter}>
                      <Text style={s.enterText}>{a.action}</Text>
                    </Pressable>
                  ) : (
                    <ChevronRight size={18} color={colors.muted} />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Lendo agora */}
      <View>
        <SectionHeader title={`Lendo agora · ${lendo.length}`} action="estante" onAction={() => router.push('/estante/lendo')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {lendo.map(({ book, reading }) => {
            const pct = Math.round((reading.page / book.pages) * 100);
            return (
              <Card key={book.id} style={s.reading}>
                <BookCover book={book} width={64} onPress={() => router.push(`/livro/${book.id}`)} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.readingTitle} numberOfLines={2}>
                    {book.title}
                  </Text>
                  <T style={type.small}>{book.author}</T>
                  <View style={{ marginTop: 8, gap: 6 }}>
                    <ProgressBar pct={pct} height={4} />
                    <Text style={type.mono}>
                      p. {reading.page} de {book.pages} · {pct}%
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={s.plus}
                  accessibilityLabel="Anotar páginas"
                  onPress={() => router.push({ pathname: '/progresso', params: { id: book.id } })}
                >
                  <Plus size={20} color={colors.accentDark} />
                </Pressable>
              </Card>
            );
          })}
        </ScrollView>
      </View>

      {/* Metas */}
      {me ? (
        <View style={s.stats}>
          <Card style={s.stat}>
            <Ring value={18} total={20} />
            <Text style={[type.title, { marginTop: 8 }]}>faltam 2</Text>
            <T style={type.small}>meta do dia · 20</T>
          </Card>
          <Card style={s.stat}>
            <Text style={s.bigNum}>
              {me.streakDays} <Text style={type.small}>dias</Text>
            </Text>
            <View style={s.dots}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={[s.dot, { backgroundColor: i < 3 ? colors.accent : colors.line }, i === 3 && s.dotToday]} />
              ))}
            </View>
            <T style={type.small}>sequência</T>
          </Card>
          <Card style={s.stat}>
            <Text style={s.bigNum}>
              {me.yearGoal.done}
              <Text style={[type.small, { fontFamily: fonts.monoBold }]}>/{me.yearGoal.target}</Text>
            </Text>
            <View style={{ marginVertical: 10 }}>
              <ProgressBar pct={(me.yearGoal.done / me.yearGoal.target) * 100} color={colors.green} height={5} />
            </View>
            <T style={type.small}>livros no ano</T>
          </Card>
        </View>
      ) : null}

      {/* Página do dia */}
      {home ? (
        <View style={s.quote}>
          <Eyebrow color={colors.lineStrong}>Página do dia</Eyebrow>
          <Text style={s.quoteText}>{home.pageOfTheDay.text}</Text>
          <View style={s.quoteFoot}>
            <Text style={s.quoteSrc}>
              {home.pageOfTheDay.source} ·{'\n'}você está na p. {store.reading(home.pageOfTheDay.bookId)?.page ?? 0}
            </Text>
            <Pressable style={s.quoteBtn}>
              <Text style={s.quoteBtnText}>fazer um card</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Do seu clube */}
      {home ? (
        <View>
          <SectionHeader title="Do seu clube" action="ver mural" />
          <Card style={{ marginHorizontal: 20, paddingHorizontal: 14 }}>
            {home.clubFeed.map((p, i) => (
              <View key={p.id}>
                {i > 0 ? <Divider /> : null}
                <Pressable style={s.post}>
                  {p.kind === 'enquete' ? (
                    <View style={[s.postIcon, { backgroundColor: colors.cream }]}>
                      <ListChecks size={18} color={colors.ink} />
                    </View>
                  ) : p.kind === 'terminaram' ? (
                    <View style={s.stack}>
                      {['T', 'C', 'RN'].map((x, j) => (
                        <View key={x} style={[s.mini, { left: j * 8, backgroundColor: [colors.rose, colors.lilac, colors.greenMint][j] }]}>
                          <Text style={s.miniText}>{x}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Avatar initials={p.initials!} bg={p.avatarBg!} fg={p.avatarFg!} size={36} />
                  )}
                  <View style={{ flex: 1 }}>
                    <T style={type.title}>{p.title}</T>
                    <T style={type.small}>{p.sub}</T>
                  </View>
                  {p.kind === 'enquete' ? (
                    <View style={s.vote}>
                      <Text style={s.voteText}>votar</Text>
                    </View>
                  ) : p.kind === 'aviso' ? (
                    <Tag label="AVISO" tone="accent" />
                  ) : (
                    <ChevronRight size={18} color={colors.muted} />
                  )}
                </Pressable>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      {/* Recomendações */}
      {home ? (
        <View>
          <SectionHeader title={home.because.title} action="descobrir" onAction={() => router.push('/descobrir')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {home.because.books.map((b) => (
              <Pressable key={b.id} style={{ width: 92 }} onPress={() => router.push(`/livro/${b.id}`)}>
                <BookCover book={b} width={92} />
                <T style={[type.title, { fontSize: 13, marginTop: 8 }]} numberOfLines={2}>
                  {b.title}
                </T>
                <T style={[type.small, { fontSize: 11 }]} numberOfLines={2}>
                  {b.author}
                </T>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </ScrollView>
  );
}

/** Anel de progresso simples (sem SVG): borda cheia + arco aproximado por borda colorida. */
function Ring({ value, total }: { value: number; total: number }) {
  const pct = value / total;
  return (
    <View style={s.ring}>
      <View
        style={[
          s.ringArc,
          {
            borderTopColor: colors.accent,
            borderRightColor: pct > 0.25 ? colors.accent : 'transparent',
            borderBottomColor: pct > 0.5 ? colors.accent : 'transparent',
            borderLeftColor: pct > 0.75 ? colors.accent : 'transparent',
          },
        ]}
      />
      <Text style={s.ringText}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  badgeText: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.paper },
  agenda: { marginHorizontal: 20, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.accentLine, overflow: 'hidden', backgroundColor: colors.card },
  agendaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
  agendaTime: { width: 58, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.accentLine, paddingRight: 10 },
  time: { fontFamily: fonts.monoBold, fontSize: 15, color: colors.ink },
  timeSub: { fontFamily: fonts.mono, fontSize: 10, color: colors.muted },
  agendaBody: { flex: 1, gap: 2 },
  enter: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 14, height: 36, justifyContent: 'center' },
  enterText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.paper },
  reading: { width: 300, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  readingTitle: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 20, color: colors.ink },
  plus: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  stat: { flex: 1, padding: 12, borderWidth: 1, borderColor: colors.line, shadowOpacity: 0, elevation: 0 },
  bigNum: { fontFamily: fonts.monoBold, fontSize: 24, color: colors.ink },
  dots: { flexDirection: 'row', gap: 4, marginVertical: 10, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotToday: { width: 9, height: 9, borderWidth: 2, borderColor: colors.accent, backgroundColor: colors.card },
  ring: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  ringArc: { position: 'absolute', width: 42, height: 42, borderRadius: 21, borderWidth: 4, transform: [{ rotate: '-45deg' }] },
  ringText: { fontFamily: fonts.monoBold, fontSize: 12, color: colors.ink },
  quote: { marginHorizontal: 20, backgroundColor: colors.dark, borderRadius: radius.lg, padding: 18, gap: 12 },
  quoteText: { fontFamily: fonts.serifRegular, fontSize: 19, lineHeight: 28, color: colors.paper },
  quoteFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quoteSrc: { fontFamily: fonts.sans, fontSize: 12, color: colors.lineStrong, lineHeight: 17 },
  quoteBtn: { borderWidth: 1, borderColor: 'rgba(255,253,249,.35)', borderRadius: radius.pill, paddingHorizontal: 14, height: 36, justifyContent: 'center' },
  quoteBtnText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.paper },
  post: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  postIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stack: { width: 36, height: 20 },
  mini: { position: 'absolute', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.card },
  miniText: { fontFamily: fonts.sansBold, fontSize: 7, color: colors.ink },
  vote: { borderWidth: 1, borderColor: colors.accentLine, borderRadius: radius.pill, paddingHorizontal: 12, height: 32, justifyContent: 'center' },
  voteText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.accentDark },
});
