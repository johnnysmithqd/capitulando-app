import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { colors, fonts, radius, shadow, type } from '../theme';

export function T({ style, ...p }: TextProps) {
  return <Text {...p} style={[type.body, style]} />;
}

export function Eyebrow({ children, color, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[type.eyebrow, color ? { color } : null, style]}>{children}</Text>;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Eyebrow>{title}</Eyebrow>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={s.link}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

type BtnVariant = 'primary' | 'soft' | 'outline' | 'ghost';
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
  small,
}: {
  label: string;
  onPress?: PressableProps['onPress'];
  variant?: BtnVariant;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const v = btnVariants[variant];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.btn, small && s.btnSmall, v.box, pressed && { opacity: 0.85 }, style]}
    >
      {icon}
      <Text style={[s.btnText, small && s.btnTextSmall, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

const btnVariants: Record<BtnVariant, { box: ViewStyle; fg: string }> = {
  primary: { box: { backgroundColor: colors.accent }, fg: colors.paper },
  soft: { box: { backgroundColor: colors.accentSoft }, fg: colors.accentDark },
  outline: { box: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accentLine }, fg: colors.ink },
  ghost: { box: { backgroundColor: 'transparent' }, fg: colors.muted },
};

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active ? { backgroundColor: colors.accentSoft, borderColor: colors.accentLine } : null]}
    >
      {icon}
      <Text style={[s.chipText, active ? { color: colors.accentDark } : null]}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label, tone = 'cream' }: { label: string; tone?: 'cream' | 'accent' | 'green' }) {
  const bg = tone === 'accent' ? colors.accentSoft : tone === 'green' ? colors.greenSoft : colors.cream;
  const fg = tone === 'accent' ? colors.accentDark : tone === 'green' ? colors.green : colors.inkSoft;
  return (
    <View style={[s.tag, { backgroundColor: bg }]}>
      <Text style={[s.tagText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ pct, color = colors.accent, track = colors.line, height = 6 }: { pct: number; color?: string; track?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export function Stars({ value, size = 12, color = colors.gold }: { value: number; size?: number; color?: string }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <Text style={{ fontSize: size, color, letterSpacing: 1 }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
    </Text>
  );
}

export function Avatar({ initials, bg, fg, size = 36 }: { initials: string; bg: string; fg: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.sansBold, fontSize: size * 0.36, color: fg }}>{initials}</Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: colors.line }, style]} />;
}

export function Segmented<K extends string>({ items, value, onChange }: { items: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <View style={s.seg}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)} style={[s.segItem, on && s.segItemOn]}>
            <Text style={[s.segText, on && { color: colors.ink, fontFamily: fonts.sansBold }]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function IconButton({ children, onPress, label, style }: { children: ReactNode; onPress?: () => void; label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} hitSlop={6} style={[s.iconBtn, style]}>
      {children}
    </Pressable>
  );
}

const s = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  link: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.accentDark },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, ...shadow.card },
  btn: {
    height: 52,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSmall: { height: 36, borderRadius: radius.pill, paddingHorizontal: 14 },
  btnText: { fontFamily: fonts.sansSemi, fontSize: 16 },
  btnTextSmall: { fontSize: 13, fontFamily: fonts.sansBold },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, alignSelf: 'flex-start' },
  tagText: { fontFamily: fonts.sansSemi, fontSize: 11 },
  seg: { flexDirection: 'row', backgroundColor: colors.cream, borderRadius: radius.sm, padding: 3 },
  segItem: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  segItemOn: { backgroundColor: colors.paper, ...shadow.card },
  segText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.muted },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/** Fita de marcador de página (o glyph do protótipo): retângulo com corte em V embaixo. */
export function Fita({ width = 12, height = 10, corte = 0.62, color = colors.accent, style }: { width?: number; height?: number; corte?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={width} height={height} style={style} pointerEvents="none">
      <Polygon points={`0,0 ${width},0 ${width},${height} ${width / 2},${height * corte} 0,${height}`} fill={color} />
    </Svg>
  );
}
