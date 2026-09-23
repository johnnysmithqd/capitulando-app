import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { ChipGroup } from '../src/components/ChipGroup';
import { Sheet } from '../src/components/Sheet';
import { Button, Eyebrow, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { colors, fonts, radius, type } from '../src/theme';

export default function NovaEnquete() {
  const { clube = 'sarau', pessoas = '18' } = useLocalSearchParams<{ clube?: string; pessoas?: string }>();
  const [pergunta, setPergunta] = useState('');
  const [opcoes, setOpcoes] = useState(['', '']);
  const [multipla, setMultipla] = useState(false);
  const [onde, setOnde] = useState<api.NovaEnquete['onde']>('clube');
  const [encerra, setEncerra] = useState<api.NovaEnquete['encerra']>('1s');
  const [anonima, setAnonima] = useState(true);

  const validas = opcoes.map((o) => o.trim()).filter(Boolean);
  const pronta = pergunta.trim().length > 0 && validas.length >= 2;

  const setOpcao = (i: number, v: string) => {
    const next = [...opcoes];
    next[i] = v;
    // Sempre deixa um campo vazio no fim para a próxima opção.
    if (i === next.length - 1 && v.trim()) next.push('');
    setOpcoes(next);
  };

  const publicar = () => {
    if (!pronta) return;
    api.criarEnquete({ clubeId: clube, pergunta: pergunta.trim(), opcoes: validas, multipla, onde, encerra, anonima });
    router.back();
  };

  return (
    <Sheet title="Nova enquete" full>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
        <Eyebrow>Pergunta</Eyebrow>
        <TextInput value={pergunta} onChangeText={setPergunta} placeholder="Onde fazemos o sarau de outubro?" placeholderTextColor={colors.faint} style={s.input} />

        <Eyebrow style={{ marginTop: 6 }}>Opções · mínimo 2</Eyebrow>
        {opcoes.map((o, i) => {
          const ultima = i === opcoes.length - 1 && i >= 2;
          return (
            <View key={i} style={[s.input, s.opcao, ultima && s.opcaoNova]}>
              <TextInput
                value={o}
                onChangeText={(v) => setOpcao(i, v)}
                placeholder={ultima ? 'Outra opção' : `Opção ${i + 1}`}
                placeholderTextColor={colors.faint}
                style={s.opcaoText}
              />
              {opcoes.length > 2 && !ultima ? (
                <Pressable onPress={() => setOpcoes(opcoes.filter((_, j) => j !== i))} hitSlop={8} accessibilityLabel="Remover opção">
                  <X size={16} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>
          );
        })}

        <View style={s.toggle}>
          <Switch value={multipla} onValueChange={setMultipla} trackColor={{ true: colors.accent, false: colors.line }} thumbColor={colors.paper} />
          <T>Permitir mais de uma resposta</T>
        </View>

        <ChipGroup
          label="Onde ela vive"
          value={onde}
          onChange={setOnde}
          options={[
            ['clube', 'Solta, no clube'],
            ['sessao', 'Dentro de uma sessão'],
          ]}
        />
        <T style={type.small}>
          {onde === 'clube' ? 'Aparece fixada no topo do clube para todo mundo até encerrar.' : 'Aparece na página da próxima sessão e encerra quando ela começa.'}
        </T>

        <ChipGroup
          label="Encerra"
          value={encerra}
          onChange={setEncerra}
          options={[
            ['3d', 'Em 3 dias'],
            ['1s', 'Em 1 semana'],
            ['sessao', 'Na sessão'],
            ['manual', 'Eu encerro'],
          ]}
        />

        <View style={s.toggle}>
          <Switch value={anonima} onValueChange={setAnonima} trackColor={{ true: colors.accent, false: colors.line }} thumbColor={colors.paper} />
          <View>
            <T>Voto anônimo</T>
            <T style={type.small}>só a contagem fica visível</T>
          </View>
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20 }}>
        <Button label={`Publicar para ${pessoas} pessoas`} onPress={publicar} style={!pronta ? { opacity: 0.5 } : null} />
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentLine,
    backgroundColor: colors.creamSoft,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
  },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  opcaoNova: { borderStyle: 'dashed' },
  opcaoText: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.ink, paddingVertical: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
});
