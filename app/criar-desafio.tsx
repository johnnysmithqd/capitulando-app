import { router } from 'expo-router';
import { Bookmark, BookOpen, ChevronLeft, Flame, MessageCircle, Timer } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fmt, juntosStyles as j } from '../src/components/juntos';
import * as api from '../src/data/api';
import type { MetricaDesafio, PeriodoDesafio } from '../src/data/juntos/desafios';
import { useApi } from '../src/data/store';
import { colors, fonts, radius } from '../src/theme';

const TOTAL = 4;

const ICONE: Record<MetricaDesafio, (c: string) => ReactNode> = {
  paginas: (c) => <BookOpen size={22} color={c} />,
  minutos: (c) => <Timer size={22} color={c} />,
  livros: (c) => <Bookmark size={22} color={c} />,
  dias: (c) => <Flame size={22} color={c} />,
};

const slug = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default function CriarDesafio() {
  const insets = useSafeAreaInsets();
  const op = useApi(api.getOpcoesDesafio);
  const [passo, setPasso] = useState(1);
  const [nome, setNome] = useState<string | null>(null);
  const [metrica, setMetrica] = useState<MetricaDesafio>('paginas');
  const [periodo, setPeriodo] = useState<PeriodoDesafio>('mes');
  const [meta, setMeta] = useState<number | null>(null);
  const [foco, setFoco] = useState(false);

  const voltar = () => (passo === 1 ? router.back() : setPasso(passo - 1));

  // voltar do Android recua um passo
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (passo > 1) {
        setPasso(passo - 1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [passo]);

  if (!op) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const nomeAtual = nome ?? op.nomePadrao;
  const metaAtual = meta ?? op.metaPadrao;
  const m = op.metricas.find((x) => x.id === metrica) ?? op.metricas[0];
  const p = op.periodos.find((x) => x.id === periodo) ?? op.periodos[1];
  const link = nomeAtual === op.nomePadrao ? op.linkPadrao : `capitulando.com/d/${slug(nomeAtual) || 'novo-desafio'}`;
  const next = () => setPasso((n) => Math.min(TOTAL, n + 1));

  const copiar = () => Alert.alert('Link copiado', link);
  const whatsapp = () => Share.share({ message: `Bora ler junto? ${nomeAtual} no Capitulando: https://${link}` });
  const criar = async () => {
    const d = await api.createChallenge({ nome: nomeAtual.trim() || op.nomePadrao, metrica, periodo, meta: metaAtual || undefined });
    router.replace({ pathname: '/desafio/[id]', params: { id: d.id, criado: '1' } });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.top}>
        <Pressable onPress={voltar} style={j.topBtn} accessibilityLabel="Voltar">
          <ChevronLeft size={26} color={colors.ink} />
        </Pressable>
        <View style={s.dots}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <View key={i} style={[s.dot, { backgroundColor: i < passo ? colors.accent : colors.lineStrong }]} />
          ))}
        </View>
        <Text style={s.contador}>
          {passo} / {TOTAL}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
        {passo === 1 && (
          <>
            <Titulo t="Como vai se chamar?" sub="Um nome que caiba numa mensagem de WhatsApp." />
            <TextInput
              value={nomeAtual}
              onChangeText={setNome}
              onFocus={() => setFoco(true)}
              onBlur={() => setFoco(false)}
              style={[s.input, foco && s.inputFoco]}
              placeholder="Nome do desafio"
              placeholderTextColor={colors.faint}
              maxLength={40}
            />
            <View style={s.wrap}>
              {op.sugestoes.map((sug) => (
                <Pressable key={sug} onPress={() => setNome(sug)} style={[s.sugestao, nomeAtual === sug && s.on]}>
                  <Text style={[s.sugestaoText, nomeAtual === sug && { color: colors.accentDark }]}>{sug}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {passo === 2 && (
          <>
            <Titulo t="O que conta?" sub="Páginas é o padrão da casa: quem lê um calhamaço não perde para quem lê três novelas." />
            <View style={{ gap: 8, marginTop: -4 }}>
              {op.metricas.map((x) => {
                const on = x.id === metrica;
                return (
                  <Pressable
                    key={x.id}
                    onPress={() => setMetrica(x.id)}
                    style={[s.metrica, { backgroundColor: on ? colors.accentSoft : colors.card, borderColor: on ? colors.accentLine : colors.line }]}
                  >
                    {ICONE[x.id](on ? colors.accentDark : colors.inkSoft)}
                    <View style={{ flex: 1 }}>
                      <Text style={[j.rowTitle, { color: on ? colors.accentDark : colors.ink }]}>{x.nome}</Text>
                      <Text style={j.rowSub}>{x.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {passo === 3 && (
          <>
            <Titulo t="Por quanto tempo?" sub={`Começa amanhã, ${op.inicio}. Quem entrar depois começa do zero.`} />
            <View style={[s.wrap, { gap: 8 }]}>
              {op.periodos.map((x) => {
                const on = x.id === periodo;
                return (
                  <Pressable
                    key={x.id}
                    onPress={() => setPeriodo(x.id)}
                    style={[s.periodo, { backgroundColor: on ? colors.accentSoft : colors.cream, borderColor: on ? colors.accentLine : 'transparent' }]}
                  >
                    <Text style={[s.periodoText, { color: on ? colors.accentDark : colors.ink }]}>{x.nome}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ gap: 6 }}>
              <Text style={j.eyebrow}>Meta do grupo (opcional)</Text>
              <View style={s.meta}>
                <TextInput
                  value={metaAtual ? fmt(metaAtual) : ''}
                  onChangeText={(t) => setMeta(Number(t.replace(/\D/g, '')) || 0)}
                  keyboardType="number-pad"
                  style={s.metaInput}
                  maxLength={7}
                />
                <Text style={s.metaSub}>
                  {m.unidade} por pessoa{metaAtual ? ` · ~${fmt(Math.max(1, Math.round(metaAtual / p.dias)))} por dia` : ''}
                </Text>
              </View>
            </View>
          </>
        )}

        {passo === 4 && (
          <>
            <Titulo t="Quem vem junto?" sub="Mande o link. Dá para convidar depois também." />
            <View style={[j.card, { padding: 16, gap: 10 }]}>
              <Text style={s.resumoNome}>{nomeAtual}</Text>
              <Text style={s.resumoSub}>
                {m.unidade} · {periodo === 'custom' ? 'datas a escolher' : p.nome}
                {metaAtual ? ` · meta ${fmt(metaAtual)}` : ''} · começa em {op.inicioCurto}
              </Text>
              <View style={s.link}>
                <Text style={j.linkText} numberOfLines={1}>
                  {link}
                </Text>
                <Pressable onPress={copiar} style={j.copiar} hitSlop={4}>
                  <Text style={j.copiarText}>Copiar</Text>
                </Pressable>
              </View>
            </View>
            <Pressable onPress={whatsapp} style={({ pressed }) => [j.outline, pressed && { opacity: 0.9 }]}>
              <MessageCircle size={18} color={colors.inkSoft} />
              <Text style={j.outlineText}>Mandar no WhatsApp</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={{ paddingTop: 12, paddingHorizontal: 20 }}>
        <Pressable onPress={passo === TOTAL ? criar : next} style={({ pressed }) => [j.primary, pressed && { opacity: 0.9 }]}>
          <Text style={j.primaryText}>
            {passo === TOTAL ? 'Criar desafio' : passo === 2 ? `Continuar · ${m.unidade}` : 'Continuar'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Titulo({ t, sub }: { t: string; sub: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.h1}>{t}</Text>
      <Text style={s.lead}>{sub}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  top: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 12 },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 28, height: 4, borderRadius: 2 },
  contador: { width: 44, textAlign: 'right', fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16, color: colors.muted },
  h1: { fontFamily: fonts.serif, fontSize: 23, lineHeight: 29, color: colors.ink },
  lead: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    fontFamily: fonts.sans,
    fontSize: 17,
    color: colors.ink,
  },
  inputFoco: { borderColor: colors.accent, shadowColor: colors.accent, shadowOpacity: 0.14, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sugestao: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.cream, borderWidth: 1, borderColor: 'transparent' },
  sugestaoText: { fontFamily: fonts.sansSemi, fontSize: 13, lineHeight: 16, color: colors.inkSoft },
  on: { backgroundColor: colors.accentSoft, borderColor: colors.accentLine },
  metrica: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 64, paddingHorizontal: 16, borderWidth: 1.5, borderRadius: 12 },
  periodo: { height: 44, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, justifyContent: 'center' },
  periodoText: { fontFamily: fonts.sansSemi, fontSize: 15 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  metaInput: { minWidth: 56, fontFamily: fonts.monoBold, fontSize: 20, color: colors.ink, padding: 0 },
  metaSub: { flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.muted },
  resumoNome: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 22, color: colors.ink },
  resumoSub: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  link: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingLeft: 12, paddingRight: 4, borderRadius: 10, backgroundColor: colors.cream },
});
