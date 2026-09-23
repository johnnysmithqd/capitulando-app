import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, ChevronLeft, Flame, Share2, Trophy } from 'lucide-react-native';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { juntosStyles as j } from '../../src/components/juntos';
import * as api from '../../src/data/api';
import type { Podio } from '../../src/data/juntos/desafios';
import { useApi } from '../../src/data/store';
import { colors, fonts, radius } from '../../src/theme';

const ALTURA: Record<number, number> = { 1: 104, 2: 72, 3: 52 };

const SELO: Record<Podio['selos'][number]['id'], { bg: string; fg: string; icon: (c: string) => ReactNode }> = {
  lugar: { bg: colors.goldSoft, fg: colors.gold, icon: (c) => <Trophy size={22} color={c} /> },
  sequencia: { bg: colors.accentSoft, fg: colors.accentDark, icon: (c) => <Flame size={22} color={c} /> },
  livros: { bg: colors.greenSoft, fg: colors.green, icon: (c) => <BookOpen size={22} color={c} /> },
};

export default function PodioFinal() {
  const { id = 'agosto' } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const p = useApi(() => api.getPodio(id), [id]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={j.top}>
        <Pressable onPress={() => router.back()} style={j.topBtn} accessibilityLabel="Voltar">
          <ChevronLeft size={26} color={colors.ink} />
        </Pressable>
        <Text style={s.titulo} numberOfLines={1}>
          {p?.nome ?? ''}
        </Text>
        <View style={[s.carimbo, { borderColor: colors.muted, marginRight: 12 }]}>
          <Text style={[s.carimboText, { color: colors.muted, fontSize: 11 }]}>Encerrado</Text>
        </View>
      </View>

      {p && (
        <ScrollView contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: insets.bottom + 150, gap: 20 }}>
          <View style={[j.card, s.palco]}>
            <Carimbo texto={p.titulo} />
            <View style={s.degraus}>
              {p.lugares.map((l) => (
                <View key={l.pessoa.id} style={s.lugar}>
                  <View style={[s.ini, { backgroundColor: l.pessoa.bg }]}>
                    <Text style={[s.iniText, { color: l.pessoa.fg }]}>{l.pessoa.ini}</Text>
                  </View>
                  <Text style={s.nome}>{l.pessoa.nome}</Text>
                  <View style={[s.degrau, { height: ALTURA[l.pos] ?? 52 }]}>
                    <Text style={s.pos}>{l.pos}</Text>
                    <Text style={s.valor}>{l.valor}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Text style={s.resumo}>
              {p.pessoas} pessoas · <Text style={s.resumoNum}>{p.total}</Text> páginas juntas · {p.dias} dias
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {p.destaques.map((d) => (
              <View key={d.rotulo} style={[j.card, { flex: 1, padding: 14, gap: 4 }]}>
                <Text style={j.eyebrow}>{d.rotulo}</Text>
                <Text style={s.destaque}>{d.titulo}</Text>
                <Text style={s.destaqueSub}>{d.sub}</Text>
              </View>
            ))}
          </View>

          <View style={{ gap: 8 }}>
            <Text style={j.eyebrow}>Selos deste desafio</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {p.selos.map((sl) => {
                const t = SELO[sl.id];
                return (
                  <View key={sl.id} style={[s.selo, { backgroundColor: t.bg }]}>
                    {t.icon(t.fg)}
                    <Text style={[s.seloText, { color: t.fg }]}>{sl.nome}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      <View style={[s.rodape, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={() => router.push({ pathname: '/estudio', params: { tipo: 'desafio', id } })}
          style={({ pressed }) => [j.primary, s.sombra, pressed && { opacity: 0.9 }]}
        >
          <Share2 size={18} color={colors.paper} />
          <Text style={j.primaryText}>Compartilhar pódio</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/criar-desafio')} style={s.repetir}>
          <Text style={s.repetirText}>Repetir em outubro</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Carimbo "Campeã" que entra girando, como no protótipo. */
function Carimbo({ texto }: { texto: string }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 600, easing: Easing.bezier(0.32, 0.72, 0, 1), useNativeDriver: true }).start();
  }, [a]);
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [1.6, 1] });
  return (
    <Animated.View style={[s.carimbo, { borderColor: colors.gold, opacity: a, transform: [{ rotate: '-3deg' }, { scale }] }]}>
      <Text style={[s.carimboText, { color: colors.gold }]}>{texto}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  titulo: { flex: 1, fontFamily: fonts.serif, fontSize: 17, lineHeight: 22, color: colors.ink },
  carimbo: { borderWidth: 2, borderRadius: 4, paddingTop: 6, paddingBottom: 5, paddingLeft: 10, paddingRight: 8, transform: [{ rotate: '-3deg' }] },
  carimboText: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 12, letterSpacing: 1.6, textTransform: 'uppercase' },
  palco: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20, gap: 18, alignItems: 'center' },
  degraus: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, width: '100%' },
  lugar: { flex: 1, maxWidth: 100, alignItems: 'center', gap: 8 },
  ini: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iniText: { fontFamily: fonts.sansBold, fontSize: 15 },
  nome: { fontFamily: fonts.sansBold, fontSize: 13, lineHeight: 16, color: colors.ink },
  degrau: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: colors.cream, alignItems: 'center', paddingTop: 8, gap: 2 },
  pos: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 24, color: colors.ink },
  valor: { fontFamily: fonts.monoBold, fontSize: 11, lineHeight: 14, color: colors.muted },
  resumo: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.inkSoft, textAlign: 'center' },
  resumoNum: { fontFamily: fonts.monoBold, fontSize: 13 },
  destaque: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 22, color: colors.ink },
  destaqueSub: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted },
  selo: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12 },
  seloText: { fontFamily: fonts.sansBold, fontSize: 11, lineHeight: 14, textAlign: 'center' },
  rodape: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, paddingHorizontal: 20, gap: 8, backgroundColor: 'rgba(250,246,239,0.94)' },
  sombra: { shadowColor: colors.ink, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  repetir: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  repetirText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.inkSoft },
});
