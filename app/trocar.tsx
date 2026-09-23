import { router, useLocalSearchParams } from 'expo-router';
import { Bookmark, BookOpen, Check, Pause, Trash2 } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '../src/components/Sheet';
import { Divider } from '../src/components/ui';
import { useStore } from '../src/data/store';
import { colors, fonts, radius, type } from '../src/theme';

/** Trocar o status de um livro que já está na estante (abre pelo botão "Lendo" da página do livro). */
export default function Trocar() {
  const { id = 'memorias' } = useLocalSearchParams<{ id?: string }>();
  const store = useStore();
  const book = store.book(id);
  const r = store.reading(id);

  return (
    <Sheet showClose={false}>
      <View style={{ paddingHorizontal: 20, gap: 4 }}>
        <Text style={[type.h2, { marginBottom: 10 }]}>{book.title}</Text>
        <Opcao
          on={r?.status === 'lendo'}
          icon={<BookOpen size={20} color={r?.status === 'lendo' ? colors.accentDark : colors.ink} />}
          label="Lendo · atualizar página"
          right={r?.status === 'lendo' ? `p. ${r.page}` : undefined}
          onPress={() => {
            if (r?.status !== 'lendo') store.setStatus(id, 'lendo');
            router.replace({ pathname: '/progresso', params: { id } });
          }}
        />
        <Opcao
          on={r?.status === 'lido'}
          icon={<Check size={20} color={colors.ink} />}
          label="Terminei"
          onPress={() => router.replace({ pathname: '/detalhes', params: { id, terminei: '1' } })}
        />
        <Opcao
          on={r?.status === 'quero-ler'}
          icon={<Bookmark size={20} color={colors.ink} />}
          label="Quero ler"
          onPress={() => {
            store.setStatus(id, 'quero-ler');
            router.back();
          }}
        />
        <Opcao
          on={r?.status === 'abandonei'}
          icon={<Pause size={20} color={colors.ink} />}
          label="Abandonei"
          onPress={() => {
            store.setStatus(id, 'abandonei');
            router.back();
          }}
        />
        <Divider style={{ marginVertical: 6 }} />
        <Opcao
          icon={<Trash2 size={20} color="#8C332B" />}
          label="Tirar das estantes"
          danger
          onPress={() => {
            store.removeReading(id);
            router.back();
          }}
        />
      </View>
    </Sheet>
  );
}

function Opcao({ icon, label, right, on, danger, onPress }: { icon: ReactNode; label: string; right?: string; on?: boolean; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.opcao, on && { backgroundColor: colors.accentSoft }]}>
      {icon}
      <Text style={[s.label, on && { color: colors.accentDark }, danger && { color: '#8C332B' }]}>{label}</Text>
      {right ? <Text style={[type.mono, { color: colors.accentDark }]}>{right}</Text> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, height: 56, borderRadius: radius.md },
  label: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink },
});
