// Peças compartilhadas pelas telas de Juntos (aba, sala do desafio, check-in, criar desafio, pódio).
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Desafio } from '../data/juntos/desafios';
import { colors, fonts, radius } from '../theme';

/** Abas com a fita do protótipo (linha fina + marcador em forma de fita). */
export function Abas<K extends string>({
  items,
  value,
  onChange,
  style,
}: {
  items: { key: K; label: string; badge?: string | number }[];
  value: K;
  onChange: (k: K) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.abasWrap, style]}>
      <View style={s.base} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.abas}>
        {items.map((it) => {
          const on = it.key === value;
          return (
            <Pressable key={it.key} onPress={() => onChange(it.key)} style={s.aba} hitSlop={{ top: 4, bottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[s.abaText, on && { color: colors.accent }]}>{it.label}</Text>
                {it.badge != null ? (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{it.badge}</Text>
                  </View>
                ) : null}
              </View>
              {on ? (
                <View style={s.linha}>
                  <View style={s.fita}>
                    <View style={s.fitaCorte} />
                  </View>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Aviso curto que aparece e some (o "toast" do protótipo). */
export function useAviso(bottom = 96): [ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState('');
  const op = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (m: string) => {
      setMsg(m);
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }).start();
      }, 2400);
    },
    [op],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const node = msg ? (
    <Animated.View pointerEvents="none" style={[s.aviso, { bottom, opacity: op }]}>
      <Text style={s.avisoText}>{msg}</Text>
    </Animated.View>
  ) : null;
  return [node, show];
}

/** Linha tracejada de ação ("Abrir um clube", "ver pódio"...). */
export function LinhaTracejada({ icon, iconBg, title, sub, onPress, right }: { icon: ReactNode; iconBg: string; title: string; sub: string; onPress?: () => void; right?: ReactNode }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.tracejada, pressed && { opacity: 0.85 }]}>
      <View style={[s.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{sub}</Text>
      </View>
      {right}
    </Pressable>
  );
}

/** Páginas do usuário no desafio, a partir da página atual do livro de referência. */
export function minhasPaginas(d: Pick<Desafio, 'base'>, paginaAtual: number | undefined) {
  return Math.max(0, d.base.paginas + ((paginaAtual ?? d.base.pagina) - d.base.pagina));
}

/** Número no formato brasileiro (1.500). */
export function fmt(n: number) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ---- Aviso entre o check-in (folha) e a sala do desafio
export interface CheckinFeito {
  desafioId: string;
  paginas: number;
  frase?: string;
}
const ouvintes = new Set<(c: CheckinFeito) => void>();
export function avisarCheckin(c: CheckinFeito) {
  ouvintes.forEach((fn) => fn(c));
}
export function useCheckinFeito(fn: (c: CheckinFeito) => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const l = (c: CheckinFeito) => ref.current(c);
    ouvintes.add(l);
    return () => {
      ouvintes.delete(l);
    };
  }, []);
}

export const juntosStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  eyebrow: { fontFamily: fonts.sansBold, fontSize: 10, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.muted },
  rowTitle: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 20, color: colors.ink },
  rowSub: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 16, color: colors.muted },
  mono: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16, color: colors.accentDark },
  primary: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.paper },
  outline: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
  copiar: { height: 38, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.dark, justifyContent: 'center' },
  copiarText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.creamSoft },
  linkText: { flex: 1, fontFamily: fonts.monoBold, fontSize: 13, lineHeight: 16, color: colors.inkSoft },
  top: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  topBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});

const s = StyleSheet.create({
  // a fita pendura 10px abaixo da linha; o espaço é devolvido com a margem negativa
  abasWrap: { zIndex: 3, marginBottom: -10 },
  base: { position: 'absolute', left: 0, right: 0, bottom: 10, height: 1, backgroundColor: colors.line },
  abas: { gap: 12, paddingHorizontal: 16, paddingBottom: 11 },
  aba: { paddingTop: 16, paddingBottom: 12, paddingHorizontal: 4 },
  abaText: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 20, color: colors.muted },
  linha: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 1, backgroundColor: colors.accent, alignItems: 'center' },
  fita: { position: 'absolute', top: 1, width: 12, height: 10, backgroundColor: colors.accent },
  fitaCorte: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.bg,
  },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill, backgroundColor: colors.accentSoft },
  badgeText: { fontFamily: fonts.monoBold, fontSize: 11, lineHeight: 14, color: colors.accentDark },
  aviso: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '88%',
    backgroundColor: colors.dark,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avisoText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.creamSoft, textAlign: 'center' },
  tracejada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    borderRadius: 12,
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 20, color: colors.ink },
  rowSub: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 16, color: colors.muted },
});
