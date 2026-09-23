import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Globe, Lock, Quote } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Sheet } from '../src/components/Sheet';
import { Button, Eyebrow, Segmented, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { useStore } from '../src/data/store';
import { colors, fonts, radius, type } from '../src/theme';

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export default function Detalhes() {
  const { id = 'memorias', terminei } = useLocalSearchParams<{ id?: string; terminei?: string }>();
  const store = useStore();
  const page = store.reading(id)?.page ?? 0;
  const [nota, setNota] = useState(0);
  const [resenha, setResenha] = useState('');
  const [spoiler, setSpoiler] = useState(true);
  const [tags, setTags] = useState(['literatura brasileira', 'clássico']);
  const [visib, setVisib] = useState<'publico' | 'eu'>('publico');
  const lastTap = useRef<{ i: number; t: number }>({ i: 0, t: 0 });
  const hoje = new Date();

  // Toque duplo na mesma estrela = meia estrela.
  const tapStar = (i: number) => {
    const now = Date.now();
    const dbl = lastTap.current.i === i && now - lastTap.current.t < 350;
    lastTap.current = { i, t: now };
    setNota(dbl ? i - 0.5 : i);
  };

  const salvar = () => {
    api.saveReadingDetails({ bookId: id, rating: nota || undefined, review: resenha || undefined, spoiler, tags, isPublic: visib === 'publico' });
    if (terminei) store.setStatus(id, 'lido');
    router.replace({ pathname: '/salvo', params: { id, tipo: terminei ? 'lido' : 'progresso' } });
  };

  return (
    <Sheet title="Mais detalhes" subtitle="tudo opcional" onBack={() => router.replace({ pathname: '/progresso', params: { id } })} full>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
        <View style={s.row}>
          <Eyebrow>Nota</Eyebrow>
          <Text style={s.mono}>{nota ? `${String(nota).replace('.', ',')} de 5` : 'Sem nota ainda'}</Text>
        </View>
        <View style={s.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Pressable key={i} onPress={() => tapStar(i)} hitSlop={6} accessibilityLabel={`${i} estrelas`}>
              <Text style={[s.star, { color: i <= nota || i - 0.5 === nota ? colors.gold : colors.lineStrong, opacity: i - 0.5 === nota ? 0.5 : 1 }]}>
                ★
              </Text>
            </Pressable>
          ))}
        </View>
        <T style={type.small}>Toque duas vezes na mesma estrela para meia estrela.</T>

        <Eyebrow style={s.gap}>Resenha</Eyebrow>
        <TextInput
          value={resenha}
          onChangeText={setResenha}
          placeholder="O que ficou com você?"
          placeholderTextColor={colors.faint}
          multiline
          style={s.input}
        />
        <View style={[s.row, { justifyContent: 'flex-start', gap: 12 }]}>
          <Switch
            value={spoiler}
            onValueChange={setSpoiler}
            trackColor={{ true: colors.accent, false: colors.lineStrong }}
            thumbColor={colors.paper}
          />
          <View>
            <T style={type.title}>Tem spoiler</T>
            <T style={type.small}>visível só para quem passou da p. {page}</T>
          </View>
        </View>

        <Eyebrow style={s.gap}>Citação</Eyebrow>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={s.outline}>
            <Quote size={18} color={colors.ink} />
            <Text style={s.outlineText}>Digitar</Text>
          </Pressable>
          <Pressable style={s.outline}>
            <Camera size={18} color={colors.ink} />
            <Text style={s.outlineText}>Foto da página</Text>
          </Pressable>
        </View>

        <Eyebrow style={s.gap}>Tags</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {tags.map((t) => (
            <Pressable key={t} style={s.tag} onPress={() => setTags(tags.filter((x) => x !== t))}>
              <Text style={s.tagText}>{t}</Text>
            </Pressable>
          ))}
          <Pressable style={[s.tag, { backgroundColor: colors.cream }]}>
            <Text style={[s.tagText, { color: colors.ink }]}>+ tag</Text>
          </Pressable>
        </View>

        <View style={[s.row, s.gap]}>
          <View>
            <Eyebrow>Data</Eyebrow>
            <T>
              hoje, {hoje.getDate()} de {MESES[hoje.getMonth()]}
            </T>
          </View>
          <Segmented
            value={visib}
            onChange={setVisib}
            items={[
              { key: 'publico', label: 'Público' },
              { key: 'eu', label: 'Só eu' },
            ]}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignSelf: 'flex-end' }}>
          {visib === 'publico' ? <Globe size={14} color={colors.muted} /> : <Lock size={14} color={colors.muted} />}
          <T style={type.small}>{visib === 'publico' ? 'aparece no seu perfil e no feed' : 'fica só no seu diário'}</T>
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20 }}>
        <Button label="Salvar" onPress={salvar} />
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gap: { marginTop: 10 },
  mono: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.inkSoft },
  stars: { flexDirection: 'row', gap: 18 },
  star: { fontSize: 34 },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.accentLine,
    borderRadius: radius.md,
    padding: 14,
    textAlignVertical: 'top',
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.paper,
  },
  outline: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentLine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.paper,
  },
  outlineText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink },
  tag: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 12, height: 32, justifyContent: 'center' },
  tagText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.accentDark },
});
