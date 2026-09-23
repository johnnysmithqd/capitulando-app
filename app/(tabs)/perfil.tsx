import { router } from 'expo-router';
import {
  Armchair,
  ChevronRight,
  Flame,
  AtSign,
  Globe,
  GripVertical,
  ImageIcon,
  Lock,
  Megaphone,
  PencilLine,
  Settings,
  Share2,
  SlidersHorizontal,
  Video,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { emBreve } from '../../src/components/emBreve';
import { Avatar, Card, Chip, Divider, Eyebrow, ProgressBar, SectionHeader, Stars, T, Tag } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { filtrarDiario } from '../../src/data/filtros';
import { diarioFiltroPadrao, useApi, useStore } from '../../src/data/store';
import type { User } from '../../src/data/types';
import { colors, fonts, radius, type } from '../../src/theme';

const ABAS = [
  ['sobre', 'Sobre'],
  ['estantes', 'Estantes'],
  ['clubes', 'Clubes'],
  ['projetos', 'Projetos'],
  ['diario', 'Diário'],
  ['estatisticas', 'Estatísticas'],
] as const;
type Aba = (typeof ABAS)[number][0];
type Profile = Awaited<ReturnType<typeof api.getProfile>>;

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const me = useApi(api.getMe);
  const p = useApi(api.getProfile);
  const [aba, setAba] = useState<Aba>('sobre');

  if (!me || !p) return <View style={{ flex: 1 }} />;

  return (
    <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingBottom: 40 }}>
      <Header me={me} top={insets.top} />

      <View style={s.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 20 }}>
          {ABAS.map(([k, label]) => {
            const on = k === aba;
            return (
              <Pressable key={k} onPress={() => setAba(k)} style={s.tab}>
                <Text style={[s.tabText, on && { color: colors.accent }]}>{label}</Text>
                {on ? <View style={s.tabMarker} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ paddingTop: 18, gap: 20 }}>
        {aba === 'sobre' && <Sobre me={me} p={p} />}
        {aba === 'estantes' && <Estantes p={p} />}
        {aba === 'clubes' && (
          <Grupos
            participo={p.clubs.participo.map((c) => ({
              id: c.id,
              title: c.name,
              sub: c.meta,
              lead: <BookCover book={{ title: c.coverTitle ?? c.name, coverColor: c.coverColor ?? colors.accent }} width={40} />,
              onPress: () => router.push(`/sala-clube/${c.id}`),
            }))}
            conduzo={p.clubs.conduzo.map((c) => ({
              id: c.id,
              title: c.name,
              sub: c.meta,
              lead: <IconBox bg={c.iconBg} icon={<Armchair size={20} color={c.iconFg} />} />,
              onPress: () => emBreve('Painel do clube'),
            }))}
          />
        )}
        {aba === 'projetos' && (
          <Grupos
            participo={p.projects.participo.map((x) => ({
              id: x.id,
              title: x.title,
              sub: x.sub,
              lead: <BookCover book={{ title: x.title, coverColor: x.coverColor }} width={40} />,
              onPress: () => router.push(`/projeto/${x.id}`),
            }))}
            conduzo={p.projects.conduzo.map((x) => ({
              id: x.id,
              title: x.title,
              sub: x.sub,
              lead: <IconBox bg={colors.lilacSoft} icon={<Megaphone size={20} color={colors.ink} />} />,
              onPress: () => emBreve('Painel do projeto'),
            }))}
          />
        )}
        {aba === 'diario' && <Diario p={p} />}
        {aba === 'estatisticas' && <Estatisticas p={p} />}
      </View>
    </ScrollView>
  );
}

function Header({ me, top }: { me: User; top: number }) {
  const linkIcon = { instagram: AtSign, youtube: Video, site: Globe } as const;
  return (
    <View>
      <View style={[s.cover, { paddingTop: top }]}>
        <View style={[s.coverActions, { top: top + 8 }]}>
          <Pressable style={s.pill} onPress={() => router.push('/editar-perfil')}>
            <PencilLine size={16} color={colors.ink} />
            <Text style={s.pillText}>Editar perfil</Text>
          </Pressable>
          <Pressable style={s.round} accessibilityLabel="Compartilhar perfil" onPress={() => Share.share({ message: `@${me.handle} no Capitulando` })}>
            <Share2 size={18} color={colors.ink} />
          </Pressable>
          <Pressable style={s.round} accessibilityLabel="Configurações" onPress={() => router.push('/config')}>
            <Settings size={18} color={colors.ink} />
          </Pressable>
        </View>
        <ImageIcon size={24} color={colors.muted} />
        <T style={[type.small, { marginTop: 4 }]}>Imagem de capa</T>
      </View>
      <View style={{ alignItems: 'center', marginTop: -44, gap: 4, paddingHorizontal: 20 }}>
        <View style={s.avatarRing}>
          <Avatar initials={me.initials} bg={me.avatarBg} fg={me.avatarFg} size={80} />
        </View>
        <Text style={s.name}>{me.name}</Text>
        <Text style={type.mono}>
          @{me.handle} · membro desde {me.memberSince}
        </Text>
        <View style={s.counts}>
          {[
            [me.stats.books, 'livros'],
            [me.stats.followers, 'seguidores'],
            [me.stats.following, 'seguindo'],
          ].map(([n, l]) => (
            <View key={l} style={{ alignItems: 'center' }}>
              <Text style={s.countNum}>{n}</Text>
              <T style={type.small}>{l}</T>
            </View>
          ))}
        </View>
        <View style={s.links}>
          {me.links.map((l) => {
            const I = linkIcon[l.kind];
            return (
              <View key={l.label} style={s.linkChip}>
                <I size={14} color={colors.ink} />
                <Text style={s.linkText}>{l.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function Sobre({ me, p }: { me: User; p: Profile }) {
  const { width } = useWindowDimensions();
  const favW = (width - 40 - 24) / 4;
  return (
    <>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {me.bio.map((t, i) => (
          <Text key={i} style={s.bio}>
            {t}
          </Text>
        ))}
      </View>
      <Card style={{ marginHorizontal: 20, padding: 14, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T style={[type.title, { fontFamily: fonts.sansSemi }]}>Meta de {me.yearGoal.year}</T>
          <Text style={type.mono}>
            {me.yearGoal.done} de {me.yearGoal.target} livros
          </Text>
        </View>
        <ProgressBar pct={(me.yearGoal.done / me.yearGoal.target) * 100} />
        <T style={type.small}>{me.yearGoal.note}</T>
      </Card>
      <View>
        <SectionHeader title="Favoritos" action="editar" />
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20 }}>
          {p.favorites.map((b) => (
            <BookCover key={b.id} book={b} width={favW} onPress={() => router.push(`/livro/${b.id}`)} />
          ))}
        </View>
      </View>
    </>
  );
}

function Estantes({ p }: { p: Profile }) {
  return (
    <>
      <View style={s.shelfGrid}>
        {p.shelves.map((sh) => (
          <Pressable key={sh.status} style={s.shelf} onPress={() => router.push(`/estante/${sh.status}`)}>
            <View style={{ flexDirection: 'row' }}>
              {sh.covers.map((c, i) => (
                <View key={i} style={[s.miniCover, { backgroundColor: c, marginLeft: i ? -14 : 0 }]} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <T style={type.title}>{sh.label}</T>
              <Text style={type.mono}>{sh.count}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <View>
        <SectionHeader title="Minhas listas" action="+ nova lista" />
        <View style={{ paddingHorizontal: 20 }}>
          {p.lists.map((l, i) => (
            <View key={l.id}>
              {i > 0 ? <Divider /> : null}
              <Pressable style={s.row} onPress={() => router.push(`/lista/${l.id}`)}>
                <GripVertical size={16} color={colors.lineStrong} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <T style={[type.title, { fontFamily: fonts.sansSemi }]}>{l.name}</T>
                    {l.private ? <Lock size={13} color={colors.muted} /> : null}
                  </View>
                  <T style={type.small}>{l.meta}</T>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

type GrupoItem = { id: string; title: string; sub: string; lead: ReactNode; onPress?: () => void };
function Grupos({ participo, conduzo }: { participo: GrupoItem[]; conduzo: GrupoItem[] }) {
  const bloco = (titulo: string, itens: GrupoItem[]) => (
    <View style={{ paddingHorizontal: 20 }}>
      <Eyebrow style={{ marginBottom: 6 }}>{titulo}</Eyebrow>
      {itens.map((x) => (
        <View key={x.id}>
          <Pressable style={s.row} onPress={x.onPress}>
            {x.lead}
            <View style={{ flex: 1 }}>
              <T style={[type.title, { fontFamily: fonts.sansSemi }]}>{x.title}</T>
              <T style={type.small}>{x.sub}</T>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
          <Divider />
        </View>
      ))}
    </View>
  );
  return (
    <>
      {bloco('Participo', participo)}
      {bloco('Conduzo', conduzo)}
    </>
  );
}

function IconBox({ bg, icon }: { bg: string; icon: ReactNode }) {
  return <View style={[s.iconBox, { backgroundColor: bg }]}>{icon}</View>;
}

function Diario({ p }: { p: Profile }) {
  const { diarioFiltro } = useStore();
  const meses = filtrarDiario(p.diary, diarioFiltro);
  const ativo = JSON.stringify(diarioFiltro) !== JSON.stringify(diarioFiltroPadrao);
  return (
    <View style={{ paddingHorizontal: 20, gap: 14 }}>
      <View style={{ flexDirection: 'row' }}>
        <Chip label="Filtrar" active={ativo} icon={<SlidersHorizontal size={16} color={colors.ink} />} onPress={() => router.push('/filtrar-diario')} />
      </View>
      {meses.length === 0 ? <T style={type.small}>Nenhuma entrada com esses filtros.</T> : null}
      {meses.map((m) => (
        <View key={m.month}>
          <Eyebrow style={{ marginBottom: 4 }}>{m.month}</Eyebrow>
          {m.items.map((it, i) => (
            <View key={it.book.id + it.day}>
              {i > 0 ? <Divider /> : null}
              <Pressable style={s.row} onPress={() => router.push({ pathname: '/entrada', params: { id: it.book.id } })}>
                <View style={s.date}>
                  <Text style={s.dateDay}>{it.day}</Text>
                  <Text style={s.dateMon}>{it.mon}</Text>
                </View>
                <BookCover book={it.book} width={38} showTitle={false} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.diaryTitle}>{it.book.title}</Text>
                  <T style={type.small}>{it.book.author}</T>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Stars value={it.rating} />
                    {it.extra ? <Tag label={it.extra} /> : null}
                  </View>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function Estatisticas({ p }: { p: Profile }) {
  const st = p.stats;
  const max = Math.max(...st.pagesPerMonth.map((x) => x.v));
  return (
    <View style={{ paddingHorizontal: 20, gap: 10 }}>
      <Card style={{ padding: 14, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T style={[type.title, { fontFamily: fonts.sansSemi }]}>Páginas por mês</T>
          <Text style={type.mono}>{st.pagesYear.toLocaleString('pt-BR')} em 2026</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, height: 90, alignItems: 'flex-end' }}>
          {st.pagesPerMonth.map((x, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  alignSelf: 'stretch',
                  height: (x.v / max) * 72,
                  borderRadius: 3,
                  backgroundColor: i === st.pagesPerMonth.length - 1 ? colors.accent : colors.lineStrong,
                }}
              />
              <Text style={[type.mono, { fontSize: 9 }]}>{x.m}</Text>
            </View>
          ))}
        </View>
      </Card>
      <View style={s.statGrid}>
        <StatCard label="Livros" big={String(st.booksYear)} sub={`em 2026 · ${st.booksLife} na vida`} />
        <StatCard
          label="Nota média"
          big={String(st.avgRating).replace('.', ',')}
          extra={<Text style={{ color: colors.gold, fontSize: 14 }}> ★</Text>}
          sub={`média da casa: ${String(st.communityAvg).replace('.', ',')}`}
        />
        <StatCard label="Sequência" big={String(st.streak)} extra={<Flame size={18} color={colors.ink} />} sub={`dias lendo · recorde ${st.streakRecord}`} />
        <StatCard label="Autor(a) do ano" title={st.authorOfYear.name} sub={st.authorOfYear.sub} />
      </View>
      <Card style={{ padding: 14, gap: 10 }}>
        <T style={[type.title, { fontFamily: fonts.sansSemi }]}>Gêneros</T>
        {st.genres.map((g) => (
          <View key={g.name} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T>{g.name}</T>
              <Text style={type.mono}>{g.pct}%</Text>
            </View>
            <ProgressBar pct={g.pct} color={colors.lineStrong} height={5} />
          </View>
        ))}
      </Card>
      <Pressable style={s.share}>
        <Share2 size={18} color={colors.ink} />
        <Text style={[type.body, { fontFamily: fonts.sansSemi }]}>Compartilhar retrospectiva do mês</Text>
      </Pressable>
    </View>
  );
}

function StatCard({ label, big, title, extra, sub }: { label: string; big?: string; title?: string; extra?: ReactNode; sub: string }) {
  return (
    <Card style={s.statCard}>
      <Eyebrow>{label}</Eyebrow>
      {big ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={s.statBig}>{big}</Text>
          {extra}
        </View>
      ) : (
        <Text style={s.statTitle}>{title}</Text>
      )}
      <T style={type.small}>{sub}</T>
    </Card>
  );
}

const s = StyleSheet.create({
  cover: {
    height: 170,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverActions: { position: 'absolute', right: 16, flexDirection: 'row', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 14, height: 38 },
  pillText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  round: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  avatarRing: { borderRadius: 46, borderWidth: 4, borderColor: colors.bg },
  name: { fontFamily: fonts.serifBold, fontSize: 24, color: colors.ink, marginTop: 6 },
  counts: { flexDirection: 'row', gap: 32, marginTop: 12 },
  countNum: { fontFamily: fonts.monoBold, fontSize: 16, color: colors.ink },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14, marginBottom: 12 },
  linkChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: 12, height: 32, backgroundColor: colors.card },
  linkText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink },
  tabsWrap: { backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.accentLine },
  tab: { paddingVertical: 12, alignItems: 'center' },
  tabText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.muted },
  tabMarker: { position: 'absolute', bottom: -8, width: 12, height: 12, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] },
  bio: { fontFamily: fonts.serifRegular, fontSize: 16, lineHeight: 25, color: colors.ink },
  shelfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
  shelf: { width: '48.5%', backgroundColor: colors.card, borderRadius: radius.lg, padding: 14 },
  miniCover: { width: 34, height: 58, borderRadius: 3, borderWidth: 1, borderColor: 'rgba(0,0,0,.08)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  date: { width: 48, height: 44, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  dateDay: { fontFamily: fonts.serifBold, fontSize: 18, lineHeight: 20, color: colors.accentDark },
  dateMon: { fontFamily: fonts.monoBold, fontSize: 9, color: colors.accentDark },
  diaryTitle: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48.5%', padding: 14, gap: 4 },
  statBig: { fontFamily: fonts.serifBold, fontSize: 32, lineHeight: 38, color: colors.ink },
  statTitle: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 22, color: colors.ink },
  share: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accentLine, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
