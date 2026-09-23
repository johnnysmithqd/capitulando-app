import { router } from 'expo-router';
import { Check, Image as ImageIcon, Plus, Receipt, Truck } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { precisaDoAparelho } from '../src/components/menu';
import { brl, Campo, Entrada, Opcao, Passo, Passos, passoStyles as ps } from '../src/components/passos';
import { ProgressBar } from '../src/components/ui';
import * as api from '../src/data/api';
import type { ProjectDraft, ProjectSetup } from '../src/data/juntos/criar';
import { useApi } from '../src/data/store';
import { colors, fonts } from '../src/theme';

const TOTAL = 4;
const RESUMO_MAX = 140;
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export default function CriarProjeto() {
  const setup = useApi(api.getProjectSetup);
  if (!setup) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return <Fluxo setup={setup} />;
}

function Fluxo({ setup }: { setup: ProjectSetup }) {
  const [step, setStep] = useState(1);
  const [d, setD] = useState<ProjectDraft>(setup.draft);
  const [busy, setBusy] = useState(false);
  const [nova, setNova] = useState<{ title: string; price: string; physical: boolean } | null>(null);
  const addRecompensa = () => {
    if (!nova) return;
    const price = Number(nova.price.replace(',', '.'));
    if (!nova.title.trim() || !(price > 0)) return;
    set('rewards', [
      ...d.rewards,
      { id: `r${Date.now()}`, title: nova.title.trim(), price, physical: nova.physical, details: nova.physical ? 'Correios · entrega a combinar' : 'digital' },
    ]);
    setNova(null);
  };
  const set = <K extends keyof ProjectDraft>(k: K, v: ProjectDraft[K]) => setD((x) => ({ ...x, [k]: v }));

  const back = () => (step === 1 ? router.back() : setStep(step - 1));
  const next = () => setStep((n) => Math.min(TOTAL, n + 1));
  const publicar = async () => {
    setBusy(true);
    const p = await api.createProject(d);
    router.replace(`/projeto/${p.id}`);
    Alert.alert('Projeto publicado', `${d.deadline} dias começam agora.`);
  };

  // Tudo ou nada: conta da taxa com o número esperado de apoios
  const taxa = Math.round(d.goal * setup.fee.pct + setup.expectedBackers * setup.fee.perBacker);
  const fim = new Date(`${setup.startDate}T12:00:00`);
  fim.setDate(fim.getDate() + d.deadline);

  return (
    <Passos
      step={step}
      total={TOTAL}
      onBack={back}
      cta={step === TOTAL ? 'Publicar projeto' : 'Continuar'}
      onCta={step === TOTAL ? publicar : next}
      busy={busy}
    >
      {step === 1 && (
        <Passo gap={16} title="Conte a história" sub="O que você quer fazer, por que agora, e o que volta para quem apoia. Uns 10 minutos até publicar.">
          <Pressable style={s.capa} accessibilityLabel="Imagem de capa" onPress={() => precisaDoAparelho('Imagem de capa')}>
            <ImageIcon size={26} color={colors.ink} style={{ opacity: 0.5 }} />
            <Text style={s.capaTitle}>Imagem de capa · 16:9</Text>
            <Text style={[ps.note, { color: colors.faint }]}>foto, arte ou o próprio livro</Text>
          </Pressable>
          <Campo label="Título">
            <Entrada value={d.title} onChangeText={(t) => set('title', t)} />
          </Campo>
          <Campo label={`Resumo · até ${RESUMO_MAX} caracteres`}>
            <Entrada value={d.summary} onChangeText={(t) => set('summary', t)} maxLength={RESUMO_MAX} multiline minHeight={64} />
          </Campo>
          <Campo label="A história completa">
            <Entrada
              value={d.story}
              onChangeText={(t) => set('story', t)}
              multiline
              minHeight={96}
              style={{ fontFamily: fonts.serifRegular }}
            />
            <Text style={ps.note}>Dica da casa: diga o que acontece se a meta não bater e quando a recompensa chega.</Text>
          </Campo>
        </Passo>
      )}

      {step === 2 && (
        <Passo title="Meta e prazo" sub="Tudo ou nada: se não bater a meta até o prazo, ninguém paga e você não deve nada.">
          <View style={[ps.card, { padding: 16, gap: 12 }]}>
            <Text style={s.eyebrow}>Meta</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={s.rs}>R$</Text>
              <Text style={s.meta}>{brl(d.goal, false).replace('R$ ', '')}</Text>
            </View>
            <View style={ps.table}>
              <View style={[ps.tableRow, s.rowLine]}>
                <Text style={ps.body}>Se bater com {setup.expectedBackers} apoios</Text>
                <Text style={[ps.mono, { color: colors.ink }]}>{brl(d.goal, false)}</Text>
              </View>
              <View style={[ps.tableRow, s.rowLine]}>
                <Text style={[ps.body, { color: colors.inkSoft }]}>A casa · 5% + R$ 0,50 por apoio</Text>
                <Text style={[ps.mono, { color: colors.inkSoft }]}>− {brl(taxa, false)}</Text>
              </View>
              <View style={[ps.tableRow, { backgroundColor: colors.cream }]}>
                <Text style={[ps.title, { fontSize: 15 }]}>Você recebe</Text>
                <Text style={[ps.mono, { fontSize: 15, color: colors.green }]}>{brl(d.goal - taxa, false)}</Text>
              </View>
            </View>
            <Text style={ps.note}>{setup.costHint}</Text>
          </View>
          <Campo label="Prazo">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {setup.deadlines.map((n) => (
                <Opcao key={n} label={`${n} dias`} on={d.deadline === n} onPress={() => set('deadline', n)} style={s.prazo} />
              ))}
            </View>
            <Text style={ps.note}>
              Termina em {fim.getDate()} de {MESES[fim.getMonth()]}. {setup.deadlineHint}
            </Text>
          </Campo>
        </Passo>
      )}

      {step === 3 && (
        <Passo
          gap={14}
          title="Recompensas"
          sub="Duas ou três bastam. Marque o que precisa de entrega física — a casa calcula frete e pede endereço no checkout."
        >
          {d.rewards.map((r) => (
            <View key={r.id} style={[ps.boxed, { padding: 14, gap: 8 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
                  <Text style={[ps.title, { flexShrink: 1 }]}>{r.title}</Text>
                  {r.physical && <Truck size={14} color={colors.ink} style={{ opacity: 0.6 }} />}
                </View>
                <Text style={s.recPreco}>R$ {r.price}</Text>
              </View>
              <Text style={ps.small}>{r.details}</Text>
            </View>
          ))}
          {nova ? (
            <View style={[ps.boxed, { padding: 14, gap: 10 }]}>
              <Campo label="Nome da recompensa">
                <Entrada value={nova.title} onChangeText={(t) => setNova({ ...nova, title: t })} placeholder="Livro + marcador" autoFocus />
              </Campo>
              <Campo label="Valor (R$)">
                <Entrada value={nova.price} onChangeText={(t) => setNova({ ...nova, price: t.replace(/[^\d,]/g, '') })} placeholder="80" keyboardType="numeric" />
              </Campo>
              <Pressable style={s.toggleRow} onPress={() => setNova({ ...nova, physical: !nova.physical })}>
                <Switch
                  value={nova.physical}
                  onValueChange={(v) => setNova({ ...nova, physical: v })}
                  trackColor={{ true: colors.accent, false: colors.lineStrong }}
                  thumbColor={colors.paper}
                />
                <Text style={s.toggleTitle}>Tem entrega física</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable style={[s.outra, { flex: 1 }]} onPress={() => setNova(null)}>
                  <Text style={s.outraText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[s.outra, { flex: 1, backgroundColor: colors.accentSoft, borderColor: colors.accentLine }]} onPress={addRecompensa}>
                  <Text style={[s.outraText, { color: colors.accentDark }]}>Adicionar</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={s.outra} onPress={() => setNova({ title: '', price: '', physical: false })}>
              <Plus size={18} color={colors.ink} style={{ opacity: 0.6 }} />
              <Text style={s.outraText}>Outra recompensa</Text>
            </Pressable>
          )}
          <Pressable style={s.toggleRow} onPress={() => set('openSupport', !d.openSupport)}>
            <Switch
              value={d.openSupport}
              onValueChange={(v) => set('openSupport', v)}
              trackColor={{ true: colors.accent, false: colors.lineStrong }}
              thumbColor={colors.paper}
            />
            <View style={{ flex: 1 }}>
              <Text style={s.toggleTitle}>Aceitar "só apoiar", qualquer valor</Text>
              <Text style={[ps.small, { color: colors.muted, lineHeight: 16 }]}>mínimo R$ {setup.minSupport}</Text>
            </View>
          </Pressable>
        </Passo>
      )}

      {step === 4 && (
        <Passo gap={16} title="Pronto para publicar" sub={`É assim que o projeto aparece em Descobrir. Os ${d.deadline} dias começam ao publicar.`}>
          <View style={[ps.card, { padding: 14, gap: 10 }]}>
            <View style={{ gap: 2 }}>
              <Text style={ps.title}>{d.title.trim() || 'Seu projeto'}</Text>
              <Text style={ps.small}>{setup.byline}</Text>
            </View>
            <ProgressBar pct={0} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.monoSmall}>R$ 0 de {brl(d.goal, false)}</Text>
              <Text style={s.monoSmall}>0% · {d.deadline} dias</Text>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={s.eyebrow}>Antes de publicar</Text>
            {setup.checks.map((c) => (
              <View key={c.title} style={[ps.aviso, c.done && { backgroundColor: colors.greenSoft }]}>
                {c.done ? (
                  <Check size={18} color={colors.green} style={{ opacity: 0.8 }} />
                ) : (
                  <Receipt size={18} color={colors.ink} style={{ opacity: 0.75 }} />
                )}
                <Text style={[s.avisoText, { flex: 1 }, c.done && { color: colors.green }]}>
                  <Text style={{ fontFamily: fonts.sansBold }}>{c.title}</Text> — {c.text}
                </Text>
              </View>
            ))}
          </View>
          <Text style={ps.note}>Você se compromete a postar uma atualização a cada 30 dias até a entrega. A casa lembra você.</Text>
        </Passo>
      )}
    </Passos>
  );
}

const s = StyleSheet.create({
  eyebrow: { fontFamily: fonts.sansBold, fontSize: 10, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.muted },
  capa: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  capaTitle: { fontFamily: fonts.sansSemi, fontSize: 14, lineHeight: 18, color: colors.inkSoft },
  rs: { fontFamily: fonts.monoBold, fontSize: 20, color: colors.muted },
  meta: { fontFamily: fonts.monoBold, fontSize: 48, lineHeight: 52, letterSpacing: -1.4, color: colors.ink },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.line },
  prazo: { paddingVertical: 14, paddingHorizontal: 16 },
  recPreco: { fontFamily: fonts.monoBold, fontSize: 15, lineHeight: 18, color: colors.ink },
  outra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
  },
  outraText: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 20, color: colors.ink },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  toggleTitle: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 20, color: colors.ink },
  monoSmall: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16, color: colors.muted },
  avisoText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.ink },
});
