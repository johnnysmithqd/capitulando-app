import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataBox } from '../src/components/clube';
import { Sheet } from '../src/components/Sheet';
import { Button } from '../src/components/ui';
import * as api from '../src/data/api';
import type { RespostaPresenca } from '../src/data/juntos/clubes';
import { useApi } from '../src/data/store';
import { colors, fonts, type } from '../src/theme';

// Folha · confirmar presença na próxima sessão do clube (?clube=id).
export default function Rsvp() {
  const { clube = 'cortico' } = useLocalSearchParams<{ clube?: string }>();
  const sessao = useApi(() => api.getSessaoRsvp(clube), [clube]);

  const responder = (r: RespostaPresenca) => {
    api.confirmarPresenca(clube, r).then(() => router.back());
  };

  return (
    <Sheet showClose={false}>
      {sessao ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 4, gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <DataBox d={sessao.d} m={sessao.m} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.titulo}>{sessao.titulo}</Text>
              <Text style={[type.body, { color: colors.inkSoft }]}>
                {sessao.dia} · <Text style={{ fontFamily: fonts.monoBold, fontSize: 13 }}>{sessao.hora}</Text> · {sessao.resto}
              </Text>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Button label="Vou" onPress={() => responder('vou')} />
            <Pressable style={s.talvez} onPress={() => responder('talvez')}>
              <Text style={[s.btnText, { color: colors.ink }]}>Talvez</Text>
            </Pressable>
            <Pressable style={s.naoVou} onPress={() => responder('nao')}>
              <Text style={[s.btnText, { color: colors.inkSoft }]}>Não vou</Text>
            </Pressable>
          </View>
          <Text style={[type.small, { textAlign: 'center' }]}>Lembrete 1 hora antes. Entra no seu calendário se quiser.</Text>
        </View>
      ) : (
        <View style={{ height: 240 }} />
      )}
    </Sheet>
  );
}

const s = StyleSheet.create({
  titulo: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 24, color: colors.ink },
  talvez: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  naoVou: { height: 44, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: fonts.sansSemi, fontSize: 15 },
});
