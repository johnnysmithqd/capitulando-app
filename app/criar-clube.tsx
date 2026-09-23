import { router } from 'expo-router';
import { Check, Minus, Pencil, Plus, Send, Users, Video, Wallet } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '../src/components/BookCover';
import { brl, Campo, Entrada, Opcao, Passo, Passos, passoStyles as ps } from '../src/components/passos';
import * as api from '../src/data/api';
import type { ClubDraft, ClubPace, ClubScheduleRow, ClubSetup } from '../src/data/juntos/criar';
import { useApi } from '../src/data/store';
import { colors, fonts, radius } from '../src/theme';

const TOTAL = 4;
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export default function CriarClube() {
  const setup = useApi(api.getClubSetup);
  if (!setup) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return <Fluxo setup={setup} />;
}

function Fluxo({ setup }: { setup: ClubSetup }) {
  const [step, setStep] = useState(1);
  const [d, setD] = useState<ClubDraft>(setup.draft);
  const [maisGeneros, setMaisGeneros] = useState(false);
  const [sched, setSched] = useState<{ rows: ClubScheduleRow[]; weeks: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ClubDraft>(k: K, v: ClubDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const toggle = (k: 'where' | 'genres', v: string) => set(k, d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v]);

  // Cronograma sugerido acompanha livro e ritmo
  useEffect(() => {
    let alive = true;
    api.getClubSchedule(d.bookId, d.pace).then((r) => alive && setSched(r));
    return () => {
      alive = false;
    };
  }, [d.bookId, d.pace]);

  const opt = setup.bookOptions.find((o) => o.book.id === d.bookId) ?? setup.bookOptions[0];
  const casa = Math.round(d.price * setup.houseFee * 100) / 100;

  const back = () => (step === 1 ? router.back() : setStep(step - 1));
  const next = () => setStep((n) => Math.min(TOTAL, n + 1));
  const publicar = async () => {
    setBusy(true);
    const club = await api.createClub(d);
    router.replace(`/clube/${club.id}`);
    Alert.alert('Clube publicado', 'Pagamentos podem ser ligados depois.');
  };

  // "trocar": passa para o próximo livro sugerido
  const trocarLivro = () => {
    const i = setup.bookOptions.findIndex((o) => o.book.id === d.bookId);
    set('bookId', setup.bookOptions[(i + 1) % setup.bookOptions.length].book.id);
  };
  const mudarSessao = () => {
    const i = setup.sessionOptions.indexOf(d.session);
    set('session', setup.sessionOptions[(i + 1) % setup.sessionOptions.length]);
  };

  const paces: [ClubPace, string][] = [
    ['um', `1 ${opt.unit.one} / sem`],
    ['tres', `3 ${opt.unit.many} / sem`],
    ['livre', 'livre'],
  ];
  const generos = maisGeneros ? setup.genreOptions : setup.genreOptions.filter((g) => d.genres.includes(g));
  const inicio = new Date(`${setup.startDate}T12:00:00`);
  const onde = [
    d.where.some((w) => w.startsWith('Presencial')) ? 'presencial' : null,
    d.where.includes('On-line') ? 'on-line' : null,
  ]
    .filter(Boolean)
    .join(' + ');

  return (
    <Passos
      step={step}
      total={TOTAL}
      onBack={back}
      cta={step === TOTAL ? 'Publicar clube' : 'Continuar'}
      onCta={step === TOTAL ? publicar : next}
      busy={busy}
    >
      {step === 1 && (
        <Passo title="Abrir um clube" sub="Nome, assunto e onde vocês se encontram. Uns 15 minutos até publicar; pagamentos você liga depois.">
          <Campo label="Nome">
            <Entrada value={d.name} onChangeText={(t) => set('name', t)} />
          </Campo>
          <Campo label="Sobre o que">
            <Entrada value={d.about} onChangeText={(t) => set('about', t)} multiline />
          </Campo>
          <Campo label="Onde">
            <View style={s.wrap}>
              {setup.whereOptions.map((w) => {
                const on = d.where.includes(w);
                return <Opcao key={w} label={on ? `✓ ${w}` : w} on={on} onPress={() => toggle('where', w)} />;
              })}
            </View>
          </Campo>
          <Campo label="Gêneros">
            <View style={s.wrap}>
              {generos.map((g) => {
                const on = d.genres.includes(g);
                return <Opcao key={g} label={on ? `✓ ${g}` : g} on={on} onPress={() => toggle('genres', g)} />;
              })}
              {!maisGeneros && <Opcao label="+ gênero" on={false} onPress={() => setMaisGeneros(true)} />}
            </View>
          </Campo>
        </Passo>
      )}

      {step === 2 && (
        <Passo
          gap={16}
          title="Primeiro livro e ritmo"
          sub="Escolha o livro e quantos capítulos por semana. A casa monta o cronograma; você ajusta o que quiser."
        >
          <View style={[ps.boxed, s.livro]}>
            <BookCover book={opt.book} width={40} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={ps.title}>{opt.book.title}</Text>
              <Text style={ps.small}>
                {opt.book.author} · {opt.parts} {opt.unit.many} · {opt.book.pages} p.
              </Text>
            </View>
            <Pressable onPress={trocarLivro} hitSlop={6} style={s.trocar}>
              <Text style={s.trocarText}>trocar</Text>
            </Pressable>
          </View>
          <Campo label="Ritmo">
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {paces.map(([k, l]) => (
                <Opcao key={k} block label={l} on={d.pace === k} onPress={() => set('pace', k)} />
              ))}
            </View>
          </Campo>
          <Campo label="Cronograma sugerido" right={sched ? <Text style={s.monoSmall}>{sched.weeks} semanas</Text> : null}>
            <View style={s.cronograma}>
              {sched &&
                sched.rows.map((r, i) => (
                <View key={r.dates} style={[s.cronRow, i < sched.rows.length - 1 && s.rowLine]}>
                  <Text style={[s.monoSmall, { width: 64 }]}>{r.dates}</Text>
                  <Text style={[s.cronLabel, { flex: 1 }]}>{r.label}</Text>
                  <Pencil size={16} color={colors.ink} style={{ opacity: 0.35 }} />
                </View>
              ))}
            </View>
          </Campo>
          <Campo label="Sessão ao vivo">
            <Pressable onPress={mudarSessao} style={[ps.boxed, s.sessao]}>
              <Video size={18} color={colors.ink} style={{ opacity: 0.7 }} />
              <Text style={[ps.body, { flex: 1 }]}>{sessaoTexto(d.session)}</Text>
              <Text style={s.mudar}>mudar</Text>
            </Pressable>
          </Campo>
        </Passo>
      )}

      {step === 3 && (
        <Passo
          title="Plano e preço"
          sub="A porta aberta é sempre grátis: discussão e mural para todo mundo. A Cadeira é o que você cobra pelas sessões ao vivo e pelo seu material."
        >
          <View style={[ps.card, { padding: 16, gap: 14 }]}>
            <Text style={ps.title}>Cadeira · por mês</Text>
            <View style={s.precoRow}>
              <Pressable style={ps.stepBtn} onPress={() => set('price', Math.max(0, d.price - 2))} accessibilityLabel="Menos">
                <Minus size={20} color={colors.ink} />
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={s.rs}>R$</Text>
                <Text style={s.preco}>{d.price}</Text>
              </View>
              <Pressable style={ps.stepBtn} onPress={() => set('price', d.price + 2)} accessibilityLabel="Mais">
                <Plus size={20} color={colors.ink} />
              </Pressable>
            </View>
            {d.price === 0 ? (
              <Text style={[ps.small, { textAlign: 'center' }]}>Clube só de porta aberta. Você pode cobrar depois.</Text>
            ) : (
              <>
                <View style={ps.table}>
                  <View style={[ps.tableRow, s.rowLine]}>
                    <Text style={ps.body}>Você recebe</Text>
                    <Text style={[ps.mono, { color: colors.green }]}>{brl(d.price - casa)}</Text>
                  </View>
                  <View style={[ps.tableRow, { backgroundColor: colors.cream }]}>
                    <Text style={[ps.body, { color: colors.inkSoft }]}>A casa fica com {Math.round(setup.houseFee * 100)}%</Text>
                    <Text style={[ps.mono, { color: colors.inkSoft }]}>{brl(casa)}</Text>
                  </View>
                </View>
                <Text style={[ps.note, { textAlign: 'center' }]}>{setup.priceRange}</Text>
              </>
            )}
          </View>
          <Campo label="O que entra na Cadeira">
            <View>
              {setup.benefits.map((b) => (
                <View key={b} style={[s.beneficio, s.rowLine]}>
                  <Check size={18} color={colors.ink} style={{ opacity: 0.75 }} />
                  <Text style={[ps.body, { flex: 1 }]}>{b}</Text>
                </View>
              ))}
              <View style={s.beneficio}>
                <Plus size={18} color={colors.ink} style={{ opacity: 0.5 }} />
                <Text style={[ps.body, { flex: 1, color: colors.faint }]}>Acrescentar benefício</Text>
              </View>
            </View>
          </Campo>
        </Passo>
      )}

      {step === 4 && (
        <Passo gap={16} title="Pronto para publicar" sub="É assim que o clube aparece em Descobrir e na página do livro.">
          <View style={[ps.card, s.preview]}>
            <View style={s.clubIcon}>
              <Users size={20} color={colors.green} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={ps.title}>{d.name.trim() || 'Seu clube'}</Text>
              <Text style={ps.small}>
                {[setup.city, onde, `começa ${opt.book.title} em ${inicio.getDate()} de ${MESES[inicio.getMonth()]}`].filter(Boolean).join(' · ')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <View style={s.porta}>
                  <Text style={s.portaText}>porta aberta</Text>
                </View>
                {d.price > 0 && <Text style={s.monoSmall}>Cadeira R$ {d.price} / mês</Text>}
              </View>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={s.eyebrow}>Depois de publicar</Text>
            <View style={ps.aviso}>
              <Wallet size={18} color={colors.ink} style={{ opacity: 0.75 }} />
              <Text style={[s.avisoText, { flex: 1 }]}>
                <Text style={{ fontFamily: fonts.sansBold }}>Ligar pagamentos</Text> — Pix ou conta bancária. Até lá, o clube funciona só na porta aberta.
              </Text>
            </View>
            <View style={ps.aviso}>
              <Send size={18} color={colors.ink} style={{ opacity: 0.75 }} />
              <Text style={[s.avisoText, { flex: 1 }]}>
                <Text style={{ fontFamily: fonts.sansBold }}>Convidar</Text> — link para WhatsApp e post automático no seu feed.
              </Text>
            </View>
          </View>
          <Text style={ps.note}>
            Ao publicar você concorda com as regras da casa para quem conduz: sem letra miúda, 14% sobre cada assinatura paga, repasse todo dia 5.
          </Text>
        </Passo>
      )}
    </Passos>
  );
}

/** "toda quinta · 19h30 · 1 h" → horário em mono, como no protótipo. */
function sessaoTexto(sessao: string) {
  const partes = sessao.split(' · ');
  return partes.map((p, i) => (
    <Text key={i}>
      {i > 0 ? ' · ' : ''}
      {i === 1 ? <Text style={{ fontFamily: fonts.monoBold, fontSize: 13 }}>{p}</Text> : p}
    </Text>
  ));
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  eyebrow: { fontFamily: fonts.sansBold, fontSize: 10, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.muted },
  livro: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  trocar: { height: 38, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.cream, justifyContent: 'center' },
  trocarText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  monoSmall: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16, color: colors.muted },
  cronograma: { backgroundColor: colors.card, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line },
  cronRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  cronLabel: { fontFamily: fonts.sansSemi, fontSize: 14, lineHeight: 18, color: colors.ink },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.line },
  sessao: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  mudar: { fontFamily: fonts.sansSemi, fontSize: 13, lineHeight: 16, color: colors.accentDark },
  precoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  rs: { fontFamily: fonts.monoBold, fontSize: 20, color: colors.muted },
  preco: { fontFamily: fonts.monoBold, fontSize: 56, lineHeight: 60, color: colors.ink, letterSpacing: -1.5, minWidth: 80, textAlign: 'center' },
  beneficio: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  clubIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.greenMint, alignItems: 'center', justifyContent: 'center' },
  porta: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: colors.greenSoft },
  portaText: { fontFamily: fonts.sansBold, fontSize: 11, lineHeight: 16, color: colors.green },
  avisoText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.ink },
});
