import { router } from 'expo-router';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import type { PessoaClube } from '../data/juntos/clubes';
import { colors, fonts, radius } from '../theme';
import { Eyebrow, IconButton } from './ui';

// Peças comuns das telas de clube e projeto (Fase 3 · Juntos).

/** Capa pequena desenhada (cor + título), como nas listas do protótipo. */
export function CapaMini({ cor, titulo, w = 40, h = 60, fontSize = 7 }: { cor: string; titulo: string; w?: number; h?: number; fontSize?: number }) {
  return (
    <View style={[s.capa, { width: w, height: h, backgroundColor: cor }]}>
      <Text numberOfLines={4} style={{ fontFamily: fonts.serif, fontSize, lineHeight: fontSize * 1.15, color: colors.creamSoft }}>
        {titulo}
      </Text>
    </View>
  );
}

/** Caixa de data (dia grande + mês em mono). */
export function DataBox({ d, m, w = 56, dSize = 24, bg = colors.accentSoft, fg = colors.accentDark }: { d: string; m: string; w?: number; dSize?: number; bg?: string; fg?: string }) {
  return (
    <View style={[s.data, { width: w, backgroundColor: bg }]}>
      <Text style={{ fontFamily: fonts.serif, fontSize: dSize, lineHeight: dSize + 2, color: fg }}>{d}</Text>
      <Text style={{ fontFamily: fonts.monoBold, fontSize: 11, letterSpacing: 1.5, color: fg }}>{m}</Text>
    </View>
  );
}

export function Bolinha({ p, size = 32, fontSize = 12 }: { p: Pick<PessoaClube, 'ini' | 'bg' | 'fg'>; size?: number; fontSize?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: p.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.sansBold, fontSize, color: p.fg }}>{p.ini}</Text>
    </View>
  );
}

/** Rostos sobrepostos + um "+N" opcional. */
export function Rostos({ pessoas, mais }: { pessoas: PessoaClube[]; mais?: string }) {
  const lista = mais ? [...pessoas, { nome: mais, ini: mais, bg: colors.cream, fg: colors.inkSoft }] : pessoas;
  return (
    <View style={{ flexDirection: 'row', paddingLeft: 8 }}>
      {lista.map((p, i) => (
        <View key={p.ini + i} style={[s.rosto, { backgroundColor: p.bg, marginLeft: -8 }]}>
          <Text style={{ fontFamily: fonts.sansBold, fontSize: 12, color: p.fg }}>{p.ini}</Text>
        </View>
      ))}
    </View>
  );
}

/** Números em linha (mono em cima, legenda embaixo). */
export function Numeros({ itens }: { itens: { n: string; d: string }[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
      {itens.map((it) => (
        <View key={it.d}>
          <Text style={s.numN}>{it.n}</Text>
          <Text style={s.numD}>{it.d}</Text>
        </View>
      ))}
    </View>
  );
}

export function Secao({ titulo, direita, children, gap = 10 }: { titulo: string; direita?: ReactNode; children: ReactNode; gap?: number }) {
  return (
    <View style={{ paddingHorizontal: 20, gap }}>
      {direita ? (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Eyebrow>{titulo}</Eyebrow>
          {direita}
        </View>
      ) : (
        <Eyebrow>{titulo}</Eyebrow>
      )}
      {children}
    </View>
  );
}

/** Chips de filtro de escolha única. */
export function Filtros<K extends string>({ itens, value, onChange }: { itens: { id: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {itens.map((it) => {
        const on = it.id === value;
        return (
          <Pressable key={it.id} onPress={() => onChange(it.id)} style={[s.filtro, { backgroundColor: on ? colors.accentSoft : colors.cream }]}>
            <Text style={[s.filtroText, { color: on ? colors.accentDark : colors.ink }]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Abas com a fitinha de marcador embaixo da ativa. */
export function AbasFita<K extends string>({ itens, value, onChange }: { itens: { id: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <View style={s.abasWrap}>
      <View style={s.abasBase} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 10 }}>
        {itens.map((it) => {
          const on = it.id === value;
          return (
            <Pressable key={it.id} onPress={() => onChange(it.id)} style={s.aba} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[s.abaText, { color: on ? colors.accent : colors.muted }]}>{it.label}</Text>
              {on ? (
                <View style={s.abaLinha}>
                  <Svg width={12} height={10} style={{ position: 'absolute', top: 1, left: '50%', marginLeft: -6 }}>
                    <Polygon points="0,0 12,0 12,10 6,6.2 0,10" fill={colors.accent} />
                  </Svg>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Topo flutuante com voltar e compartilhar (páginas públicas de clube e projeto). */
export function TopoFlutuante({ top, onShare }: { top: number; onShare: () => void }) {
  return (
    <View style={[s.topo, { paddingTop: top }]} pointerEvents="box-none">
      <IconButton label="Voltar" onPress={() => router.back()} style={{ width: 44, height: 44 }}>
        <ChevronLeft size={26} color={colors.ink} />
      </IconButton>
      <IconButton label="Compartilhar" onPress={onShare} style={{ width: 44, height: 44 }}>
        <Share2 size={22} color={colors.ink} />
      </IconButton>
    </View>
  );
}

/** Topo com título e subtítulo (sala do clube, capítulo). */
export function TopoTitulo({ top, titulo, sub, direita }: { top: number; titulo: string; sub: string; direita?: ReactNode }) {
  return (
    <View style={[s.topoTitulo, { paddingTop: top }]}>
      <IconButton label="Voltar" onPress={() => router.back()} style={{ width: 44, height: 44 }}>
        <ChevronLeft size={26} color={colors.ink} />
      </IconButton>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={s.topoNome}>
          {titulo}
        </Text>
        <Text style={s.topoSub}>{sub}</Text>
      </View>
      {direita}
    </View>
  );
}

/** Aviso curto que aparece embaixo e some sozinho (o "toast" do protótipo). */
export function useAviso(): [ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null);
  const op = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const mostrar = useCallback(
    (m: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMsg(m);
      Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMsg(null));
      }, 2200);
    },
    [op],
  );

  const node = msg ? (
    <Animated.View pointerEvents="none" style={[s.aviso, { opacity: op }]}>
      <Text style={s.avisoText}>{msg}</Text>
    </Animated.View>
  ) : null;
  return [node, mostrar];
}

/** Rodapé fixo com o botão principal. */
export function RodapeFixo({ bottom, children, style }: { bottom: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.rodape, { paddingBottom: bottom + 16 }, style]}>{children}</View>;
}

const s = StyleSheet.create({
  capa: {
    justifyContent: 'flex-end',
    padding: 4,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(0,0,0,.18)',
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  data: { borderRadius: 12, alignItems: 'center', paddingVertical: 8, gap: 2 },
  rosto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  numN: { fontFamily: fonts.monoBold, fontSize: 15, lineHeight: 18, color: colors.ink },
  numD: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted },
  filtro: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  filtroText: { fontFamily: fonts.sansSemi, fontSize: 12, lineHeight: 16 },
  // a fitinha pendura 10px abaixo da linha, por cima do conteúdo
  abasWrap: { marginTop: 4, marginBottom: -10, zIndex: 3 },
  abasBase: { position: 'absolute', left: 0, right: 0, bottom: 10, height: 1, backgroundColor: colors.line },
  aba: { paddingTop: 16, paddingBottom: 12, paddingHorizontal: 4, minHeight: 44 },
  abaText: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 20 },
  abaLinha: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 1, backgroundColor: colors.accent, overflow: 'visible' },
  topo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 6,
    backgroundColor: 'rgba(250,246,239,.94)',
  },
  topoTitulo: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingBottom: 6, minHeight: 56 },
  topoNome: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 22, color: colors.ink },
  topoSub: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted },
  aviso: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 110,
    alignItems: 'center',
    zIndex: 10,
  },
  avisoText: {
    overflow: 'hidden',
    backgroundColor: colors.dark,
    color: colors.paper,
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    gap: 6,
    backgroundColor: 'rgba(250,246,239,.96)',
  },
});
