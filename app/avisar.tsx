import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Sheet } from '../src/components/Sheet';
import { Button, Eyebrow, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { colors, fonts, radius, type } from '../src/theme';

/** Aviso do condutor para o clube, ou atualização de quem abriu o projeto. */
export default function Avisar() {
  const { tipo = 'clube', id = 'sarau', nome = '' } = useLocalSearchParams<{ tipo?: 'clube' | 'projeto'; id?: string; nome?: string }>();
  const projeto = tipo === 'projeto';
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [soApoiadores, setSoApoiadores] = useState(false);
  const pronto = titulo.trim() && texto.trim();

  const enviar = () => {
    if (!pronto) return;
    api.publicarAviso({ tipo, alvoId: id, titulo: titulo.trim(), texto: texto.trim(), soApoiadores: projeto ? soApoiadores : undefined });
    router.back();
  };

  return (
    <Sheet title={projeto ? 'Postar atualização' : 'Avisar o clube'} subtitle={nome}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
        <Eyebrow>Título</Eyebrow>
        <TextInput
          value={titulo}
          onChangeText={setTitulo}
          placeholder={projeto ? 'Provas de cor aprovadas' : 'Sessão de sábado mudou de lugar'}
          placeholderTextColor={colors.faint}
          style={s.input}
        />
        <Eyebrow style={{ marginTop: 6 }}>{projeto ? 'O que aconteceu' : 'Mensagem'}</Eyebrow>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          multiline
          placeholder={projeto ? 'Conte o andamento, com fotos se tiver.' : 'Chega como aviso para todo mundo do clube.'}
          placeholderTextColor={colors.faint}
          style={[s.input, { minHeight: 120, textAlignVertical: 'top', paddingTop: 12 }]}
        />
        {projeto ? (
          <View style={s.toggle}>
            <Switch value={soApoiadores} onValueChange={setSoApoiadores} trackColor={{ true: colors.accent, false: colors.line }} thumbColor={colors.paper} />
            <View>
              <T>Só para apoiadores</T>
              <T style={type.small}>quem não apoiou vê só o título</T>
            </View>
          </View>
        ) : (
          <T style={type.small}>Vai para a Caixa de cada membro e fica fixado no mural por 7 dias.</T>
        )}
        <Button label={projeto ? 'Publicar atualização' : 'Enviar aviso'} onPress={enviar} style={[{ marginTop: 8 }, !pronto ? { opacity: 0.5 } : null]} />
      </ScrollView>
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
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
});
