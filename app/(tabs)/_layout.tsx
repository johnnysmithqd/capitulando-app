import { Tabs, router } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Newspaper, Plus, User, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../../src/theme';

const ICONS = { index: Home, descobrir: Newspaper, juntos: Users, perfil: User } as const;
const LABELS = { index: 'Início', descobrir: 'Descobrir', juntos: 'Juntos', perfil: 'Perfil' } as const;
type TabName = keyof typeof ICONS;

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((r) => r.name in ICONS);
  const item = (name: TabName) => {
    const idx = state.routes.findIndex((r) => r.name === name);
    const on = state.index === idx;
    const Icon = ICONS[name];
    return (
      <Pressable
        key={name}
        style={s.item}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        onPress={() => navigation.navigate(name)}
      >
        {on ? <View style={s.marker} /> : null}
        <Icon size={22} color={on ? colors.ink : colors.muted} strokeWidth={on ? 2.2 : 1.8} />
        <Text style={[s.label, { color: on ? colors.ink : colors.muted }]}>{LABELS[name]}</Text>
      </Pressable>
    );
  };
  const names = routes.map((r) => r.name as TabName);
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {names.slice(0, 2).map(item)}
      <View style={s.item}>
        <Pressable style={s.fab} onPress={() => router.push('/registrar')} accessibilityLabel="Registrar leitura">
          <Plus size={26} color={colors.paper} strokeWidth={2.4} />
        </Pressable>
      </View>
      {names.slice(2).map(item)}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="descobrir" />
      <Tabs.Screen name="juntos" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  marker: { position: 'absolute', top: -9, width: 12, height: 14, backgroundColor: colors.accent, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  label: { fontFamily: fonts.sansSemi, fontSize: 12 },
  fab: {
    marginTop: -30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
