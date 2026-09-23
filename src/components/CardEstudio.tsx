import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import type { CardEstudioDados, ConteudoCard } from '../data/juntos/estudio';
import { fonts } from '../theme';

// ---- Opções do Estúdio (iguais ao protótipo)
export type TemplateCard =
  | 'editorial'
  | 'minimal'
  | 'polaroide'
  | 'recibo'
  | 'marcatexto'
  | 'capa'
  | 'tipo'
  | 'escuro'
  | 'citclaro'
  | 'citescuro'
  | 'terminado'
  | 'retro'
  | 'estanteC';
export type PaletaCard = 'capa' | 'terracota' | 'salvia' | 'tinta' | 'manteiga';
export type FonteCard = 'literata' | 'courier' | 'nunito';
export type FundoCard = 'cor' | 'gradiente' | 'capa' | 'foto';
export type AlinharCard = 'esq' | 'centro';
export type FormatoCard = '9:16' | '1:1' | '4:5';

export const FORMATOS: FormatoCard[] = ['9:16', '1:1', '4:5'];
export const TAMANHO_FORMATO: Record<FormatoCard, [number, number]> = { '9:16': [252, 448], '1:1': [300, 300], '4:5': [272, 340] };

const TPL_PROGRESSO: TemplateCard[] = ['editorial', 'minimal', 'polaroide', 'recibo', 'marcatexto', 'capa', 'tipo', 'escuro'];
export const TEMPLATES_POR_CONTEUDO: Record<ConteudoCard, TemplateCard[]> = {
  progresso: TPL_PROGRESSO,
  citacao: ['citclaro', 'citescuro'],
  terminado: ['terminado'],
  retrospectiva: ['retro'],
  estante: ['estanteC'],
};
export const NOME_TEMPLATE: Record<TemplateCard, string> = {
  editorial: 'Editorial',
  minimal: 'Minimalista',
  polaroide: 'Polaroide',
  recibo: 'Recibo',
  marcatexto: 'Marca-texto',
  capa: 'Capa gigante',
  tipo: 'Tipográfico',
  escuro: 'Escuro',
  citclaro: 'Papel',
  citescuro: 'Noite',
  terminado: 'Terminei',
  retro: 'Retrospectiva',
  estanteC: 'Estante',
};

export const PALETAS: { id: PaletaCard; label: string }[] = [
  { id: 'capa', label: 'da capa' },
  { id: 'terracota', label: 'terracota' },
  { id: 'salvia', label: 'sálvia' },
  { id: 'tinta', label: 'tinta' },
  { id: 'manteiga', label: 'manteiga' },
];
const COR_PALETA: Record<Exclude<PaletaCard, 'capa'>, string> = {
  terracota: '#B0552F',
  salvia: '#3D5A41',
  tinta: '#3E332E',
  manteiga: '#6F5410',
};
/** "da capa" usa a cor da capa do livro do card. */
export const corDaPaleta = (p: PaletaCard, corCapa: string) => (p === 'capa' ? corCapa : COR_PALETA[p]);

export interface EstiloCard {
  template: TemplateCard;
  paleta: PaletaCard;
  fonte: FonteCard;
  fundo: FundoCard;
  alinhar: AlinharCard;
  nota: boolean;
  barra: boolean;
  usuario: boolean;
}

// ---- Cores (substituem o color-mix do protótipo)
const PAPEL = '#FAF6EF';
const NOITE = '#201A17';
function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** color-mix(in srgb, a p%, b) */
function mix(a: string, p: number, b: string) {
  const x = rgb(a);
  const y = rgb(b);
  const c = x.map((v, i) => Math.round(v * p + y[i] * (1 - p)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function alpha(hex: string, a: number) {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

const F600: Record<FonteCard, string> = { literata: fonts.serif, courier: fonts.monoBold, nunito: fonts.sansSemi };
const F400: Record<FonteCard, string> = { literata: fonts.serifRegular, courier: fonts.mono, nunito: fonts.sans };

/** Degradê vertical feito com faixas (sem bibliotecas de gradiente). */
function Degrade({ cor, bandas = 28, style }: { cor: (t: number) => string; bandas?: number; style?: ViewStyle }) {
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {Array.from({ length: bandas }, (_, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: cor(i / (bandas - 1)) }} />
      ))}
    </View>
  );
}

function lerp(a: string, b: string, t: number) {
  return mix(b, Math.max(0, Math.min(1, t)), a);
}

/** Listras diagonais do fundo "Foto" (placeholder da foto da pessoa). */
function Listras({ w, h }: { w: number; h: number }) {
  const lado = Math.ceil(Math.hypot(w, h)) + 32;
  const n = Math.ceil(lado / 11.3) + 2;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F3ECDF', overflow: 'hidden' }]} pointerEvents="none">
      <View
        style={{
          position: 'absolute',
          width: lado,
          height: lado,
          left: (w - lado) / 2,
          top: (h - lado) / 2,
          flexDirection: 'row',
          transform: [{ rotate: '45deg' }],
        }}
      >
        {Array.from({ length: n }, (_, i) => (
          <View key={i} style={{ width: 11.3, backgroundColor: i % 2 ? '#F3ECDF' : '#EADFCC' }} />
        ))}
      </View>
    </View>
  );
}

function Fundo({ fundo, pa, capa, w, h }: { fundo: FundoCard; pa: string; capa: string; w: number; h: number }) {
  if (fundo === 'gradiente') return <Degrade cor={(t) => lerp(mix(pa, 0.38, PAPEL), PAPEL, t / 0.72)} />;
  if (fundo === 'capa') return <Degrade cor={(t) => lerp(mix(capa, 0.55, PAPEL), capa, Math.min(1, t * 1.25))} />;
  if (fundo === 'foto') return <Listras w={w} h={h} />;
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: mix(pa, 0.07, PAPEL) }]} />;
}

function CapaMini({
  cor,
  w,
  h,
  titulo,
  fs = 11,
  pad = 7,
  r = 4,
  borda = 2,
  sombra = true,
  style,
}: {
  cor: string;
  w: number;
  h: number;
  titulo?: string;
  fs?: number;
  pad?: number;
  r?: number;
  borda?: number;
  sombra?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          width: w,
          height: h,
          borderRadius: r,
          backgroundColor: cor,
          borderLeftWidth: borda,
          borderLeftColor: 'rgba(0,0,0,.18)',
          justifyContent: 'flex-end',
          padding: pad,
          overflow: 'hidden',
        },
        sombra && s.sombraCapa,
        style,
      ]}
    >
      {titulo ? (
        <Text numberOfLines={5} style={{ fontFamily: fonts.serif, fontSize: fs, lineHeight: fs * 1.15, color: '#FBF5EA' }}>
          {titulo}
        </Text>
      ) : null}
    </View>
  );
}

function Estrelas({ nota, cor, size = 16, spacing = 1 }: { nota: number; cor: string; size?: number; spacing?: number }) {
  const cheias = Math.max(0, Math.min(5, Math.floor(nota)));
  return (
    <Text style={{ fontSize: size, lineHeight: size + 2, color: cor, letterSpacing: spacing }}>
      {'★'.repeat(cheias)}
      <Text style={{ color: alpha(cor, 0.3) }}>{'★'.repeat(5 - cheias)}</Text>
    </Text>
  );
}

function Barra({ pct, cor, trilho, h = 6, r = 999, w }: { pct: number; cor: string; trilho: string; h?: number; r?: number; w?: number | `${number}%` }) {
  return (
    <View style={{ height: h, borderRadius: r, backgroundColor: trilho, overflow: 'hidden', width: w ?? '100%' }}>
      <View style={{ width: `${pct}%`, height: h, backgroundColor: cor }} />
    </View>
  );
}

/** Rodapé com @usuário e a marca. */
function Rodape({
  usuario,
  mostrarUsuario,
  cor,
  centro,
  absoluto,
  lados = 24,
  opacidade = 0.8,
  size = 10,
  style,
  marca,
}: {
  usuario: string;
  mostrarUsuario: boolean;
  cor: string;
  centro?: boolean;
  absoluto?: boolean;
  lados?: number;
  opacidade?: number;
  size?: number;
  style?: ViewStyle;
  marca?: ReactNode;
}) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', opacity: opacidade },
        centro ? { justifyContent: 'center', gap: 10 } : { justifyContent: 'space-between', alignSelf: 'stretch' },
        absoluto && { position: 'absolute', bottom: 18, left: centro ? 0 : lados, right: centro ? 0 : lados },
        style,
      ]}
    >
      {mostrarUsuario ? <Text style={[s.rodape, { fontSize: size, color: cor }]}>@{usuario}</Text> : centro ? null : <View />}
      {marca ?? <Text style={[s.rodape, { fontSize: size, color: cor, fontFamily: fonts.serif }]}>Capitulando</Text>}
    </View>
  );
}

/** Linha tracejada do Recibo (borda dashed de um lado só falha no iOS). */
function Tracejado() {
  return (
    <View style={s.tracejado}>
      {Array.from({ length: 40 }, (_, i) => (
        <View key={i} style={{ width: 5, height: 2, backgroundColor: '#DCCDB4' }} />
      ))}
    </View>
  );
}

// Faixas do código de barras do Recibo (padrão de 13px do protótipo).
const BARRAS: [number, boolean][] = [
  [2, true],
  [2, false],
  [3, true],
  [2, false],
  [1, true],
  [3, false],
];

/** Card do Estúdio: desenha os 13 templates com views do React Native. */
export function CardEstudio({
  dados,
  estilo,
  citacao,
  formato,
}: {
  dados: CardEstudioDados;
  estilo: EstiloCard;
  citacao: string;
  formato: FormatoCard;
}) {
  const [W, H] = TAMANHO_FORMATO[formato];
  const L = dados.livro;
  const pct = L.total ? Math.round((L.pagina / L.total) * 100) : 0;
  const faltam = L.total - L.pagina;
  const pa = corDaPaleta(estilo.paleta, L.cor);
  const fT = F600[estilo.fonte];
  const fT4 = F400[estilo.fonte];
  const capaFundo = estilo.fundo === 'capa';
  const ikc = capaFundo ? '#FBF5EA' : '#3E332E';
  const ik2 = capaFundo ? 'rgba(251,245,234,.75)' : '#55463F';
  const centro = estilo.alinhar === 'centro';
  const al: TextStyle['textAlign'] = centro ? 'center' : 'left';
  const ai: ViewStyle['alignItems'] = centro ? 'center' : 'flex-start';
  const u = dados.usuario;
  const fundo = <Fundo fundo={estilo.fundo} pa={pa} capa={L.cor} w={W} h={H} />;
  const t = estilo.template;

  let corpo: ReactNode = null;

  if (t === 'editorial') {
    corpo = (
      <View style={[s.fill, { padding: 22, gap: 12, alignItems: ai }]}>
        {fundo}
        <Text style={[s.eyebrow, { color: pa, textAlign: al }]}>Lendo agora</Text>
        <CapaMini cor={L.cor} w={84} h={126} titulo={L.titulo} />
        <Text style={{ fontFamily: fT, fontSize: 24, lineHeight: 28, color: ikc, textAlign: al, letterSpacing: -0.24 }}>{L.titulo}</Text>
        <Text style={[s.autor, { color: ik2, textAlign: al }]}>{L.autor}</Text>
        {estilo.nota ? <Estrelas nota={dados.terminado.nota} cor={pa} /> : null}
        <View style={{ flex: 1 }} />
        {estilo.barra ? (
          <View style={{ alignSelf: 'stretch', gap: 6, alignItems: ai }}>
            <Barra pct={pct} cor={pa} trilho="rgba(62,51,46,.12)" />
            <Text style={[s.mono12, { color: ik2 }]}>
              p. {L.pagina} de {L.total} · {pct}%
            </Text>
          </View>
        ) : null}
        <Rodape
          usuario={u}
          mostrarUsuario={estilo.usuario}
          cor={ik2}
          opacidade={1}
          size={11}
          marca={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.8 }}>
              <View style={s.marcaC}>
                <Text style={s.marcaCTxt}>C</Text>
              </View>
              <Text style={{ fontFamily: fonts.serif, fontSize: 11, color: ik2 }}>Capitulando</Text>
            </View>
          }
        />
      </View>
    );
  } else if (t === 'minimal') {
    corpo = (
      <View style={[s.fill, { padding: 24, gap: 14, alignItems: 'center', justifyContent: 'center' }]}>
        {fundo}
        <CapaMini cor={L.cor} w={44} h={66} r={3} pad={0} />
        <Text style={{ fontFamily: fT, fontSize: 56, lineHeight: 60, color: ikc, letterSpacing: -1.7 }}>{pct}%</Text>
        <Text style={[s.autor, { fontSize: 13, lineHeight: 18, color: ik2, maxWidth: 180, textAlign: 'center' }]}>de {L.titulo}</Text>
        {estilo.barra ? <Barra pct={pct} cor={pa} trilho="rgba(62,51,46,.12)" h={3} r={0} w={120} /> : null}
        <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor={ik2} centro absoluto />
      </View>
    );
  } else if (t === 'polaroide') {
    corpo = (
      <View style={[s.fill, { padding: 24, alignItems: 'center', justifyContent: 'center' }]}>
        {fundo}
        <View style={s.polaroide}>
          <View style={{ height: 200, backgroundColor: L.cor, padding: 10, justifyContent: 'flex-end' }}>
            <Text numberOfLines={4} style={{ fontFamily: fonts.serif, fontSize: 15, lineHeight: 17, color: '#FBF5EA' }}>
              {L.titulo}
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.serifItalic, fontSize: 15, lineHeight: 20, color: '#3E332E', textAlign: 'center' }}>
            p. {L.pagina} · continua…
          </Text>
          {estilo.barra ? <Barra pct={pct} cor={pa} trilho="#EADFCC" h={3} r={0} /> : null}
        </View>
        <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor={ik2} centro absoluto />
      </View>
    );
  } else if (t === 'recibo') {
    const linha = (k: string, v: string, key: string) => (
      <View key={key} style={s.reciboLinha}>
        <Text style={[s.recibo, { opacity: 0.6 }]}>{k}</Text>
        <Text style={[s.recibo, { textAlign: 'right', maxWidth: '60%' }]}>{v}</Text>
      </View>
    );
    corpo = (
      <View style={[s.fill, { paddingVertical: 22, paddingHorizontal: 20, gap: 8, alignItems: 'center', backgroundColor: '#FBF5EA' }]}>
        <Text style={[s.recibo, { fontSize: 14, letterSpacing: 2.8 }]}>CAPITULANDO</Text>
        <Text style={[s.recibo, { opacity: 0.6 }]}>RECIBO DE LEITURA</Text>
        <Tracejado />
        {linha('LIVRO', L.titulo.toUpperCase(), 'l')}
        {linha('AUTOR', L.autor.toUpperCase(), 'a')}
        {linha('PÁGINA', `${L.pagina} / ${L.total}`, 'p')}
        {linha('RESTAM', `${faltam} PÁG.`, 'r')}
        {linha('DATA', dados.dataRecibo.toUpperCase(), 'd')}
        <Tracejado />
        <View style={[s.reciboLinha, { alignItems: 'flex-end' }]}>
          <Text style={s.recibo}>TOTAL LIDO</Text>
          <Text style={[s.recibo, { fontSize: 32, lineHeight: 34, color: pa }]}>{pct}%</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ alignSelf: 'stretch', height: 36, flexDirection: 'row', overflow: 'hidden' }}>
          {Array.from({ length: 24 }, (_, i) =>
            BARRAS.map(([w, cheio], j) => <View key={`${i}-${j}`} style={{ width: w, backgroundColor: cheio ? '#3E332E' : 'transparent' }} />),
          )}
        </View>
        <View style={[s.reciboLinha, { opacity: 0.6, alignItems: 'center', gap: 12 }]}>
          <Text numberOfLines={1} style={[s.recibo, { flex: 1 }]}>
            {estilo.usuario ? `@${u}` : ''}
          </Text>
          <Text style={s.recibo}>volte sempre</Text>
        </View>
      </View>
    );
  } else if (t === 'marcatexto') {
    const marca = { backgroundColor: alpha(pa, 0.38), color: ikc };
    corpo = (
      <View style={[s.fill, { paddingVertical: 26, paddingHorizontal: 24, gap: 20, justifyContent: 'center' }]}>
        {fundo}
        <Text style={{ fontFamily: fT4, fontSize: 23, lineHeight: 34, color: ikc, textAlign: al }}>
          Estou na <Text style={marca}> página {L.pagina} </Text> de {L.titulo}. Faltam {faltam} páginas e{' '}
          <Text style={marca}> nenhuma pressa </Text>.
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: centro ? 'center' : 'flex-start' }}>
          <CapaMini cor={L.cor} w={28} h={42} r={2} pad={0} borda={1} sombra={false} />
          <Text style={[s.autor, { fontSize: 12, color: ik2 }]}>{L.autor}</Text>
        </View>
        <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor={ik2} absoluto />
      </View>
    );
  } else if (t === 'capa') {
    const altDisp = H - 16 - 96;
    const cw = Math.min((altDisp * 2) / 3, (W - 40) * 0.66);
    corpo = (
      <View style={[s.fill, { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 96, alignItems: 'center', justifyContent: 'center' }]}>
        <Degrade cor={(x) => lerp(mix(L.cor, 0.6, '#FBF5EA'), L.cor, x * 1.3)} />
        <View style={[s.capaGigante, { width: cw, height: cw * 1.5, backgroundColor: L.cor }]}>
          <Text numberOfLines={6} style={{ fontFamily: fonts.serif, fontSize: 18, lineHeight: 21, color: '#FBF5EA' }}>
            {L.titulo}
          </Text>
        </View>
        <View style={s.capaRodape}>
          <Degrade cor={(x) => `rgba(32,26,23,${(0.75 * x).toFixed(3)})`} bandas={16} />
          <Text style={[s.mono12, { color: '#FBF5EA', opacity: 0.9, lineHeight: 16 }]}>
            p. {L.pagina} de {L.total} · {pct}%
          </Text>
          {estilo.barra ? <Barra pct={pct} cor="#FBF5EA" trilho="rgba(251,245,234,.25)" h={3} r={0} /> : null}
          <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor="#FBF5EA" opacidade={0.85} />
        </View>
      </View>
    );
  } else if (t === 'tipo') {
    corpo = (
      <View style={[s.fill, { padding: 24, gap: 8, justifyContent: 'flex-end', alignItems: ai }]}>
        {fundo}
        <Text style={{ fontFamily: fT, fontSize: 104, lineHeight: 98, color: pa, letterSpacing: -5, textAlign: al }}>
          {pct}
          <Text style={{ fontSize: 48 }}>%</Text>
        </Text>
        <Text style={{ fontFamily: fonts.serif, fontSize: 17, lineHeight: 22, color: ikc, marginTop: 12, textAlign: al }}>{L.titulo}</Text>
        <Text style={[s.mono12, { color: ik2 }]}>
          p. {L.pagina} de {L.total}
        </Text>
        <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor={ik2} style={{ marginTop: 14 }} />
      </View>
    );
  } else if (t === 'escuro') {
    corpo = (
      <View style={[s.fill, { padding: 22, gap: 12, alignItems: ai, backgroundColor: NOITE }]}>
        <CapaMini cor={L.cor} w={96} h={144} titulo={L.titulo} fs={12} pad={8} style={{ marginBottom: 8, borderLeftColor: 'rgba(0,0,0,.3)' }} />
        <Text style={{ fontFamily: fT, fontSize: 22, lineHeight: 26, color: '#F5EDE1', textAlign: al }}>{L.titulo}</Text>
        <Text style={[s.autor, { color: '#B3A192', textAlign: al }]}>{L.autor}</Text>
        {estilo.nota ? <Estrelas nota={dados.terminado.nota} cor="#EBD489" /> : null}
        <View style={{ flex: 1 }} />
        {estilo.barra ? (
          <View style={{ alignSelf: 'stretch', gap: 6, alignItems: ai }}>
            <Barra pct={pct} cor="#DE9B78" trilho="rgba(245,237,225,.14)" />
            <Text style={[s.mono12, { color: '#D8C9B9' }]}>
              p. {L.pagina} de {L.total} · {pct}%
            </Text>
          </View>
        ) : null}
        <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor="#B3A192" opacidade={1} size={11} />
      </View>
    );
  } else if (t === 'citclaro' || t === 'citescuro') {
    const noite = t === 'citescuro';
    corpo = (
      <View
        style={[
          s.fill,
          { paddingTop: 26, paddingHorizontal: 24, paddingBottom: 44, gap: 14, justifyContent: 'center', alignItems: ai },
          noite && { backgroundColor: NOITE },
        ]}
      >
        {noite ? null : fundo}
        <Text style={{ fontFamily: fonts.serif, fontSize: 44, lineHeight: 44, marginBottom: -14, color: noite ? '#DE9B78' : pa }}>“</Text>
        <Text style={{ fontFamily: fT4, fontSize: 19, lineHeight: 28, color: noite ? '#F5EDE1' : ikc, textAlign: al }}>{citacao}</Text>
        <View style={{ gap: 2, alignItems: ai }}>
          <Text style={[s.mono12, { lineHeight: 16, color: noite ? '#D8C9B9' : ik2, textAlign: al }]}>{L.titulo}</Text>
          <Text style={[s.autor, { fontSize: 12, color: noite ? '#B3A192' : ik2, textAlign: al }]}>
            {L.autor} · p. {L.pagina}
          </Text>
        </View>
        <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor={noite ? '#B3A192' : ik2} absoluto opacidade={noite ? 1 : 0.8} />
      </View>
    );
  } else if (t === 'terminado') {
    corpo = (
      <View style={[s.fill, { paddingTop: 22, paddingHorizontal: 20, paddingBottom: 42, gap: 10, alignItems: 'center', justifyContent: 'center' }]}>
        {fundo}
        <Text style={[s.eyebrow, { color: pa }]}>Terminei</Text>
        <CapaMini cor={L.cor} w={82} h={123} titulo={L.titulo} />
        <Text style={{ fontFamily: fT, fontSize: 19, lineHeight: 24, color: ikc, textAlign: 'center' }}>{L.titulo}</Text>
        <Text style={[s.autor, { fontSize: 12, color: ik2 }]}>{L.autor}</Text>
        <Estrelas nota={dados.terminado.nota} cor={pa} size={17} spacing={2} />
        <Text style={[s.mono12, { fontSize: 11, color: ik2 }]}>{dados.terminado.linha}</Text>
        <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor={ik2} absoluto lados={20} />
      </View>
    );
  } else if (t === 'retro') {
    const r = dados.retrospectiva;
    corpo = (
      <View style={[s.fill, { paddingTop: 22, paddingHorizontal: 20, paddingBottom: 42, gap: 14, justifyContent: 'center', alignItems: ai }]}>
        {fundo}
        <View style={{ gap: 2, alignItems: ai }}>
          <Text style={[s.eyebrow, { color: pa }]}>Retrospectiva</Text>
          <Text style={{ fontFamily: fT, fontSize: 24, lineHeight: 28, color: ikc, textAlign: al }}>{r.titulo}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {r.capas.map((c, i) => (
            <CapaMini key={i} cor={c.cor} w={44} h={66} r={3} pad={5} fs={8} titulo={c.titulo} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {r.numeros.map((n) => (
            <View key={n.n} style={{ gap: 1 }}>
              <Text style={{ fontFamily: fonts.monoBold, fontSize: 19, lineHeight: 22, color: pa }}>{n.v}</Text>
              <Text style={[s.autor, { fontSize: 11, lineHeight: 14, color: ik2 }]}>{n.n}</Text>
            </View>
          ))}
        </View>
        {estilo.nota ? <Text style={[s.autor, { fontSize: 12, color: ik2, textAlign: al }]}>{r.destaque}</Text> : null}
        <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor={ik2} absoluto lados={20} />
      </View>
    );
  } else {
    const e = dados.estante;
    const cw = (W - 40 - 5 * 5) / 6;
    corpo = (
      <View style={[s.fill, { paddingTop: 22, paddingHorizontal: 20, paddingBottom: 42, gap: 14, justifyContent: 'center', alignItems: ai }]}>
        {fundo}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontFamily: fT, fontSize: 40, lineHeight: 44, color: pa, letterSpacing: -1.2 }}>{e.total}</Text>
          <Text style={{ fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 20, color: ikc }}>livros em {e.ano}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignSelf: 'stretch' }}>
          {e.cores.map((c, i) => (
            <View key={i} style={[s.lombada, { width: cw, height: cw * 1.5, backgroundColor: c }]} />
          ))}
        </View>
        {estilo.barra ? <Text style={[s.mono12, { fontSize: 11, color: ik2, textAlign: al }]}>{e.resumo}</Text> : null}
        <Rodape usuario={u} mostrarUsuario={estilo.usuario} cor={ik2} absoluto lados={20} />
      </View>
    );
  }

  return <View style={[s.card, { width: W, height: H }]}>{corpo}</View>;
}

const s = StyleSheet.create({
  card: { borderRadius: 12, overflow: 'hidden', backgroundColor: PAPEL },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sombraCapa: { shadowColor: '#3E332E', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  eyebrow: { fontFamily: fonts.sansBold, fontSize: 10, lineHeight: 12, letterSpacing: 1.6, textTransform: 'uppercase' },
  autor: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 16 },
  mono12: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 14 },
  rodape: { fontFamily: fonts.sansSemi, fontSize: 10, lineHeight: 12 },
  marcaC: { width: 12, height: 12, borderRadius: 3, backgroundColor: '#B0552F', alignItems: 'center', justifyContent: 'center' },
  marcaCTxt: { fontFamily: fonts.serif, fontSize: 8, lineHeight: 10, color: '#FFFDF9' },
  polaroide: {
    width: 196,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFDF9',
    gap: 12,
    transform: [{ rotate: '-2.5deg' }],
    shadowColor: '#3E332E',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  recibo: { fontFamily: fonts.monoBold, fontSize: 11, lineHeight: 16, color: '#3E332E', letterSpacing: 0.44 },
  reciboLinha: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  tracejado: { alignSelf: 'stretch', height: 2, flexDirection: 'row', gap: 3, overflow: 'hidden', marginVertical: 6 },
  capaGigante: {
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0,0,0,.25)',
    padding: 14,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 24 },
    elevation: 10,
  },
  capaRodape: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 28, paddingHorizontal: 20, paddingBottom: 18, gap: 6 },
  lombada: {
    borderRadius: 2,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(0,0,0,.2)',
    shadowColor: '#3E332E',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
