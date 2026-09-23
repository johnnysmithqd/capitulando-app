import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../theme';
import { Eyebrow } from './ui';

/** Grupo de opções de escolha única, usado nas folhas de filtro. */
export function ChipGroup<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [K, string][];
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Eyebrow>{label}</Eyebrow>
      <View style={s.wrap}>
        {options.map(([k, l]) => {
          const on = k === value;
          return (
            <Pressable key={k} onPress={() => onChange(k)} style={[s.chip, on && s.on]}>
              <Text style={[s.text, on && { color: colors.accentDark }]}>{l}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: radius.pill, paddingHorizontal: 16, height: 40, justifyContent: 'center', backgroundColor: colors.cream, borderWidth: 1, borderColor: 'transparent' },
  on: { backgroundColor: colors.accentSoft, borderColor: colors.accentLine },
  text: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
});
