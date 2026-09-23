import { router } from 'expo-router';
import { Armchair, BookCheck, Flag, NotebookPen, PencilLine, Play, Quote, Search, Sparkles, Timer } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '../src/components/BookCover';
import { Sheet } from '../src/components/Sheet';
import { Chip, Eyebrow, T } from '../src/components/ui';
import { useStore } from '../src/data/store';
import { colors, fonts, radius, type } from '../src/theme';

export default function Registrar() {
  const { byStatus } = useStore();
  const lendo = byStatus('lendo');
  const atual = lendo[0]?.book;

  return (
    <Sheet title="O que você quer fazer?">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 8 }}>
        <Pressable style={s.session} onPress={() => atual && router.replace({ pathname: '/progresso', params: { id: atual.id } })}>
          <Timer size={22} color={colors.paper} />
          <View style={{ flex: 1 }}>
            <Text style={s.sessionTitle}>Iniciar sessão de leitura</Text>
            <Text style={s.sessionSub}>{atual ? `${atual.title.split(' ').slice(0, 2).join(' ')} · conta minutos e páginas` : 'conta minutos e páginas'}</Text>
          </View>
          <Play size={22} color={colors.paper} />
        </Pressable>

        <View style={s.pages}>
          <View style={{ flexDirection: 'row' }}>
            {lendo.slice(0, 3).map(({ book }, i) => (
              <View key={book.id} style={{ marginLeft: i ? -12 : 0 }}>
                <BookCover book={book} width={40} />
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <T style={type.title}>Anotar páginas</T>
            <T style={type.small}>{lendo.length} livros em curso</T>
          </View>
          <Pressable
            style={s.pagesBtn}
            onPress={() => atual && router.replace({ pathname: '/progresso', params: { id: atual.id } })}
          >
            <Text style={s.pagesBtnText}>+ páginas</Text>
          </Pressable>
        </View>

        <Eyebrow style={{ marginTop: 6 }}>Publicar</Eyebrow>
        <View style={s.grid}>
          <Tile icon={<PencilLine size={20} color={colors.ink} />} title="Escrever um post" sub="texto livre para quem te segue" />
          <Tile icon={<Quote size={20} color={colors.ink} />} title="Salvar uma citação" sub="vira card no Estúdio" />
          <Tile icon={<NotebookPen size={20} color={colors.ink} />} title="Entrada no diário" sub="só para você, se quiser" />
          <Tile
            icon={<BookCheck size={20} color={colors.ink} />}
            title="Terminei um livro"
            sub="nota, resenha e estante"
            onPress={() => atual && router.replace({ pathname: '/detalhes', params: { id: atual.id, terminei: '1' } })}
          />
        </View>

        <Eyebrow style={{ marginTop: 6 }}>Começar algo</Eyebrow>
        <View style={s.chips}>
          <Chip label="Livro novo" icon={<Search size={16} color={colors.ink} />} onPress={() => router.replace('/busca')} />
          <Chip label="Clube" icon={<Armchair size={16} color={colors.ink} />} />
          <Chip label="Projeto" icon={<Sparkles size={16} color={colors.ink} />} />
          <Chip label="Desafio" icon={<Flag size={16} color={colors.ink} />} />
        </View>
      </ScrollView>
    </Sheet>
  );
}

function Tile({ icon, title, sub, onPress }: { icon: ReactNode; title: string; sub: string; onPress?: () => void }) {
  return (
    <Pressable style={s.tile} onPress={onPress}>
      {icon}
      <T style={[type.title, { marginTop: 8 }]}>{title}</T>
      <T style={type.small}>{sub}</T>
    </Pressable>
  );
}

const s = StyleSheet.create({
  session: { backgroundColor: colors.accent, borderRadius: radius.md, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  sessionTitle: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.paper },
  sessionSub: { fontFamily: fonts.sans, fontSize: 13, color: colors.accentSoft, marginTop: 2 },
  pages: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14, backgroundColor: colors.creamSoft },
  pagesBtn: { backgroundColor: colors.accentSoft, borderRadius: radius.sm, paddingHorizontal: 14, height: 38, justifyContent: 'center' },
  pagesBtnText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.accentDark },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '48.8%', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14, backgroundColor: colors.creamSoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
