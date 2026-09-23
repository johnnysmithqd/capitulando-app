import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Sheet } from '../src/components/Sheet';
import { Divider, T } from '../src/components/ui';
import { useStore, type Ordem } from '../src/data/store';
import { colors, type } from '../src/theme';

const OPCOES: [Ordem, string, string][] = [
  ['recentes', 'Adicionados recentemente', 'os últimos que você marcou como lidos'],
  ['nota', 'Nota, da maior', 'cinco estrelas primeiro'],
  ['titulo', 'Título, A–Z', 'ordem alfabética'],
  ['autor', 'Autor, A–Z', 'agrupa quem você lê muito'],
  ['paginas', 'Mais grosso primeiro', 'para escolher pelo fôlego'],
];

export default function Ordenar() {
  const { estanteFiltro, setEstanteFiltro } = useStore();
  return (
    <Sheet title="Ordenar por" showClose={false}>
      <View style={{ paddingHorizontal: 20 }}>
        {OPCOES.map(([k, t, d], i) => (
          <View key={k}>
            {i > 0 ? <Divider /> : null}
            <Pressable
              style={s.row}
              onPress={() => {
                setEstanteFiltro({ ...estanteFiltro, ordem: k });
                router.back();
              }}
            >
              <View style={{ flex: 1 }}>
                <T style={[type.body, { fontSize: 15 }]}>{t}</T>
                <T style={type.small}>{d}</T>
              </View>
              {estanteFiltro.ordem === k ? <Check size={20} color={colors.ink} /> : null}
            </Pressable>
          </View>
        ))}
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 } });
