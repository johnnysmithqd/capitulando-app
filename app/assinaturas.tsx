import { router, useLocalSearchParams } from 'expo-router';
import { Armchair, ChevronRight, CreditCard, Package } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AbasFita, TopoTitulo } from '../src/components/clube';
import { menu } from '../src/components/menu';
import { Card, Divider, Eyebrow, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { useApi } from '../src/data/store';
import { colors, fonts, radius, type } from '../src/theme';

type Aba = 'assinaturas' | 'pagamentos';

/** Configurações › Assinaturas e Pagamentos. ?aba=pagamentos abre direto na segunda aba. */
export default function Assinaturas() {
  const params = useLocalSearchParams<{ aba?: Aba }>();
  const insets = useSafeAreaInsets();
  const loaded = useApi(api.getConta);
  const [conta, setConta] = useState<api.Conta | null>(null);
  const [aba, setAba] = useState<Aba>(params.aba === 'pagamentos' ? 'pagamentos' : 'assinaturas');
  useEffect(() => {
    if (loaded) setConta(loaded);
  }, [loaded]);

  if (!conta) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const opcoes = (a: api.Assinatura) =>
    menu(a.clube, [
      { label: 'Ver o clube', onPress: () => router.push(`/sala-clube/${a.clubeId}`) },
      { label: 'Trocar de plano', onPress: () => router.push(`/clube/${a.clubeId}`) },
      {
        label: 'Cancelar assinatura',
        destrutiva: true,
        onPress: () =>
          Alert.alert('Cancelar assinatura?', `Você continua com acesso a ${a.clube} até o fim do período pago.`, [
            { text: 'Manter', style: 'cancel' },
            {
              text: 'Cancelar',
              style: 'destructive',
              onPress: () => {
                api.cancelarAssinatura(a.id);
                setConta({ ...conta, assinaturas: conta.assinaturas.filter((x) => x.id !== a.id) });
              },
            },
          ]),
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopoTitulo top={insets.top} titulo="Assinaturas e pagamentos" sub="sua conta" />
      <AbasFita
        itens={[
          { id: 'assinaturas', label: 'Assinaturas' },
          { id: 'pagamentos', label: 'Pagamentos' },
        ]}
        value={aba}
        onChange={setAba}
      />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: insets.bottom + 30 }}>
        {aba === 'assinaturas' ? (
          <>
            <Eyebrow>Clubes · {conta.assinaturas.length}</Eyebrow>
            {conta.assinaturas.length === 0 ? <T style={type.small}>Nenhuma assinatura ativa.</T> : null}
            {conta.assinaturas.map((a) => (
              <Pressable key={a.id} onPress={() => opcoes(a)}>
                <Card style={s.row}>
                  <View style={s.icon}>
                    <Armchair size={20} color={colors.accentDark} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T style={type.title}>{a.clube}</T>
                    <T style={type.small}>
                      {a.plano} · {a.proxima}
                    </T>
                  </View>
                  <Text style={type.mono}>{a.preco}</Text>
                </Card>
              </Pressable>
            ))}
            <Eyebrow style={{ marginTop: 8 }}>Projetos que apoio · {conta.apoios.length}</Eyebrow>
            {conta.apoios.map((a) => (
              <Pressable key={a.projetoId} onPress={() => router.push(`/apoio/${a.projetoId}`)}>
                <Card style={s.row}>
                  <View style={[s.icon, { backgroundColor: colors.greenSoft }]}>
                    <Package size={20} color={colors.green} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T style={type.title}>{a.projeto}</T>
                    <T style={type.small}>
                      {a.recompensa} · {a.status}
                    </T>
                  </View>
                  <ChevronRight size={18} color={colors.muted} />
                </Card>
              </Pressable>
            ))}
          </>
        ) : (
          <>
            <Eyebrow>Forma de pagamento</Eyebrow>
            <Card style={s.row}>
              <CreditCard size={22} color={colors.ink} />
              <View style={{ flex: 1 }}>
                <T style={type.title}>{conta.cartao ? `${conta.cartao.bandeira} final ${conta.cartao.final}` : 'Nenhum cartão salvo'}</T>
                <T style={type.small}>{conta.cartao ? `vence ${conta.cartao.validade} · Pix também disponível` : 'no checkout dá para pagar com Pix'}</T>
              </View>
              {conta.cartao ? (
                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    api.removerCartao();
                    setConta({ ...conta, cartao: null });
                  }}
                >
                  <Text style={s.link}>remover</Text>
                </Pressable>
              ) : null}
            </Card>
            <Eyebrow style={{ marginTop: 8 }}>Histórico</Eyebrow>
            <View>
              {conta.historico.map((h, i) => (
                <View key={h.data + h.descricao}>
                  {i > 0 ? <Divider /> : null}
                  <Pressable style={s.hist} onPress={() => Share.share({ message: `Recibo Capitulando · ${h.data} · ${h.descricao} · ${h.valor}` })}>
                    <Text style={[type.mono, { width: 52 }]}>{h.data}</Text>
                    <T style={{ flex: 1 }}>{h.descricao}</T>
                    <Text style={s.valor}>{h.valor}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
            <T style={type.small}>Toque num pagamento para compartilhar o recibo.</T>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  icon: { width: 42, height: 42, borderRadius: radius.sm, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  link: { fontFamily: fonts.sansSemi, fontSize: 13, color: '#8C332B' },
  hist: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  valor: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.ink },
});
