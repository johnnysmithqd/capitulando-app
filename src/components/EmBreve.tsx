import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, type } from '../theme';

/** Tela provisória para seções das próximas fases. */
export function EmBreve({ title, text }: { title: string; text: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.wrap, { paddingTop: insets.top + 16 }]}>
      <Text style={type.h1}>{title}</Text>
      <View style={s.box}>
        <Text style={s.tag}>EM BREVE</Text>
        <Text style={s.text}>{text}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, gap: 20 },
  box: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.lineStrong, borderRadius: 18, padding: 20, gap: 8 },
  tag: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.accentDark, letterSpacing: 1 },
  text: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.muted },
});
