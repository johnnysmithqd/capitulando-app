import { router, useLocalSearchParams } from 'expo-router';
import { Megaphone, MoreHorizontal, Plus, UserPlus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AbasFita, Bolinha, DataBox, RodapeFixo, TopoTitulo, useAviso } from '../../src/components/clube';
import { Button, Card, Divider, T } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { useApi } from '../../src/data/store';
import { colors, fonts, radius, type } from '../../src/theme';

type Aba = 'membros' | 'pagamentos' | 'sessoes' | 'enquetes';
const ABAS: { id: Aba; label: string }[] = [
  { id: 'membros', label: 'Membros' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'sessoes', label: 'Sessões' },
  { id: 'enquetes', label: 'Enquetes' },
];
const TOM_ONDE = {
  lilas: { bg: colors.lilacSoft, fg: '#4E4573' },
  terracota: { bg: colors.accentSoft, fg: colors.accentDark },
  neutro: { bg: colors.cream, fg: colors.muted },
} as const;

// Painel de quem conduz o clube: membros, repasses, sessões e enquetes.
export default function PainelClube() {
  const { id = 'sarau', aba: abaInicial } = useLocalSearchParams<{ id?: string; aba?: Aba }>();
  const insets = useSafeAreaInsets();
  const loaded = useApi(() => api.getPainelClube(id), [id]);
  const [p, setP] = useState<api.PainelClube | null>(null);
  const [aba, setAba] = useState<Aba>(ABAS.some((a) => a.id === abaInicial) ? (abaInicial as Aba) : 'membros');
  const [aviso, avisar] = useAviso();
  useEffect(() => {
    if (loaded) setP(loaded);
  }, [loaded]);

  if (!p) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const opcoesMembro = (m: api.MembroPainel) => {
    const acoes = ['Mudar plano', 'Dar cortesia', 'Remover do clube'];
    const escolher = (i: number) => {
      if (i === 2) setP({ ...p, membros: p.membros.filter((x) => x !== m) });
      if (i >= 0 && i < 3) avisar(`${acoes[i]} · ${m.nome}`);
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({ options: [...acoes, 'Cancelar'], destructiveButtonIndex: 2, cancelButtonIndex: 3, title: m.nome }, escolher);
    } else {
      Alert.alert(m.nome, undefined, [
        ...acoes.map((a, i) => ({ text: a, style: (i === 2 ? 'destructive' : 'default') as 'destructive' | 'default', onPress: () => escolher(i) })),
        { text: 'Cancelar', style: 'cancel' as const },
      ]);
    }
  };

  const encerrar = (e: api.EnquetePainel) => {
    api.encerrarEnquete(p.id, e.id);
    setP({ ...p, enquetes: p.enquetes.map((x) => (x.id === e.id ? { ...x, aberta: false, meta: 'encerrada agora' } : x)) });
    avisar('Enquete encerrada · resultado publicado no clube');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopoTitulo
        top={insets.top}
        titulo={p.nome}
        sub="você conduz · painel"
        direita={
          <Pressable style={s.verComo} onPress={() => router.push(`/sala-clube/${p.id}`)}>
            <Text style={s.verComoText}>ver como membro</Text>
          </Pressable>
        }
      />
      <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={s.numeros}>
          {p.numeros.map((n) => (
            <Card key={n.d} style={s.numero}>
              <Text style={[s.numeroN, n.verde && { color: colors.green }]}>{n.n}</Text>
              <T style={type.small}>{n.d}</T>
            </Card>
          ))}
        </View>
        <View style={{ backgroundColor: colors.bg }}>
          <AbasFita itens={ABAS} value={aba} onChange={setAba} />
        </View>

        <View style={{ padding: 20, gap: 12 }}>
          {aba === 'membros' && (
            <>
              {p.pedidos ? (
                <Pressable style={s.pedidos} onPress={() => avisar(`${p.pedidos} pedidos abertos`)}>
                  <UserPlus size={18} color={colors.gold} />
                  <T style={[type.small, { flex: 1, color: colors.gold, fontSize: 13 }]}>{p.pedidos} pedidos para entrar · clube com aprovação</T>
                  <Text style={[s.link, { color: colors.gold }]}>ver</Text>
                </Pressable>
              ) : null}
              {p.membros.map((m, i) => (
                <View key={m.nome}>
                  {i > 0 ? <Divider /> : null}
                  <View style={s.row}>
                    <Pressable onPress={() => m.id && router.push(`/pessoa/${m.id}`)}>
                      <Bolinha p={m} size={42} fontSize={14} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <T style={type.title}>{m.nome}</T>
                      <T style={type.small}>{m.plano}</T>
                    </View>
                    <Pressable onPress={() => opcoesMembro(m)} hitSlop={10} accessibilityLabel={`Opções de ${m.nome}`}>
                      <MoreHorizontal size={20} color={colors.inkSoft} />
                    </Pressable>
                  </View>
                </View>
              ))}
              <T style={[type.small, { textAlign: 'center', marginTop: 6 }]}>{p.membrosRodape}</T>
            </>
          )}

          {aba === 'pagamentos' && (
            <>
              <Card style={{ padding: 14, gap: 10 }}>
                <View style={s.linhaValor}>
                  <T>{p.repasse.mes}</T>
                  <Text style={s.mono}>{p.repasse.bruto}</Text>
                </View>
                <View style={s.linhaValor}>
                  <T>A casa · 14%</T>
                  <Text style={s.mono}>{p.repasse.casa}</Text>
                </View>
                <Divider />
                <View style={s.linhaValor}>
                  <T style={type.title}>{p.repasse.data}</T>
                  <Text style={[s.mono, { color: colors.green, fontSize: 16 }]}>{p.repasse.liquido}</Text>
                </View>
                <T style={type.small}>
                  {p.repasse.chave} · <Text style={{ color: colors.accentDark }}>trocar</Text>
                </T>
              </Card>
              {p.membros.map((m, i) => (
                <View key={m.nome}>
                  {i > 0 ? <Divider /> : null}
                  <View style={s.row}>
                    <Bolinha p={m} size={42} fontSize={14} />
                    <View style={{ flex: 1 }}>
                      <T style={type.title}>{m.nome}</T>
                      <T style={type.small}>{m.plano}</T>
                    </View>
                    <View style={[s.status, { backgroundColor: m.pagamentoOk ? colors.greenSoft : '#FDF6E0' }]}>
                      <Text style={[s.statusText, { color: m.pagamentoOk ? colors.green : colors.gold }]}>{m.pagamento}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          {aba === 'sessoes' && (
            <>
              <Card style={{ padding: 14, gap: 12 }}>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <DataBox d={p.sessao.d} m={p.sessao.m} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <T style={type.title}>{p.sessao.titulo}</T>
                    <T style={type.small}>{p.sessao.quando}</T>
                    <T style={type.small}>{p.sessao.respostas}</T>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button label="Editar" variant="outline" style={{ flex: 1, height: 46 }} onPress={() => avisar('Editar sessão')} />
                  <Button
                    label="Lembrar quem não respondeu"
                    variant="soft"
                    style={{ flex: 1.3, height: 46 }}
                    onPress={() => {
                      api.lembrarSemResposta(p.id);
                      avisar('Lembrete enviado');
                    }}
                  />
                </View>
              </Card>
              <Pressable style={s.tracejado} onPress={() => avisar('Nova sessão')}>
                <Plus size={18} color={colors.inkSoft} />
                <T style={[type.title, { flex: 1 }]}>Nova sessão</T>
                <T style={type.small}>repete a última por padrão</T>
              </Pressable>
              {p.sessoesPassadas.map((x) => (
                <View key={x.data} style={[s.row, { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
                  <Text style={[type.mono, { width: 56 }]}>{x.data}</Text>
                  <T style={{ flex: 1 }}>{x.titulo}</T>
                  <Text style={type.mono}>{x.presentes} presentes</Text>
                </View>
              ))}
            </>
          )}

          {aba === 'enquetes' && (
            <>
              <Pressable style={s.tracejado} onPress={() => router.push({ pathname: '/nova-enquete', params: { clube: p.id, pessoas: String(p.membrosTotal) } })}>
                <Plus size={18} color={colors.inkSoft} />
                <View style={{ flex: 1 }}>
                  <T style={type.title}>Nova enquete</T>
                  <T style={type.small}>solta, ou dentro de uma sessão</T>
                </View>
              </Pressable>
              {p.enquetes.map((e) => {
                const tom = TOM_ONDE[e.ondeTom];
                const max = Math.max(...e.opcoes.map((o) => o.pct));
                return (
                  <Card key={e.id} style={{ padding: 14, gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <View style={[s.onde, { backgroundColor: tom.bg }]}>
                        <Text style={[s.ondeText, { color: tom.fg }]}>{e.onde}</Text>
                      </View>
                      <T style={[type.small, { flexShrink: 1, textAlign: 'right' }]}>{e.meta}</T>
                    </View>
                    <T style={[type.body, { fontSize: 15, fontFamily: fonts.sansSemi }]}>{e.pergunta}</T>
                    {e.opcoes.map((o) => {
                      const lider = e.aberta && o.pct === max;
                      return (
                        <View key={o.t} style={s.barra}>
                          <View style={[s.barraFill, { width: `${o.pct}%`, backgroundColor: lider ? colors.accentSoft : colors.line }]} />
                          <T style={{ flex: 1, color: e.aberta ? colors.ink : colors.inkSoft }}>{o.t}</T>
                          <Text style={[type.mono, lider && { color: colors.accentDark }]}>{o.pct}%</Text>
                        </View>
                      );
                    })}
                    <Button
                      label={e.aberta ? 'Encerrar agora' : 'Ver quem votou · anônima'}
                      variant="outline"
                      style={{ height: 44 }}
                      onPress={() => (e.aberta ? encerrar(e) : avisar('Voto anônimo: só a contagem fica visível'))}
                    />
                  </Card>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
      <RodapeFixo bottom={insets.bottom}>
        <Button
          label="Avisar o clube"
          icon={<Megaphone size={18} color={colors.paper} />}
          onPress={() => router.push({ pathname: '/avisar', params: { tipo: 'clube', id: p.id, nome: p.nome } })}
        />
      </RodapeFixo>
      {aviso}
    </View>
  );
}

const s = StyleSheet.create({
  verComo: { backgroundColor: colors.cream, borderRadius: radius.sm, paddingHorizontal: 12, height: 38, justifyContent: 'center', marginRight: 16 },
  verComoText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  numeros: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  numero: { flex: 1, padding: 12, gap: 4 },
  numeroN: { fontFamily: fonts.monoBold, fontSize: 20, color: colors.ink },
  pedidos: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FDF6E0', borderRadius: radius.md, padding: 12 },
  link: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.accentDark },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  linhaValor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mono: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.ink },
  status: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: fonts.sansSemi, fontSize: 12 },
  tracejado: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accentLine, borderRadius: radius.md, padding: 16 },
  onde: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  ondeText: { fontFamily: fonts.sansSemi, fontSize: 12 },
  barra: { flexDirection: 'row', alignItems: 'center', height: 42, borderRadius: radius.sm, backgroundColor: colors.cream, paddingHorizontal: 12, overflow: 'hidden' },
  barraFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
});
