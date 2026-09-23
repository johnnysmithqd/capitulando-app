import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, CreditCard, FolderInput, LifeBuoy, Repeat, ScrollText, Sparkles, Wallet } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Card, Divider, Eyebrow, IconButton, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { useApi } from '../src/data/store';
import { colors, fonts, radius, type } from '../src/theme';

export default function Config() {
  const insets = useSafeAreaInsets();
  const me = useApi(api.getMe);
  const loaded = useApi(api.getSettings);
  const [st, setSt] = useState<api.Settings | null>(null);
  useEffect(() => {
    if (loaded) setSt(loaded);
  }, [loaded]);

  const update = (patch: Partial<api.Settings>) => {
    if (!st) return;
    const next = { ...st, ...patch };
    setSt(next);
    api.saveSettings(next);
  };
  const notify = (k: keyof api.Settings['notify'], v: boolean) => st && update({ notify: { ...st.notify, [k]: v } });

  const sair = () =>
    Alert.alert('Sair da conta?', 'Suas leituras continuam salvas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => api.logout().then(() => router.replace('/onboarding')) },
    ]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={s.head}>
        <IconButton label="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.ink} />
        </IconButton>
        <Text style={type.h1}>Configurações</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: insets.bottom + 30 }}>
        {me ? (
          <Pressable onPress={() => router.push('/editar-perfil')}>
            <Card style={[s.row, { padding: 14 }]}>
              <Avatar initials={me.initials} bg={me.avatarBg} fg={me.avatarFg} size={48} />
              <View style={{ flex: 1 }}>
                <T style={type.title}>{me.name}</T>
                <T style={type.small}>@{me.handle} · editar nome, bio e favoritos</T>
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </Card>
          </Pressable>
        ) : null}

        {st ? (
          <>
            <Eyebrow style={s.section}>Quem vê o quê</Eyebrow>
            <Card style={s.group}>
              <Toggle title="Perfil público" sub="qualquer pessoa vê suas estantes e listas" value={st.publicProfile} onChange={(v) => update({ publicProfile: v })} />
              <View style={{ paddingVertical: 10, gap: 8 }}>
                <T style={type.title}>Quem vê meu diário</T>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(
                    [
                      ['todos', 'Todo mundo'],
                      ['seguidores', 'Seguidores'],
                      ['eu', 'Só eu'],
                    ] as const
                  ).map(([k, l]) => {
                    const on = st.diaryVisibility === k;
                    return (
                      <Pressable key={k} onPress={() => update({ diaryVisibility: k })} style={[s.opt, on && s.optOn]}>
                        <Text style={[s.optText, on && { color: colors.accentDark }]}>{l}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <T style={type.small}>Quem você aceitou vê as datas e as resenhas; o resto vê só as estantes.</T>
              </View>
              <Toggle title="Véu de spoiler automático" sub="borra resenhas de quem não terminou o livro" value={st.spoilerVeil} onChange={(v) => update({ spoilerVeil: v })} />
            </Card>

            <Eyebrow style={s.section}>Avisos</Eyebrow>
            <Card style={s.group}>
              <Toggle title="Clubes" sub="mural, sessões e respostas no seu capítulo" value={st.notify.clubes} onChange={(v) => notify('clubes', v)} />
              <Divider />
              <Toggle title="Desafios" sub="quando alguém te ultrapassa" value={st.notify.desafios} onChange={(v) => notify('desafios', v)} />
              <Divider />
              <Toggle title="Projetos que apoio" sub="atualizações e envios" value={st.notify.projetos} onChange={(v) => notify('projetos', v)} />
              <Divider />
              <Toggle title="Resumo semanal" sub="domingo de manhã, por e-mail" value={st.notify.resumo} onChange={(v) => notify('resumo', v)} />
            </Card>
          </>
        ) : null}

        <Eyebrow style={s.section}>A casa</Eyebrow>
        <Card style={s.group}>
          <Link icon={<Repeat size={20} color={colors.ink} />} label="Assinaturas" value="2 ativas" onPress={() => router.push('/assinaturas')} />
          <Divider />
          <Link icon={<CreditCard size={20} color={colors.ink} />} label="Pagamentos" value="Cartão" onPress={() => router.push({ pathname: '/assinaturas', params: { aba: 'pagamentos' } })} />
          <Divider />
          <Link icon={<FolderInput size={20} color={colors.ink} />} label="Importar estante" value="Skoob" onPress={() => router.push({ pathname: '/onboarding', params: { passo: '4' } })} />
          <Divider />
          <Link icon={<Wallet size={20} color={colors.ink} />} label="Recebimentos" value="1 clube" onPress={() => router.push({ pathname: '/painel-clube/[id]', params: { id: 'sarau', aba: 'pagamentos' } })} />
          <Divider />
          <Link icon={<Sparkles size={20} color={colors.ink} />} label="Refazer boas-vindas" onPress={() => router.push('/onboarding')} />
          <Divider />
          <Link icon={<LifeBuoy size={20} color={colors.ink} />} label="Ajuda" onPress={() => Linking.openURL('https://capitulando.com/ajuda')} />
          <Divider />
          <Link icon={<ScrollText size={20} color={colors.ink} />} label="Termos e privacidade" onPress={() => Linking.openURL('https://capitulando.com/termos')} />
        </Card>

        <Pressable style={s.logout} onPress={sair}>
          <Text style={s.logoutText}>Sair da conta</Text>
        </Pressable>
        <T style={[type.small, { textAlign: 'center' }]}>Capitulando 1.0.0 · feito no Recife</T>
      </ScrollView>
    </View>
  );
}

function Toggle({ title, sub, value, onChange }: { title: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={[s.row, { paddingVertical: 10 }]}>
      <View style={{ flex: 1 }}>
        <T style={type.title}>{title}</T>
        <T style={type.small}>{sub}</T>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.accent, false: colors.line }} thumbColor={colors.paper} />
    </View>
  );
}

function Link({ icon, label, value, onPress }: { icon: ReactNode; label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable style={[s.row, { paddingVertical: 14 }]} onPress={onPress}>
      {icon}
      <T style={[type.title, { flex: 1, fontFamily: fonts.sansSemi }]}>{label}</T>
      {value ? <T style={type.small}>{value}</T> : null}
      <ChevronRight size={18} color={colors.muted} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  section: { marginTop: 12 },
  group: { paddingHorizontal: 14, paddingVertical: 4 },
  opt: { flex: 1, height: 40, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  optOn: { backgroundColor: colors.accentSoft, borderColor: colors.accentLine },
  optText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  logout: { height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accentLine, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  logoutText: { fontFamily: fonts.sansSemi, fontSize: 15, color: '#8C332B' },
});
