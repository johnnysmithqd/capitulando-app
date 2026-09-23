import { router } from 'expo-router';
import { Armchair, ChevronRight, Plus, Sparkles, Trophy, Truck } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { Abas, LinhaTracejada, fmt, juntosStyles as j, minhasPaginas } from '../../src/components/juntos';
import * as api from '../../src/data/api';
import type { DesafioCard, ItemJuntos } from '../../src/data/juntos/desafios';
import { useApi, useStore } from '../../src/data/store';
import { colors, fonts, radius } from '../../src/theme';

type Aba = 'desafios' | 'clubes' | 'projetos' | 'leituras';
const ABAS: { key: Aba; label: string }[] = [
  { key: 'desafios', label: 'Desafios' },
  { key: 'clubes', label: 'Clubes' },
  { key: 'projetos', label: 'Projetos' },
  { key: 'leituras', label: 'Leituras coletivas' },
];
const CRIAR: Record<Aba, string> = { desafios: 'Desafio', clubes: 'Clube', projetos: 'Projeto', leituras: 'Leitura' };

const seta = <ChevronRight size={20} color={colors.faint} />;

export default function Juntos() {
  const insets = useSafeAreaInsets();
  const [aba, setAba] = useState<Aba>('desafios');
  const data = useApi(api.getJuntos);

  const criar = () => {
    if (aba === 'clubes') router.push('/criar-clube');
    else if (aba === 'projetos') router.push('/criar-projeto');
    // leitura coletiva nasce na página do livro: escolha um livro e convide quem lê junto
    else if (aba === 'leituras') router.push('/estante/lendo');
    else router.push('/criar-desafio');
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={s.head}>
        <Text style={s.h1}>Juntos</Text>
        <Pressable onPress={criar} style={({ pressed }) => [s.criar, pressed && { opacity: 0.85 }]} hitSlop={4}>
          <Plus size={16} color={colors.accentDark} />
          <Text style={s.criarText}>{CRIAR[aba]}</Text>
        </Pressable>
      </View>
      <Abas items={ABAS} value={aba} onChange={setAba} />

      <ScrollView contentContainerStyle={{ paddingTop: 26, paddingBottom: 100, paddingHorizontal: 20 }}>
        {data && aba === 'desafios' && (
          <View style={{ gap: 12 }}>
            {data.desafios.map((d) => (
              <CardDesafio key={d.id} d={d} />
            ))}
            <LinhaTracejada
              icon={<Trophy size={20} color={colors.gold} />}
              iconBg={colors.goldSoft}
              title={data.encerrado.nome}
              sub={data.encerrado.desc}
              right={seta}
              onPress={() => router.push(`/podio/${data.encerrado.id}`)}
            />
          </View>
        )}

        {data && aba === 'clubes' && (
          <View style={{ gap: 18 }}>
            <Grupo titulo={`Participo · ${data.clubes.participo.length}`}>
              {data.clubes.participo.map((c) => (
                <LinhaClube key={c.id} c={c} onPress={() => router.push(`/sala-clube/${c.id}`)} />
              ))}
            </Grupo>
            <Grupo titulo={`Conduzo · ${data.clubes.conduzo.length}`}>
              {data.clubes.conduzo.map((c) => (
                <LinhaClube key={c.id} c={c} onPress={() => router.push(`/painel-clube/${c.id}`)} />
              ))}
            </Grupo>
            <LinhaTracejada
              icon={<Armchair size={20} color={colors.inkSoft} />}
              iconBg={colors.cream}
              title="Abrir um clube"
              sub="uns 15 minutos · a casa fica com 14% da assinatura"
              right={seta}
              onPress={() => router.push('/criar-clube')}
            />
          </View>
        )}

        {data && aba === 'projetos' && (
          <View style={{ gap: 18 }}>
            <Grupo titulo={`Participo · ${data.projetos.participo.length}`}>
              {data.projetos.participo.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/apoio/${p.id}`)} style={[j.card, { padding: 14, gap: 10 }]}>
                  <View style={{ gap: 2 }}>
                    <Text style={j.rowTitle}>{p.nome}</Text>
                    <Text style={s.sub}>{p.linha1}</Text>
                  </View>
                  <View style={s.envio}>
                    <Truck size={16} color={colors.green} />
                    <Text style={s.envioText}>{p.envio}</Text>
                  </View>
                </Pressable>
              ))}
            </Grupo>
            <Grupo titulo={`Conduzo · ${data.projetos.conduzo.length}`}>
              {data.projetos.conduzo.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/painel-projeto/${p.id}`)} style={s.conduzoProjeto}>
                  <View style={{ flex: 1 }}>
                    <Text style={j.rowTitle}>{p.nome}</Text>
                    <Text style={j.rowSub}>{p.linha1}</Text>
                  </View>
                  {seta}
                </Pressable>
              ))}
            </Grupo>
            <LinhaTracejada
              icon={<Sparkles size={20} color={colors.inkSoft} />}
              iconBg={colors.cream}
              title="Abrir um projeto"
              sub="uns 10 minutos · 5% + R$ 0,50 por apoio"
              right={seta}
              onPress={() => router.push('/criar-projeto')}
            />
          </View>
        )}

        {data && aba === 'leituras' && (
          <View style={{ gap: 12 }}>
            {data.leituras.map((l) => (
              <Pressable key={l.id} onPress={() => router.push(`/livro/${l.bookId}`)} style={[j.card, s.linha]}>
                <BookCover book={{ title: l.titulo, coverColor: l.cor }} width={40} />
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text style={j.rowTitle} numberOfLines={1}>
                    {l.titulo}
                  </Text>
                  <Text style={s.sub}>{l.pessoas}</Text>
                  <Text style={j.mono}>{l.ritmo}</Text>
                </View>
                {seta}
              </Pressable>
            ))}
            <Text style={s.nota}>
              Leitura coletiva é um livro combinado com poucas pessoas, sem clube: um ritmo, uma conversa, acabou. Você convida pela
              página do livro.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function CardDesafio({ d }: { d: DesafioCard }) {
  const store = useStore();
  const desafio = useApi(() => (d.tipo === 'grupo' ? api.getDesafio(d.id) : Promise.resolve(null)), [d.id]);
  let valor = d.valor ?? '';
  let pct = d.pct ?? 0;
  let pos = '';
  if (d.tipo === 'grupo' && desafio) {
    const minhas = minhasPaginas(desafio, store.reading(desafio.base.bookId)?.page);
    const acima = desafio.ranking.filter((r) => !r.pessoa.eu && r.paginas > minhas).length;
    pos = `${acima + 1}º · `;
    valor = `${fmt(minhas)} de ${fmt(desafio.meta)}`;
    pct = Math.min(100, Math.round((minhas / desafio.meta) * 100));
  }
  const vivo = d.tipo === 'grupo';
  return (
    <Pressable onPress={() => router.push(`/desafio/${d.id}`)} style={[j.card, { padding: 14, gap: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={j.rowTitle}>{d.nome}</Text>
          <Text style={j.rowSub}>{d.desc}</Text>
        </View>
        <View style={[s.pill, { backgroundColor: vivo ? colors.accentSoft : colors.cream }]}>
          <Text style={[s.pillText, { color: vivo ? colors.accentDark : colors.inkSoft }]}>
            {pos}
            {valor}
          </Text>
        </View>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct}%` }]} />
      </View>
    </Pressable>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={j.eyebrow}>{titulo}</Text>
      {children}
    </View>
  );
}

function LinhaClube({ c, onPress }: { c: ItemJuntos; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[j.card, s.linha]}>
      <View style={[s.foto, { backgroundColor: c.cor ?? colors.cream }]}>
        <Armchair size={24} color={colors.creamSoft} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={j.rowTitle}>{c.nome}</Text>
        <Text style={s.sub}>{c.linha1}</Text>
        <Text style={j.mono}>{c.linha2}</Text>
      </View>
      {seta}
    </Pressable>
  );
}

const s = StyleSheet.create({
  head: { paddingTop: 8, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h1: { fontFamily: fonts.serif, fontSize: 23, lineHeight: 29, color: colors.ink },
  criar: { height: 40, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.accentSoft, flexDirection: 'row', alignItems: 'center', gap: 6 },
  criarText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.accentDark },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  pillText: { fontFamily: fonts.monoBold, fontSize: 14, lineHeight: 16 },
  track: { height: 6, borderRadius: 6, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 6, backgroundColor: colors.accent },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  foto: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sub: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  envio: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.greenSoft },
  envioText: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 13, lineHeight: 16, color: colors.green },
  conduzoProjeto: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.cream },
  nota: { paddingHorizontal: 4, fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.muted },
});
