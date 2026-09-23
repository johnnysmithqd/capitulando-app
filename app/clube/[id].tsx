import { router, useLocalSearchParams } from 'expo-router';
import { Armchair } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../../src/components/BookCover';
import { Bolinha, DataBox, Numeros, RodapeFixo, Rostos, Secao, TopoFlutuante } from '../../src/components/clube';
import { Button, Card, Tag, T } from '../../src/components/ui';
import * as api from '../../src/data/api';
import type { PlanoClube } from '../../src/data/juntos/clubes';
import { useApi } from '../../src/data/store';
import { colors, fonts, type } from '../../src/theme';

// Página pública do clube: quem conduz, cronograma, planos e o botão de entrar.
export default function Clube() {
  const { id = 'cortico' } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const c = useApi(() => api.getClube(id), [id]);
  const [plano, setPlano] = useState<PlanoClube['id']>('mensal');

  useEffect(() => {
    if (c) setPlano(c.planoPadrao);
  }, [c]);

  if (!c) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const atual = c.planos.find((p) => p.id === plano) ?? c.planos[0];
  const { meuCap, capitulos } = c.cronograma;
  const irPessoa = (pid?: string) => (pid ? router.push(`/pessoa/${pid}`) : router.push('/(tabs)/perfil'));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopoFlutuante top={insets.top} onShare={() => router.push({ pathname: '/estudio', params: { tipo: 'clube', id: c.id } })} />

      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: 150 + insets.bottom, gap: 24 }}>
        {/* Cabeçalho */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4, gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
            <BookCover book={{ title: c.livro.titulo, coverColor: c.livro.cor }} width={96} onPress={() => router.push(`/livro/${c.livro.id}`)} />
            <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <Text style={[type.eyebrow, { color: colors.accentDark }]}>{c.eyebrow}</Text>
              <Text style={s.h1}>{c.nome}</Text>
              <T style={{ color: colors.inkSoft }}>{c.descricao}</T>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', paddingTop: 2 }}>
                {c.tags.map((t) => (
                  <Tag key={t.label} label={t.label} tone={t.tone} />
                ))}
              </View>
            </View>
          </View>
          <Numeros itens={c.numeros} />
        </View>

        <Secao titulo="Quem conduz">
          <Pressable onPress={() => irPessoa(c.condutor.id)}>
            <Card style={s.condutor}>
              <Bolinha p={c.condutor} size={48} fontSize={17} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={type.title}>{c.condutor.nome}</Text>
                <Text style={s.sub13}>{c.condutor.bio}</Text>
              </View>
            </Card>
          </Pressable>
        </Secao>

        <Secao titulo={c.cronograma.titulo} direita={<Text style={s.mono12}>{c.cronograma.progresso}</Text>}>
          <Card style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
            {capitulos.map((cap, i) => {
              const passado = cap.n < meuCap;
              const atualCap = cap.n === meuCap;
              return (
                <View key={cap.n} style={[s.capRow, i < capitulos.length - 1 && s.borda]}>
                  <View style={[s.capNum, { backgroundColor: passado ? colors.greenSoft : atualCap ? colors.accent : colors.cream }]}>
                    <Text style={[s.capNumText, { color: passado ? colors.green : atualCap ? colors.paper : colors.faint }]}>{cap.n}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[s.capTitulo, { color: atualCap ? colors.accentDark : cap.n > meuCap ? colors.faint : colors.ink }]}>{cap.titulo}</Text>
                    <Text style={type.small}>{cap.sem}</Text>
                  </View>
                  {atualCap ? <Tag label="esta semana" tone="accent" /> : null}
                </View>
              );
            })}
          </Card>
        </Secao>

        <Secao titulo="Próxima sessão">
          <Card style={s.sessao}>
            <DataBox d={c.proximaSessao.d} m={c.proximaSessao.m} />
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={type.title}>{c.proximaSessao.titulo}</Text>
              <Text style={s.sub13}>
                {c.proximaSessao.dia} · <Text style={{ fontFamily: fonts.monoBold, fontSize: 12 }}>{c.proximaSessao.hora}</Text> · {c.proximaSessao.resto}
              </Text>
              <Text style={type.small}>{c.proximaSessao.nota}</Text>
            </View>
          </Card>
        </Secao>

        <Secao titulo="Planos">
          {c.planos.map((p) => {
            const on = p.id === plano;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPlano(p.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[s.plano, on ? s.planoOn : null]}
              >
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={type.title}>{p.nome}</Text>
                    {p.gratis ? <Tag label="grátis" tone="green" /> : null}
                  </View>
                  <Text style={s.sub13}>{p.desc}</Text>
                  {p.nao ? <Text style={[type.small, { color: colors.faint }]}>{p.nao}</Text> : null}
                </View>
                <Text style={s.preco}>{p.preco}</Text>
              </Pressable>
            );
          })}
          <Text style={type.small}>{c.planosNota}</Text>
        </Secao>

        <Secao titulo={`Membros · ${c.membrosTotal}`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Rostos pessoas={c.membros} mais={`+${c.membrosTotal - c.membros.length}`} />
            <Text style={[s.sub13, { flex: 1 }]}>{c.membrosTxt}</Text>
          </View>
        </Secao>
      </ScrollView>

      <RodapeFixo bottom={insets.bottom}>
        <Button
          label={`Puxar a cadeira · ${atual.nome} · ${atual.preco}`}
          icon={<Armchair size={18} color={colors.paper} />}
          onPress={() => router.push({ pathname: '/checkout', params: { tipo: 'clube', id: c.id, opcao: atual.id } })}
        />
        <Text style={[type.small, { textAlign: 'center' }]}>{c.rodape}</Text>
      </RodapeFixo>
    </View>
  );
}

const s = StyleSheet.create({
  h1: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 28, color: colors.ink, letterSpacing: -0.24 },
  sub13: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  mono12: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16, color: colors.muted },
  condutor: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  capRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  borda: { borderBottomWidth: 1, borderBottomColor: colors.line },
  capNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  capNumText: { fontFamily: fonts.monoBold, fontSize: 12 },
  capTitulo: { fontFamily: fonts.sansSemi, fontSize: 14, lineHeight: 18 },
  sessao: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  plano: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.card,
  },
  planoOn: { borderWidth: 2, borderColor: colors.accent, backgroundColor: '#FDF8F4', padding: 13 },
  preco: { fontFamily: fonts.monoBold, fontSize: 15, lineHeight: 18, color: colors.ink },
});
