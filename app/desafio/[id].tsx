import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, Flame, Heart, Send, Share2, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Abas, fmt, juntosStyles as j, minhasPaginas, useAviso, useCheckinFeito } from '../../src/components/juntos';
import * as api from '../../src/data/api';
import type { Desafio, MensagemDesafio, ParticipanteDesafio } from '../../src/data/juntos/desafios';
import { useApi, useStore } from '../../src/data/store';
import { colors, fonts, radius } from '../../src/theme';

type Aba = 'ranking' | 'mural' | 'chat';

export default function SalaDesafio() {
  const { id = 'setembro', aba: abaParam, criado } = useLocalSearchParams<{ id?: string; aba?: Aba; criado?: string }>();
  const insets = useSafeAreaInsets();
  const store = useStore();
  const d = useApi(() => api.getDesafio(id), [id]);
  const [aba, setAba] = useState<Aba>(abaParam ?? 'ranking');
  const [minhaFrase, setMinhaFrase] = useState<string | null>(null);
  const [aviso, avisar] = useAviso(insets.bottom + 96);

  useEffect(() => {
    if (criado) avisar('Desafio criado. Convide pelo link quando quiser');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criado]);

  useCheckinFeito((c) => {
    if (c.desafioId !== id) return;
    if (c.frase) setMinhaFrase(c.frase);
    setAba('mural');
    avisar(`Check-in no mural · ${c.paginas} páginas para o desafio`);
  });

  if (!d) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const pagina = store.reading(d.base.bookId)?.page ?? d.base.pagina;
  const minhas = minhasPaginas(d, pagina);
  const ranking = d.ranking
    .map((r) => (r.pessoa.eu ? { ...r, paginas: minhas } : r))
    .sort((a, b) => b.paginas - a.paginas);
  const minhaPos = ranking.findIndex((r) => r.pessoa.eu) + 1;
  const lider = ranking.find((r) => !r.pessoa.eu);
  const atras = lider ? Math.max(0, lider.paginas - minhas) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={j.top}>
        <Pressable onPress={() => router.back()} style={j.topBtn} accessibilityLabel="Voltar">
          <ChevronLeft size={26} color={colors.ink} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.titulo} numberOfLines={1}>
            {d.nome}
          </Text>
          <Text style={s.resumo}>{d.resumo}</Text>
        </View>
        <Pressable onPress={() => router.push({ pathname: '/convidar', params: { desafio: d.id } })} style={j.topBtn} accessibilityLabel="Convidar">
          <Users size={22} color={colors.inkSoft} />
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: '/estudio', params: { tipo: 'desafio', id: d.id } })}
          style={j.topBtn}
          accessibilityLabel="Compartilhar ranking"
        >
          <Share2 size={22} color={colors.inkSoft} />
        </Pressable>
      </View>

      {/* Meu progresso */}
      <View style={[j.card, s.eu]}>
        <View style={s.euTop}>
          <Text style={s.euPos}>Você · {minhaPos}º lugar</Text>
          <Text style={s.euNum}>
            <Text style={{ color: colors.ink }}>{fmt(minhas)}</Text> de {fmt(d.meta)}
          </Text>
        </View>
        <View style={[s.track, { height: 8 }]}>
          <View style={[s.fill, { height: 8, width: `${Math.min(100, Math.round((minhas / d.meta) * 100))}%` }]} />
        </View>
        <View style={s.euBottom}>
          <Text style={[j.rowSub, { flex: 1 }]}>
            faltam {fmt(Math.max(0, d.meta - minhas))} ·{' '}
            {lider && atras > 0 ? `${fmt(atras)} atrás da ${lider.pessoa.nome}` : 'você na liderança'}
          </Text>
          <View style={s.streak}>
            <Flame size={14} color={colors.accentDark} />
            <Text style={j.mono}>{d.minhaSequencia} dias</Text>
          </View>
        </View>
      </View>

      <Abas
        style={{ marginTop: 14 }}
        value={aba}
        onChange={setAba}
        items={[
          { key: 'ranking', label: 'Ranking' },
          { key: 'mural', label: 'Mural' },
          { key: 'chat', label: 'Conversa', badge: d.conversaNovas },
        ]}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingTop: 22, paddingHorizontal: 20, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
          {aba === 'ranking' && (
            <View style={{ gap: 4 }}>
              {ranking.map((r, i) => {
                const eu = !!r.pessoa.eu;
                const tone =
                  r.tendencia === 'sobe'
                    ? { bg: colors.greenSoft, fg: colors.green }
                    : r.tendencia === 'desce'
                      ? { bg: '#F9E5E1', fg: '#8C332B' }
                      : { bg: colors.cream, fg: colors.muted };
                return (
                  <Pressable
                    key={r.pessoa.id}
                    onPress={() => (r.pessoa.pessoaId ? router.push(`/pessoa/${r.pessoa.pessoaId}`) : router.navigate('/perfil'))}
                    style={[s.rank, eu && { backgroundColor: colors.accentSoft }]}
                  >
                    <Text style={s.rankPos}>{i + 1}</Text>
                    <Ini p={r.pessoa} size={40} />
                    <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
                      <View style={s.rankTop}>
                        <Text style={s.rankNome}>{eu ? `${r.pessoa.nome} · você` : r.pessoa.nome}</Text>
                        <Text style={s.rankNum}>{fmt(r.paginas)}</Text>
                      </View>
                      <View style={[s.track, { height: 4 }]}>
                        <View
                          style={[
                            s.fill,
                            { height: 4, width: `${Math.min(100, Math.round((r.paginas / d.meta) * 100))}%`, backgroundColor: eu ? colors.accent : colors.lineStrong },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={{ width: 44, alignItems: 'flex-end', gap: 3 }}>
                      <View style={[s.delta, { backgroundColor: tone.bg }]}>
                        <Text style={[s.deltaText, { color: tone.fg }]}>{r.delta}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Flame size={11} color={colors.muted} />
                        <Text style={s.seq}>{r.sequencia}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
              <View style={s.semana}>
                <Text style={j.eyebrow}>Resumo da semana</Text>
                <Text style={s.semanaText}>
                  {d.resumoSemana.antes}
                  <Text style={s.semanaNum}>{d.resumoSemana.destaque}</Text>
                  {d.resumoSemana.depois}
                </Text>
              </View>
            </View>
          )}

          {aba === 'mural' && (
            <View style={{ gap: 12 }}>
              {d.mural.map((m) => {
                const eu = !!m.autor.eu;
                const pags = eu ? Math.max(0, m.paginas + (pagina - d.base.pagina)) : m.paginas;
                const texto = eu ? `p. ${pagina} de ${m.livro} — ${minhaFrase ?? m.texto}` : m.texto;
                return (
                  <View key={m.id} style={[j.card, { padding: 14, gap: 10 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ini p={m.autor} size={36} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={j.rowTitle}>{eu ? `${m.autor.nome} · você` : m.autor.nome}</Text>
                        <Text style={j.rowSub}>check-in · {eu && minhaFrase ? 'agora' : m.quando}</Text>
                      </View>
                      <View style={s.pags}>
                        <Text style={s.pagsText}>+{pags} págs</Text>
                      </View>
                    </View>
                    {m.foto ? (
                      <View style={s.foto}>
                        <Listras />
                        <Text style={s.fotoTag}>foto da página · OCR opcional</Text>
                      </View>
                    ) : null}
                    <Text style={s.muralText}>{texto}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={s.reacao}>
                        <Heart size={14} color={colors.inkSoft} />
                        <Text style={s.reacaoText}>{m.reacoes}</Text>
                      </View>
                      <View style={{ flex: 1 }} />
                      <Text style={s.livro}>{m.livro}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {aba === 'chat' && <Conversa desafio={d} />}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.cta, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={() => router.push({ pathname: '/checkin', params: { desafio: d.id } })}
          style={({ pressed }) => [j.primary, s.ctaShadow, pressed && { opacity: 0.9 }]}
        >
          <Check size={18} color={colors.paper} />
          <Text style={j.primaryText}>Fazer check-in · registrar páginas</Text>
        </Pressable>
      </View>
      {aviso}
    </View>
  );
}

function Conversa({ desafio }: { desafio: Desafio }) {
  const [msgs, setMsgs] = useState<MensagemDesafio[]>(desafio.chat);
  const [texto, setTexto] = useState('');
  const eu = desafio.ranking.find((r) => r.pessoa.eu)?.pessoa;

  const enviar = () => {
    const t = texto.trim();
    if (!t || !eu) return;
    const agora = new Date();
    const hora = `${agora.getHours()}h${String(agora.getMinutes()).padStart(2, '0')}`;
    setMsgs((m) => [...m, { id: `n${Date.now()}`, autor: eu, texto: t, hora }]);
    setTexto('');
    api.sendChallengeMessage(desafio.id, t);
  };

  return (
    <View style={{ gap: 10 }}>
      {msgs.map((c) => {
        const mine = !!c.autor.eu;
        return (
          <View key={c.id} style={{ flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
            <Ini p={c.autor} size={28} />
            <View style={[s.bolha, { backgroundColor: mine ? colors.dark : colors.card }]}>
              <Text style={[s.bolhaText, { color: mine ? colors.creamSoft : colors.ink }]}>{c.texto}</Text>
              <Text style={[s.hora, { color: mine ? colors.creamSoft : colors.ink }]}>{c.hora}</Text>
            </View>
          </View>
        );
      })}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escreva para o grupo"
          placeholderTextColor={colors.faint}
          style={s.input}
          onSubmitEditing={enviar}
          returnKeyType="send"
        />
        <Pressable onPress={enviar} style={s.enviar} accessibilityLabel="Enviar">
          <Send size={18} color={colors.accentDark} />
        </Pressable>
      </View>
    </View>
  );
}

function Ini({ p, size }: { p: ParticipanteDesafio; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: p.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.sansBold, fontSize: Math.round(size * 0.36), color: p.fg }}>{p.ini}</Text>
    </View>
  );
}

/** Espaço reservado para a foto da página (listras diagonais do protótipo). */
function Listras() {
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <View style={s.listras}>
        {Array.from({ length: 40 }).map((_, i) => (
          <View key={i} style={{ width: 11, height: '100%', backgroundColor: i % 2 ? colors.cream : colors.line }} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  titulo: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 22, color: colors.ink },
  resumo: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted },
  eu: { marginHorizontal: 20, padding: 14, gap: 8 },
  euTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  euPos: { fontFamily: fonts.sansSemi, fontSize: 14, lineHeight: 20, color: colors.ink },
  euNum: { fontFamily: fonts.monoBold, fontSize: 13, lineHeight: 16, color: colors.muted },
  euBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  track: { borderRadius: radius.pill, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { borderRadius: radius.pill, backgroundColor: colors.accent },
  rank: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12 },
  rankPos: { width: 18, textAlign: 'center', fontFamily: fonts.monoBold, fontSize: 15, lineHeight: 16, color: colors.ink },
  rankTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  rankNome: { flexShrink: 1, fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 18, color: colors.ink },
  rankNum: { fontFamily: fonts.monoBold, fontSize: 14, lineHeight: 16, color: colors.ink },
  delta: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  deltaText: { fontFamily: fonts.monoBold, fontSize: 11, lineHeight: 14 },
  seq: { fontFamily: fonts.monoBold, fontSize: 11, lineHeight: 14, color: colors.muted },
  semana: { marginTop: 10, padding: 14, borderRadius: 12, backgroundColor: colors.cream, gap: 6 },
  semanaText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.ink },
  semanaNum: { fontFamily: fonts.monoBold, fontSize: 13 },
  pags: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.greenSoft },
  pagsText: { fontFamily: fonts.monoBold, fontSize: 13, lineHeight: 16, color: colors.green },
  foto: { height: 150, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.cream },
  listras: { position: 'absolute', top: -120, left: -60, right: -60, bottom: -120, flexDirection: 'row', transform: [{ rotate: '45deg' }] },
  fotoTag: {
    position: 'absolute',
    left: 14,
    bottom: 12,
    fontFamily: fonts.monoBold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.muted,
    backgroundColor: 'rgba(252,250,245,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  muralText: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.ink },
  reacao: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.cream },
  reacaoText: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 14, color: colors.inkSoft },
  livro: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted },
  bolha: { maxWidth: '78%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, gap: 3 },
  bolhaText: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21 },
  hora: { alignSelf: 'flex-end', fontFamily: fonts.monoBold, fontSize: 10, lineHeight: 12, opacity: 0.6 },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
  },
  enviar: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, paddingHorizontal: 20, backgroundColor: 'rgba(250,246,239,0.94)' },
  ctaShadow: { shadowColor: colors.ink, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
});
