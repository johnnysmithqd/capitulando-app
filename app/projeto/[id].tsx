import { router, useLocalSearchParams } from 'expo-router';
import { Lock, Package } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bolinha, CapaMini, DataBox, Numeros, RodapeFixo, Rostos, Secao, TopoFlutuante } from '../../src/components/clube';
import { Button, Card, ProgressBar } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { useApi } from '../../src/data/store';
import { colors, fonts, type } from '../../src/theme';

// Página do projeto (financiamento coletivo): meta, história, recompensas e apoio.
export default function Projeto() {
  const { id = 'quadrinhos' } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const p = useApi(() => api.getProjeto(id), [id]);
  const [rec, setRec] = useState('');
  const [historiaToda, setHistoriaToda] = useState(false);

  useEffect(() => {
    if (p) setRec(p.recompensaPadrao);
  }, [p]);

  if (!p) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const atual = p.recompensas.find((r) => r.id === rec) ?? p.recompensas[0];
  const irAutor = () => p.autor.id && router.push(`/pessoa/${p.autor.id}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopoFlutuante top={insets.top} onShare={() => router.push({ pathname: '/estudio', params: { tipo: 'projeto', id: p.id } })} />

      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: 150 + insets.bottom, gap: 24 }}>
        {/* Imagem do projeto (listrada enquanto não há foto) */}
        <View style={s.imagem}>
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <Pattern id="listras" width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <Rect width={8} height={16} fill={colors.line} />
                <Rect x={8} width={8} height={16} fill={colors.cream} />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#listras)" />
          </Svg>
          <Text style={s.imagemTag}>imagem do projeto · 16:9</Text>
          <View style={{ position: 'absolute', right: 14, bottom: 14 }}>
            <CapaMini cor={p.capaCor} titulo={p.nome} w={64} h={96} fontSize={9} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <Text style={[type.eyebrow, { color: colors.accentDark }]}>{p.eyebrow}</Text>
          <Text style={s.h1}>{p.nome}</Text>
          <Pressable onPress={irAutor} disabled={!p.autor.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Bolinha p={p.autor} />
            <Text style={[type.body, { color: colors.inkSoft, flex: 1 }]}>
              por <Text style={{ fontFamily: fonts.sansBold, color: colors.ink }}>{p.autor.nome}</Text> · {p.autor.sub}
            </Text>
          </Pressable>
        </View>

        <Card style={s.meta}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={s.valor}>{p.arrecadado}</Text>
            <Text style={s.mono13}>de {p.meta}</Text>
          </View>
          <ProgressBar pct={p.pct} height={8} />
          <Numeros
            itens={[
              { n: `${p.pct}%`, d: 'da meta' },
              { n: String(p.apoiadoresTotal), d: 'apoiadores' },
              { n: String(p.diasRestantes), d: 'dias restantes' },
            ]}
          />
          <Text style={type.small}>{p.regra}</Text>
        </Card>

        <Secao titulo="A história">
          <Text style={s.historia} numberOfLines={historiaToda ? undefined : 6}>
            {p.historia}
          </Text>
          <Pressable onPress={() => setHistoriaToda((v) => !v)} style={{ paddingVertical: 8 }}>
            <Text style={s.link}>{historiaToda ? 'Mostrar menos' : 'Ler a história completa'}</Text>
          </Pressable>
        </Secao>

        <Secao titulo="Recompensas">
          {p.recompensas.map((r) => {
            const on = r.id === rec;
            return (
              <Pressable
                key={r.id}
                onPress={() => setRec(r.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[s.rec, on ? s.recOn : null]}
              >
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[type.title, { flexShrink: 1 }]}>{r.nome}</Text>
                    {r.fisica ? <Package size={14} color={colors.muted} /> : null}
                  </View>
                  <Text style={s.sub13}>{r.desc}</Text>
                  {r.restantes ? <Text style={[s.mono12, { color: colors.gold }]}>{r.restantes}</Text> : null}
                </View>
                <Text style={s.preco}>{r.preco}</Text>
              </Pressable>
            );
          })}
        </Secao>

        <Secao titulo={`Atualizações · ${p.atualizacoes.length}`}>
          <Card style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 }}>
            {p.atualizacoes.map((a, i) => (
              <View key={a.d + a.m} style={[s.atu, i < p.atualizacoes.length - 1 && s.borda]}>
                <DataBox d={a.d} m={a.m} w={44} dSize={18} bg={colors.cream} fg={colors.inkSoft} />
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[type.title, { fontSize: 14, lineHeight: 18, flexShrink: 1 }]}>{a.titulo}</Text>
                    {a.soApoiadores ? <Lock size={13} color={colors.faint} /> : null}
                  </View>
                  {a.txt ? <Text style={s.sub13}>{a.txt}</Text> : null}
                  {a.soApoiadores ? <Text style={[s.sub13, { color: colors.faint }]}>Só para apoiadores.</Text> : null}
                </View>
              </View>
            ))}
          </Card>
        </Secao>

        <Secao titulo={`Apoiadores · ${p.apoiadoresTotal}`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Rostos pessoas={p.apoiadores} />
            <Text style={[s.sub13, { flex: 1 }]}>{p.apoiadoresTxt}</Text>
          </View>
        </Secao>

        <Secao titulo="Perguntas frequentes" gap={6}>
          {p.faq.map((f) => (
            <View key={f.q} style={[s.faq, s.borda]}>
              <Text style={[type.title, { fontSize: 14 }]}>{f.q}</Text>
              <Text style={s.sub13}>{f.a}</Text>
            </View>
          ))}
        </Secao>
      </ScrollView>

      <RodapeFixo bottom={insets.bottom}>
        <Button label={`Apoiar · ${atual.nome} · ${atual.preco}`} onPress={() => router.push({ pathname: '/checkout', params: { tipo: 'apoio', id: p.id, opcao: atual.id } })} />
        <Text style={[type.small, { textAlign: 'center' }]}>{p.rodape}</Text>
      </RodapeFixo>
    </View>
  );
}

const s = StyleSheet.create({
  imagem: { marginHorizontal: 20, height: 200, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'flex-start', padding: 14 },
  imagemTag: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.muted,
    backgroundColor: 'rgba(252,250,245,.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  h1: { fontFamily: fonts.serif, fontSize: 23, lineHeight: 29, color: colors.ink, letterSpacing: -0.23 },
  meta: { marginHorizontal: 20, padding: 16, gap: 12, borderRadius: 12 },
  valor: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 32, color: colors.ink },
  mono12: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16 },
  mono13: { fontFamily: fonts.monoBold, fontSize: 13, lineHeight: 16, color: colors.muted },
  sub13: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  historia: { fontFamily: fonts.serifRegular, fontSize: 16, lineHeight: 25, color: colors.ink },
  link: { fontFamily: fonts.sansSemi, fontSize: 14, lineHeight: 20, color: colors.accentDark },
  rec: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.card },
  recOn: { borderWidth: 2, borderColor: colors.accent, backgroundColor: '#FDF8F4', padding: 13 },
  preco: { fontFamily: fonts.monoBold, fontSize: 15, lineHeight: 18, color: colors.ink },
  atu: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 10 },
  borda: { borderBottomWidth: 1, borderBottomColor: colors.line },
  faq: { gap: 4, paddingVertical: 10 },
});
