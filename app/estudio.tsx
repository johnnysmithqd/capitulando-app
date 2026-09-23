import { router, useLocalSearchParams } from 'expo-router';
import {
  AlignLeft,
  ChevronDown,
  Image as ImageIcon,
  LayoutTemplate,
  Palette,
  PencilLine,
  Share2,
  SlidersHorizontal,
  Type,
  X,
} from 'lucide-react-native';
import { useEffect, useState, type ComponentType } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CardEstudio,
  FORMATOS,
  NOME_TEMPLATE,
  PALETAS,
  TAMANHO_FORMATO,
  TEMPLATES_POR_CONTEUDO,
  corDaPaleta,
  type AlinharCard,
  type FonteCard,
  type FormatoCard,
  type FundoCard,
  type PaletaCard,
  type TemplateCard,
} from '../src/components/CardEstudio';
import * as api from '../src/data/api';
import type { CardEstudioDados, ConteudoCard } from '../src/data/juntos/estudio';
import { useApi, useStore } from '../src/data/store';
import { colors, fonts, radius } from '../src/theme';

type Ctrl = 'texto' | 'template' | 'paleta' | 'fonte' | 'fundo' | 'alinhar' | 'elementos';
type Elemento = 'nota' | 'barra' | 'usuario';
type Icone = ComponentType<{ size?: number; color?: string }>;

const CTRL: Record<Ctrl, { label: string; Icon: Icone }> = {
  texto: { label: 'Texto', Icon: PencilLine },
  template: { label: 'Template', Icon: LayoutTemplate },
  paleta: { label: 'Paleta', Icon: Palette },
  fonte: { label: 'Fonte', Icon: Type },
  fundo: { label: 'Fundo', Icon: ImageIcon },
  alinhar: { label: 'Alinhar', Icon: AlignLeft },
  elementos: { label: 'Elementos', Icon: SlidersHorizontal },
};
const CTRL_POR_CONTEUDO = (c: ConteudoCard): Ctrl[] =>
  c === 'progresso'
    ? ['template', 'paleta', 'fonte', 'fundo', 'alinhar', 'elementos']
    : c === 'citacao'
      ? ['texto', 'template', 'paleta', 'fonte', 'fundo', 'alinhar']
      : ['paleta', 'fonte', 'fundo', 'alinhar', 'elementos'];

const FONTES: [FonteCard, string][] = [
  ['literata', 'Literata + Nunito'],
  ['courier', 'Máquina de escrever'],
  ['nunito', 'Só Nunito'],
];
const FUNDOS: [FundoCard, string][] = [
  ['cor', 'Cor'],
  ['gradiente', 'Gradiente'],
  ['capa', 'Capa desfocada'],
  ['foto', 'Foto'],
];
const ALINHAR: [AlinharCard, string][] = [
  ['esq', 'Esquerda'],
  ['centro', 'Centro'],
];
const ELEMENTOS: [Elemento, string][] = [
  ['nota', 'Nota'],
  ['barra', 'Barra de progresso'],
  ['usuario', '@usuário'],
];
const NOME_CONTEUDO: Record<ConteudoCard, string> = {
  progresso: 'Progresso',
  citacao: 'Citação',
  terminado: 'Livro terminado',
  retrospectiva: 'Retrospectiva',
  estante: 'Estante do ano',
};
const ehConteudo = (v?: string): v is ConteudoCard => !!v && Object.prototype.hasOwnProperty.call(NOME_CONTEUDO, v);

/** Texto que acompanha o card no compartilhamento do sistema. */
function mensagem(d: CardEstudioDados, c: ConteudoCard, citacao: string) {
  const L = d.livro;
  const pct = L.total ? Math.round((L.pagina / L.total) * 100) : 0;
  const corpo =
    c === 'citacao'
      ? `“${citacao}” — ${L.titulo}, ${L.autor}, p. ${L.pagina}.`
      : c === 'terminado'
        ? `Terminei ${L.titulo}, de ${L.autor}.`
        : c === 'retrospectiva'
          ? `${d.retrospectiva.titulo}: ${d.retrospectiva.numeros.map((n) => `${n.v} ${n.n}`).join(', ')}.`
          : c === 'estante'
            ? `${d.estante.total} livros em ${d.estante.ano}. ${d.estante.resumo}.`
            : `p. ${L.pagina} de ${L.titulo} (${pct}%).`;
  return `${corpo} #Capitulando\n${d.link}`;
}

export default function Estudio() {
  const insets = useSafeAreaInsets();
  const { width: telaW } = useWindowDimensions();
  const params = useLocalSearchParams<{ tipo?: string; id?: string; conteudo?: string }>();
  const store = useStore();
  const base = useApi(() => api.getCardEstudio(params.tipo, params.id), [params.tipo, params.id]);

  const [conteudoSel, setConteudoSel] = useState<ConteudoCard | null>(ehConteudo(params.conteudo) ? params.conteudo : null);
  const [template, setTemplate] = useState<TemplateCard>('editorial');
  const [ctrl, setCtrl] = useState<Ctrl>('template');
  const [formato, setFormato] = useState<FormatoCard>('9:16');
  const [paleta, setPaleta] = useState<PaletaCard>('capa');
  const [fonte, setFonte] = useState<FonteCard>('literata');
  const [fundo, setFundo] = useState<FundoCard>('cor');
  const [alinhar, setAlinhar] = useState<AlinharCard>('esq');
  const [el, setEl] = useState<Record<Elemento, boolean>>({ nota: false, barra: true, usuario: true });
  const [citacao, setCitacao] = useState<string | null>(null);
  const [areaH, setAreaH] = useState(0);

  // A folha "O que virar card" volta para cá com ?conteudo=...
  useEffect(() => {
    if (ehConteudo(params.conteudo)) setConteudoSel(params.conteudo);
  }, [params.conteudo]);

  // Página ao vivo da estante (o registro de progresso atualiza o card).
  const dados: CardEstudioDados | null = base
    ? (() => {
        const pag = store.reading(base.livro.id)?.page;
        return pag == null ? base : { ...base, livro: { ...base.livro, pagina: Math.min(pag, base.livro.total) } };
      })()
    : null;

  const conteudo: ConteudoCard = conteudoSel ?? base?.conteudo ?? 'progresso';
  const tplSet = TEMPLATES_POR_CONTEUDO[conteudo];
  const tplAtual = tplSet.includes(template) ? template : tplSet[0];
  const ctrls = CTRL_POR_CONTEUDO(conteudo);
  const ctrlAtual = ctrls.includes(ctrl) ? ctrl : ctrls[0];
  const texto = citacao ?? dados?.citacao ?? '';

  const [pvW, pvH] = TAMANHO_FORMATO[formato];
  // Encolhe o card quando a área de preview é menor que o tamanho do protótipo.
  const escala = Math.max(0.4, Math.min(1, (telaW - 40) / pvW, areaH > 0 ? (areaH - 70) / pvH : 1));

  const conteudoLabel = conteudo === 'progresso' ? `Progresso · p. ${dados?.livro.pagina ?? ''}` : NOME_CONTEUDO[conteudo];

  const abrirConteudo = () =>
    router.push({
      pathname: '/conteudo',
      params: { atual: conteudo, ...(params.tipo ? { tipo: params.tipo } : null), ...(params.id ? { id: params.id } : null) },
    });

  const abrirExportar = () => {
    if (!dados) return;
    router.push({
      pathname: '/exportar',
      params: { formato, conteudo, template: tplAtual, texto: mensagem(dados, conteudo, texto) },
    });
  };

  return (
    <View style={[s.tela, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Fechar" style={s.fechar}>
          <X size={24} color={colors.ink} style={{ opacity: 0.8 }} />
        </Pressable>
        <Text style={s.titulo}>Estúdio</Text>
        <Pressable onPress={abrirConteudo} hitSlop={4} style={s.conteudoBtn}>
          <Text numberOfLines={1} style={s.conteudoTxt}>
            {conteudoLabel}
          </Text>
          <ChevronDown size={16} color={colors.ink} style={{ opacity: 0.6 }} />
        </Pressable>
      </View>

      {/* preview */}
      <View style={s.preview} onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}>
        <View style={[s.cardSombra, { width: pvW * escala, height: pvH * escala }]}>
          {dados ? (
            <View
              style={{
                position: 'absolute',
                width: pvW,
                height: pvH,
                left: (pvW * escala - pvW) / 2,
                top: (pvH * escala - pvH) / 2,
                transform: [{ scale: escala }],
              }}
            >
              <CardEstudio
                dados={dados}
                formato={formato}
                citacao={texto}
                estilo={{ template: tplAtual, paleta, fonte, fundo, alinhar, nota: el.nota, barra: el.barra, usuario: el.usuario }}
              />
            </View>
          ) : null}
        </View>

        <View style={s.fmt}>
          {FORMATOS.map((f) => {
            const on = formato === f;
            return (
              <Pressable key={f} onPress={() => setFormato(f)} style={[s.fmtItem, on && s.fmtItemOn]}>
                <Text style={[s.fmtTxt, { color: on ? colors.ink : colors.muted }]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* controles */}
      <View style={{ paddingTop: 6, gap: 6 }}>
        <View style={s.ctrlRow}>
          {ctrls.map((k) => {
            const on = ctrlAtual === k;
            const { Icon, label } = CTRL[k];
            return (
              <Pressable key={k} onPress={() => setCtrl(k)} style={[s.ctrl, on && { backgroundColor: colors.accentSoft }]}>
                <View style={{ opacity: on ? 0.9 : 0.55 }}>
                  <Icon size={20} color={on ? colors.accentDark : colors.ink} />
                </View>
                <Text style={[s.ctrlTxt, { color: on ? colors.accentDark : colors.muted }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {ctrlAtual === 'texto' ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 2 }}>
            <TextInput
              value={texto}
              onChangeText={setCitacao}
              multiline
              numberOfLines={2}
              style={s.textarea}
              placeholderTextColor={colors.faint}
            />
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 52, flexGrow: 0 }} contentContainerStyle={s.chips}>
          {ctrlAtual === 'template' || ctrlAtual === 'texto'
            ? tplSet.map((id) => <Pilula key={id} label={NOME_TEMPLATE[id]} on={tplAtual === id} onPress={() => setTemplate(id)} />)
            : null}
          {ctrlAtual === 'paleta'
            ? PALETAS.map((p) => {
                const on = paleta === p.id;
                return (
                  <Pressable key={p.id} onPress={() => setPaleta(p.id)} accessibilityLabel="Paleta" style={s.pal}>
                    <View style={[s.palAnel, { borderColor: on ? colors.ink : 'transparent' }]}>
                      <View
                        style={[
                          s.palCor,
                          { backgroundColor: corDaPaleta(p.id, dados?.livro.cor ?? '#4E4573') },
                          !on && { borderWidth: 1, borderColor: 'rgba(62,51,46,.15)' },
                        ]}
                      />
                    </View>
                    <Text style={s.palTxt}>{p.label}</Text>
                  </Pressable>
                );
              })
            : null}
          {ctrlAtual === 'fonte'
            ? FONTES.map(([id, label]) => <Pilula key={id} label={label} on={fonte === id} onPress={() => setFonte(id)} />)
            : null}
          {ctrlAtual === 'fundo'
            ? FUNDOS.map(([id, label]) => <Pilula key={id} label={label} on={fundo === id} onPress={() => setFundo(id)} />)
            : null}
          {ctrlAtual === 'alinhar'
            ? ALINHAR.map(([id, label]) => <Pilula key={id} label={label} on={alinhar === id} onPress={() => setAlinhar(id)} />)
            : null}
          {ctrlAtual === 'elementos'
            ? ELEMENTOS.map(([k, label]) => (
                <Pilula
                  key={k}
                  label={(el[k] ? '✓ ' : '') + label}
                  on={el[k]}
                  apagado={!el[k]}
                  onPress={() => setEl({ ...el, [k]: !el[k] })}
                />
              ))
            : null}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12) + 8 }}>
          <Pressable onPress={abrirExportar} style={({ pressed }) => [s.cta, pressed && { opacity: 0.85 }]}>
            <Share2 size={18} color={colors.paper} />
            <Text style={s.ctaTxt}>Compartilhar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Pilula({ label, on, onPress, apagado }: { label: string; on: boolean; onPress: () => void; apagado?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={[s.pilula, on ? { backgroundColor: colors.accentSoft, borderColor: colors.accentLine } : null]}
    >
      <Text style={[s.pilulaTxt, { color: on ? colors.accentDark : apagado ? colors.muted : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 12 },
  fechar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titulo: { flex: 1, fontFamily: fonts.serif, fontSize: 21, lineHeight: 28, color: colors.ink },
  conteudoBtn: {
    height: 38,
    maxWidth: 190,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conteudoTxt: { flexShrink: 1, fontFamily: fonts.sansSemi, fontSize: 13, lineHeight: 16, color: colors.ink },
  preview: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 4, paddingHorizontal: 20 },
  cardSombra: {
    borderRadius: 12,
    backgroundColor: colors.bg,
    shadowColor: colors.ink,
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  fmt: { flexDirection: 'row', borderRadius: 10, backgroundColor: colors.cream, padding: 3 },
  fmtItem: { height: 38, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  fmtItemOn: {
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  fmtTxt: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 14 },
  ctrlRow: { flexDirection: 'row', paddingHorizontal: 12 },
  ctrl: { flex: 1, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  ctrlTxt: { fontFamily: fonts.sansSemi, fontSize: 10, lineHeight: 12 },
  textarea: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  chips: { alignItems: 'center', gap: 8, paddingHorizontal: 20 },
  pilula: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilulaTxt: { fontFamily: fonts.sansSemi, fontSize: 13, lineHeight: 16 },
  pal: { paddingHorizontal: 2, alignItems: 'center', gap: 1 },
  palAnel: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  palCor: { width: 28, height: 28, borderRadius: 14 },
  palTxt: { fontFamily: fonts.sansSemi, fontSize: 10, lineHeight: 12, color: colors.muted },
  cta: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaTxt: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.paper },
});
