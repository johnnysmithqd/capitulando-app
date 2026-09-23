import { router, useLocalSearchParams } from 'expo-router';
import { BellOff, ChevronLeft, SendHorizontal } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Divider, Eyebrow, IconButton, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { useApi } from '../src/data/store';
import type { Message, Notice } from '../src/data/types';
import { colors, fonts, radius, type } from '../src/theme';

const TIPO: Record<Notice['kind'], { bg: string; fg: string; tag: string }> = {
  clube: { bg: '#F7E8B5', fg: '#6F5410', tag: 'clube' },
  desafio: { bg: '#F7E2D7', fg: '#98462A', tag: 'desafio' },
  projeto: { bg: '#CFE0D2', fg: '#3D5A41', tag: 'projeto' },
  pessoa: { bg: '#DCD3E8', fg: '#4E4573', tag: '' },
  casa: { bg: '#F3ECDF', fg: '#55463F', tag: 'a casa' },
};
const ORIGENS: [string, string][] = [
  ['tudo', 'Tudo'],
  ['clube', 'Clubes'],
  ['desafio', 'Desafios'],
  ['projeto', 'Projetos'],
  ['pessoa', 'Pessoas'],
];
const GRUPOS: [Notice['group'], string][] = [
  ['hoje', 'Hoje'],
  ['semana', 'Esta semana'],
  ['antes', 'Antes'],
];

export default function Caixa() {
  const params = useLocalSearchParams<{ conversa?: string }>();
  const insets = useSafeAreaInsets();
  const [conversa, setConversa] = useState(params.conversa ?? '');
  const [aba, setAba] = useState<'avisos' | 'mensagens'>(params.conversa ? 'mensagens' : 'avisos');
  const [lidos, setLidos] = useState<string[]>([]);
  const notices = useApi(api.getNotices);
  const convs = useApi(api.getConversations);

  const naoLidos = (notices ?? []).filter((n) => n.unread && !lidos.includes(n.id));
  const msgNovas = (convs ?? []).reduce((a, c) => a + (c.unread ? 1 : 0), 0);

  if (conversa) {
    const c = convs?.find((x) => x.id === conversa);
    return <Conversa id={conversa} name={c?.name ?? conversa} onBack={() => (params.conversa ? router.back() : setConversa(''))} />;
  }

  const marcarLidas = () => {
    const ids = naoLidos.map((n) => n.id);
    setLidos([...lidos, ...ids]);
    api.markNoticesRead(ids);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={s.head}>
        <IconButton label="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.ink} />
        </IconButton>
        <Text style={[type.h1, { flex: 1 }]}>Caixa</Text>
        {aba === 'avisos' && naoLidos.length ? (
          <Pressable onPress={marcarLidas} hitSlop={8}>
            <Text style={s.link}>Marcar lidas</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={s.tabs}>
        {(
          [
            ['avisos', 'Avisos', naoLidos.length],
            ['mensagens', 'Mensagens', msgNovas],
          ] as const
        ).map(([k, l, n]) => (
          <Pressable key={k} style={s.tab} onPress={() => setAba(k)}>
            <Text style={[s.tabText, aba === k && { color: colors.accent }]}>{l}</Text>
            {n ? (
              <View style={s.count}>
                <Text style={s.countText}>{n}</Text>
              </View>
            ) : null}
            {aba === k ? <View style={s.marker} /> : null}
          </Pressable>
        ))}
      </View>
      {aba === 'avisos' ? (
        <Avisos notices={notices ?? []} lidos={lidos} onRead={(id) => setLidos([...lidos, id])} />
      ) : (
        <FlatList
          data={convs ?? []}
          keyExtractor={(c) => c.id}
          ItemSeparatorComponent={Divider}
          renderItem={({ item: c }) => (
            <Pressable style={[s.conv, c.unread ? { backgroundColor: colors.creamSoft } : null]} onPress={() => setConversa(c.id)}>
              <View style={c.group ? { borderRadius: 12, overflow: 'hidden' } : null}>
                <Avatar initials={c.initials} bg={c.avatarBg} fg={c.avatarFg} size={46} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <T style={[type.title, { flex: 1 }]} numberOfLines={1}>
                    {c.name}
                  </T>
                  <Text style={type.mono}>{c.when}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <T numberOfLines={1} style={[type.small, { flex: 1, fontSize: 13 }, c.unread ? { color: colors.ink, fontFamily: fonts.sansBold } : null]}>
                    {c.preview}
                  </T>
                  {c.muted ? <BellOff size={14} color={colors.muted} /> : null}
                  {c.unread ? (
                    <View style={s.count}>
                      <Text style={s.countText}>{c.unread}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function Avisos({ notices, lidos, onRead }: { notices: Notice[]; lidos: string[]; onRead: (id: string) => void }) {
  const [origem, setOrigem] = useState('tudo');
  const visiveis = notices.filter((n) => origem === 'tudo' || n.kind === origem);
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 8 }}>
        {ORIGENS.map(([k, l]) => (
          <Pressable key={k} onPress={() => setOrigem(k)} style={[s.scope, origem === k && { backgroundColor: colors.ink }]}>
            <Text style={[s.scopeText, origem === k && { color: colors.creamSoft }]}>{l}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {visiveis.length === 0 ? <T style={[type.small, { textAlign: 'center', marginTop: 30 }]}>Nada por aqui.</T> : null}
      {GRUPOS.map(([g, titulo]) => {
        const itens = visiveis.filter((n) => n.group === g);
        if (!itens.length) return null;
        return (
          <View key={g}>
            <Eyebrow style={{ paddingHorizontal: 20, marginVertical: 8 }}>{titulo}</Eyebrow>
            {itens.map((n) => {
              const t = TIPO[n.kind];
              const novo = n.unread && !lidos.includes(n.id);
              return (
                <Pressable key={n.id} onPress={() => onRead(n.id)} style={[s.notice, novo && { backgroundColor: '#FDF8F4' }]}>
                  <View
                    style={[
                      s.avatar,
                      { backgroundColor: t.bg, borderRadius: n.kind === 'casa' || (n.kind === 'clube' && n.initials === 'CO') ? 12 : 22 },
                    ]}
                  >
                    <Text style={[s.avatarText, { color: t.fg }]}>{n.initials}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={s.noticeText}>
                      <Text style={{ fontFamily: fonts.sansBold }}>{n.who}</Text> {n.text}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={type.mono}>{n.when}</Text>
                      {t.tag ? (
                        <View style={[s.tag, { backgroundColor: t.bg }]}>
                          <Text style={[s.tagText, { color: t.fg }]}>{t.tag.toUpperCase()}</Text>
                        </View>
                      ) : null}
                    </View>
                    {n.action ? (
                      <Pressable style={s.action}>
                        <Text style={s.actionText}>{n.action}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  {novo ? <View style={s.dot} /> : <View style={{ width: 8 }} />}
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

function Conversa({ id, name, onBack }: { id: string; name: string; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const loaded = useApi(() => api.getMessages(id), [id]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [texto, setTexto] = useState('');
  useEffect(() => {
    if (loaded) setMsgs(loaded);
  }, [loaded]);
  const reversed = useMemo(() => [...msgs].reverse(), [msgs]);

  const enviar = () => {
    const t = texto.trim();
    if (!t) return;
    const now = new Date();
    setMsgs([...msgs, { id: String(Date.now()), text: t, mine: true, time: `${now.getHours()}h${String(now.getMinutes()).padStart(2, '0')}` }]);
    setTexto('');
    api.sendMessage(id, t);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, paddingTop: insets.top }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.head}>
        <IconButton label="Voltar" onPress={onBack}>
          <ChevronLeft size={24} color={colors.ink} />
        </IconButton>
        <Text style={[type.h2, { flex: 1 }]}>{name}</Text>
      </View>
      <Divider />
      <FlatList
        inverted
        data={reversed}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item: m }) => (
          <View style={{ alignItems: m.mine ? 'flex-end' : 'flex-start' }}>
            <View style={[s.bubble, m.mine ? s.mine : s.theirs]}>
              <Text style={[s.bubbleText, { color: m.mine ? colors.creamSoft : colors.ink }]}>{m.text}</Text>
            </View>
            <Text style={[type.mono, { fontSize: 10, marginTop: 3 }]}>{m.time}</Text>
          </View>
        )}
      />
      <View style={[s.composer, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escreva uma mensagem"
          placeholderTextColor={colors.faint}
          style={s.input}
          multiline
        />
        <Pressable
          onPress={enviar}
          style={[s.send, { backgroundColor: texto.trim() ? colors.accent : colors.lineStrong }]}
          accessibilityLabel="Enviar"
        >
          <SendHorizontal size={20} color={colors.paper} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingRight: 20, paddingVertical: 6 },
  link: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.accentDark },
  tabs: { flexDirection: 'row', gap: 24, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.accentLine },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  tabText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.muted },
  marker: { position: 'absolute', bottom: -8, left: '40%', width: 12, height: 12, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] },
  count: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.paper },
  scope: { borderRadius: radius.pill, paddingHorizontal: 14, height: 36, justifyContent: 'center', backgroundColor: colors.cream },
  scopeText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  notice: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 14 },
  noticeText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.ink },
  tag: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 1 },
  tagText: { fontFamily: fonts.monoBold, fontSize: 10, letterSpacing: 0.5 },
  action: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.accentLine, borderRadius: radius.sm, paddingHorizontal: 14, height: 36, justifyContent: 'center', backgroundColor: colors.paper },
  actionText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 6 },
  conv: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10 },
  mine: { backgroundColor: colors.ink, borderRadius: 16, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.card, borderRadius: 16, borderBottomLeftRadius: 4 },
  bubbleText: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
  input: { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 22, borderWidth: 1, borderColor: colors.accentLine, backgroundColor: colors.paper, paddingHorizontal: 16, paddingVertical: 10, fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
