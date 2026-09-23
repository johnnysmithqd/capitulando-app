import { router, useLocalSearchParams } from 'expo-router';
import { PencilLine, Share2, TrendingUp } from 'lucide-react-native';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RodapeFixo, TopoTitulo, useAviso } from '../../src/components/clube';
import { Button, Card, Divider, Eyebrow, ProgressBar, T } from '../../src/components/ui';
import * as api from '../../src/data/api';
import { useApi } from '../../src/data/store';
import { colors, fonts, radius, type } from '../../src/theme';

const TOM = {
  ok: { bg: colors.greenSoft, fg: colors.green },
  pendente: { bg: '#FDF6E0', fg: colors.gold },
  neutro: { bg: colors.cream, fg: colors.inkSoft },
} as const;

// Painel de quem abriu o projeto: arrecadação, apoios por recompensa e envios.
export default function PainelProjeto() {
  const { id = 'poetas' } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const p = useApi(() => api.getPainelProjeto(id), [id]);
  const [aviso, avisar] = useAviso();

  if (!p) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const postar = () => router.push({ pathname: '/avisar', params: { tipo: 'projeto', id: p.id, nome: p.nome } });
  const total = p.recompensas.reduce((a, r) => a + r.apoios, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopoTitulo
        top={insets.top}
        titulo={p.nome}
        sub="seu projeto · painel"
        direita={
          <Pressable style={s.ver} onPress={() => router.push(`/projeto/${p.id}`)}>
            <Text style={s.verText}>ver página</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 + insets.bottom }}>
        <Card style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={s.valor}>{p.arrecadado}</Text>
            <Text style={type.mono}>de {p.meta}</Text>
          </View>
          <ProgressBar pct={p.pct} height={8} />
          <View style={{ flexDirection: 'row' }}>
            {[
              [`${p.pct}%`, 'em 7 dias'],
              [String(p.apoiadores), 'apoiadores'],
              [String(p.diasRestantes), 'dias restantes'],
            ].map(([n, d]) => (
              <View key={d} style={{ flex: 1 }}>
                <Text style={s.num}>{n}</Text>
                <T style={type.small}>{d}</T>
              </View>
            ))}
          </View>
          <View style={s.ritmo}>
            <TrendingUp size={18} color={colors.green} />
            <T style={[type.small, { flex: 1, color: colors.green, fontSize: 13, lineHeight: 18 }]}>{p.ritmo}</T>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Postar atualização" variant="outline" icon={<PencilLine size={16} color={colors.ink} />} style={{ flex: 1, height: 48 }} onPress={postar} />
          <Button
            label="Divulgar"
            variant="outline"
            icon={<Share2 size={16} color={colors.ink} />}
            style={{ flex: 1, height: 48 }}
            onPress={() => router.push({ pathname: '/estudio', params: { tipo: 'projeto', id: p.id } })}
          />
        </View>

        <View style={s.cab}>
          <Eyebrow>Por recompensa</Eyebrow>
          <Text style={type.mono}>{total} apoios</Text>
        </View>
        <Card style={{ paddingHorizontal: 14 }}>
          {p.recompensas.map((r, i) => (
            <View key={r.nome}>
              {i > 0 ? <Divider /> : null}
              <View style={s.linha}>
                <T style={{ flex: 1 }}>{r.nome}</T>
                <Text style={type.mono}>
                  {r.apoios}
                  {r.restam ? ` · ${r.restam}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={s.cab}>
          <Eyebrow>Envios · começam após o prazo</Eyebrow>
          <Pressable onPress={() => Share.share({ message: p.envios.map((e) => `${e.nome} — ${e.recompensa}`).join('\n') })} hitSlop={8}>
            <Text style={s.link}>exportar etiquetas</Text>
          </Pressable>
        </View>
        <View>
          {p.envios.map((e, i) => (
            <View key={e.nome}>
              {i > 0 ? <Divider /> : null}
              <Pressable style={s.linha} onPress={() => avisar(`${e.nome} · ${e.status}`)}>
                <View style={{ flex: 1 }}>
                  <T style={type.title}>{e.nome}</T>
                  <T style={type.small}>{e.recompensa}</T>
                </View>
                <View style={[s.status, { backgroundColor: TOM[e.tom].bg }]}>
                  <Text style={[s.statusText, { color: TOM[e.tom].fg }]}>{e.status}</Text>
                </View>
              </Pressable>
            </View>
          ))}
          <T style={[type.small, { marginTop: 10 }]}>
            Cole o código dos Correios e o apoiador acompanha sozinho em Juntos › Projetos. Esta lista é o simulado do pós-meta.
          </T>
        </View>
      </ScrollView>
      <RodapeFixo bottom={insets.bottom}>
        <Button label="Atualização da semana" icon={<PencilLine size={18} color={colors.paper} />} onPress={postar} />
      </RodapeFixo>
      {aviso}
    </View>
  );
}

const s = StyleSheet.create({
  ver: { backgroundColor: colors.cream, borderRadius: radius.sm, paddingHorizontal: 12, height: 38, justifyContent: 'center', marginRight: 16 },
  verText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  valor: { fontFamily: fonts.serifBold, fontSize: 30, color: colors.ink },
  num: { fontFamily: fonts.monoBold, fontSize: 15, color: colors.ink },
  ritmo: { flexDirection: 'row', gap: 10, backgroundColor: colors.greenSoft, borderRadius: radius.md, padding: 12 },
  cab: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  link: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.accentDark },
  status: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, maxWidth: 170 },
  statusText: { fontFamily: fonts.sansSemi, fontSize: 11 },
});
