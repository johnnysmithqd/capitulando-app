import { ChevronLeft } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius } from '../theme';
import { Button, Eyebrow } from './ui';

/** Moldura dos fluxos em passos de Juntos (criar clube, criar projeto): voltar, pontinhos e "n / total". */
export function Passos({
  step,
  total,
  onBack,
  cta,
  onCta,
  busy,
  children,
}: {
  step: number;
  total: number;
  onBack: () => void;
  cta: string;
  onCta: () => void;
  busy?: boolean;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}
    >
      <View style={s.top}>
        <Pressable onPress={onBack} accessibilityLabel="Voltar" style={s.back}>
          <ChevronLeft size={26} color={colors.ink} />
        </Pressable>
        <View style={s.dots}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={[s.dot, { backgroundColor: i < step ? colors.accent : colors.lineStrong }]} />
          ))}
        </View>
        <Text style={s.count}>
          {step} / {total}
        </Text>
      </View>
      {children}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 12) + 8 }}>
        <Button label={cta} onPress={busy ? undefined : onCta} style={busy ? { opacity: 0.7 } : null} />
      </View>
    </KeyboardAvoidingView>
  );
}

/** Conteúdo rolável de um passo, com título e subtítulo. */
export function Passo({ title, sub, gap = 18, children }: { title: string; sub: string; gap?: number; children: ReactNode }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20, gap }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: 6 }}>
        <Text style={s.h}>{title}</Text>
        <Text style={s.sub}>{sub}</Text>
      </View>
      {children}
    </ScrollView>
  );
}

/** Rótulo + conteúdo, como os campos do protótipo. */
export function Campo({ label, right, children, style }: { label: string; right?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      {right ? (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Eyebrow>{label}</Eyebrow>
          {right}
        </View>
      ) : (
        <Eyebrow>{label}</Eyebrow>
      )}
      {children}
    </View>
  );
}

/** Campo de texto com o anel de foco do protótipo. */
export function Entrada({ multiline, minHeight, style, ...p }: TextInputProps & { minHeight?: number; style?: StyleProp<TextStyle> }) {
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      {...p}
      multiline={multiline}
      onFocus={(e) => {
        setFocus(true);
        p.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        p.onBlur?.(e);
      }}
      placeholderTextColor={colors.faint}
      selectionColor={colors.accent}
      style={[
        s.input,
        multiline ? { minHeight: minHeight ?? 72, paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top', lineHeight: 22, fontSize: 15 } : { height: 48 },
        focus && s.inputFocus,
        style,
      ]}
    />
  );
}

/** Opção selecionável (pílula ou bloco). */
export function Opcao({
  label,
  on,
  onPress,
  block,
  style,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  block?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={[block ? s.block : s.pill, on ? s.on : s.off, style]}
    >
      <Text style={[block ? s.blockText : s.pillText, { color: on ? colors.accentDark : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

/** Formata reais: 3.36 → "R$ 3,36". */
export function brl(v: number, cents = true) {
  const [int, dec] = (cents ? v.toFixed(2) : Math.round(v).toString()).split('.');
  const milhar = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${milhar}${dec ? `,${dec}` : ''}`;
}

export const passoStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  boxed: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.lineStrong },
  table: { borderRadius: 12, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 14 },
  note: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted },
  mono: { fontFamily: fonts.monoBold, fontSize: 14, lineHeight: 20 },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.ink },
  title: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 20, color: colors.ink },
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.cream },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const s = StyleSheet.create({
  top: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 12 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 28, height: 4, borderRadius: 999 },
  count: { width: 44, textAlign: 'right', fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16, color: colors.muted },
  h: { fontFamily: fonts.serif, fontSize: 23, lineHeight: 29, letterSpacing: -0.2, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  input: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink,
  },
  inputFocus: { borderColor: colors.accent, boxShadow: '0 0 0 4px rgba(176,85,47,0.14)' },
  pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1 },
  pillText: { fontFamily: fonts.sansSemi, fontSize: 13, lineHeight: 16 },
  block: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  blockText: { fontFamily: fonts.sansSemi, fontSize: 14 },
  on: { backgroundColor: colors.accentSoft, borderColor: colors.accentLine },
  off: { backgroundColor: colors.card, borderColor: colors.lineStrong },
});
