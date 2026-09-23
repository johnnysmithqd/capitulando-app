import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CapaMini, DataBox, RodapeFixo, TopoTitulo } from '../../src/components/clube';
import { Button, Card, Eyebrow, T } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { useApi } from '../../src/data/store';
import { colors, fonts, radius, type } from '../../src/theme';

const COR_ETAPA = { feito: colors.green, agora: colors.accent, depois: colors.lineStrong } as const;

// "Meu apoio": o que você apoiou num projeto, rastreio da entrega e atualizações.
export default function MeuApoio() {
  const { id = 'quadrinhos' } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const a = useApi(() => api.getMeuApoio(id), [id]);

  if (!a) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopoTitulo
        top={insets.top}
        titulo="Meu apoio"
        sub={a.projetoNome}
        direita={
          <Pressable onPress={() => router.push(`/projeto/${a.projetoId}`)} hitSlop={8} style={{ paddingRight: 16 }}>
            <Text style={s.link}>ver projeto</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 + insets.bottom }}>
        <Card style={s.resumo}>
          <CapaMini cor={a.capaCor} titulo={a.projetoNome} w={68} h={96} fontSize={10} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.h}>{a.projetoNome}</Text>
            <T style={type.small}>
              {a.recompensa} · <Text style={{ fontFamily: fonts.monoBold }}>{a.valor}</Text>
            </T>
            <View style={s.pago}>
              <Text style={s.pagoText}>{a.pagamento}</Text>
            </View>
          </View>
        </Card>

        {a.rastreio ? (
          <Card style={{ padding: 14, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T style={[type.title, { fontFamily: fonts.sansSemi }]}>Rastreio · Correios</T>
              <Text style={type.mono}>{a.rastreio.codigo}</Text>
            </View>
            {a.rastreio.etapas.map((e, i) => (
              <View key={e.titulo} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ alignItems: 'center', width: 16 }}>
                  <View style={[s.ponto, { backgroundColor: COR_ETAPA[e.estado] }, e.estado === 'agora' && s.pontoAgora]} />
                  {i < a.rastreio!.etapas.length - 1 ? <View style={s.linha} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: 10 }}>
                  <T style={[type.title, e.estado === 'depois' && { color: colors.faint }]}>{e.titulo}</T>
                  <T style={type.small}>{e.sub}</T>
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        <Eyebrow>Atualizações do projeto</Eyebrow>
        <Card style={{ paddingHorizontal: 14 }}>
          {a.atualizacoes.map((u, i) => (
            <View key={u.d + u.m} style={[s.atu, i < a.atualizacoes.length - 1 && s.borda]}>
              <DataBox d={u.d} m={u.m} w={44} dSize={18} bg={colors.cream} fg={colors.inkSoft} />
              <View style={{ flex: 1, gap: 3 }}>
                <T style={type.title}>{u.titulo}</T>
                <T style={[type.small, { fontSize: 13, lineHeight: 18, color: colors.inkSoft }]}>{u.txt}</T>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
      <RodapeFixo bottom={insets.bottom} style={{ flexDirection: 'row', gap: 10 }}>
        <Button label={`Falar com o ${a.autorNome.split(' ')[0]}`} variant="outline" style={{ flex: 1 }} onPress={() => router.push('/caixa')} />
        <Button
          label="Recibo"
          variant="outline"
          style={{ flex: 1 }}
          onPress={() => Share.share({ message: `Recibo · ${a.projetoNome} · ${a.recompensa} · ${a.valor} · ${a.pagamento}` })}
        />
      </RodapeFixo>
    </View>
  );
}

const s = StyleSheet.create({
  link: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.accentDark },
  resumo: { flexDirection: 'row', gap: 14, padding: 14, alignItems: 'center' },
  h: { fontFamily: fonts.sansBold, fontSize: 16, lineHeight: 21, color: colors.ink },
  pago: { alignSelf: 'flex-start', backgroundColor: colors.greenSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginTop: 2 },
  pagoText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.green },
  ponto: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  pontoAgora: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: colors.accentSoft, marginTop: 2 },
  linha: { flex: 1, width: 2, backgroundColor: colors.line, marginTop: 2 },
  atu: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  borda: { borderBottomWidth: 1, borderBottomColor: colors.line },
});
