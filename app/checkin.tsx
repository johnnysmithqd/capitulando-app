import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BookCover } from '../src/components/BookCover';
import { avisarCheckin, juntosStyles as j } from '../src/components/juntos';
import { Sheet } from '../src/components/Sheet';
import { Slider } from '../src/components/Slider';
import * as api from '../src/data/api';
import { useApi, useStore } from '../src/data/store';
import { colors, fonts, radius } from '../src/theme';

export default function CheckinDesafio() {
  const { desafio: desafioId = 'setembro' } = useLocalSearchParams<{ desafio?: string }>();
  const store = useStore();
  const d = useApi(() => api.getDesafio(desafioId), [desafioId]);
  const bookId = d?.base.bookId ?? 'memorias';
  const book = store.book(bookId);
  const inicial = store.reading(bookId)?.page ?? 0;
  const [pagina, setPagina] = useState<number | null>(null);
  const [foto, setFoto] = useState(false);
  const [frase, setFrase] = useState('');

  const atual = pagina ?? inicial;
  const base = d?.base.pagina ?? inicial;
  // páginas que contam para o desafio desde o último registro de referência
  const delta = Math.max(0, atual - base);
  const setP = (p: number) => setPagina(Math.max(0, Math.min(book.pages, p)));

  const salvar = () => {
    store.setPage(bookId, atual);
    api.sendCheckin({ desafioId, bookId, pagina: atual, paginasNoDesafio: delta, frase: frase.trim() || undefined, foto });
    router.back();
    avisarCheckin({ desafioId, paginas: delta, frase: frase.trim() || undefined });
  };

  return (
    <Sheet showClose={false}>
      <View style={s.head}>
        <BookCover book={book} width={40} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={j.rowTitle} numberOfLines={1}>
            {book.title}
          </Text>
          <Text style={j.rowSub}>o check-in é o seu registro de sempre</Text>
        </View>
        <Pressable onPress={() => router.back()} style={j.topBtn} accessibilityLabel="Fechar">
          <X size={22} color={colors.inkSoft} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 16 }}>
        <View style={s.numRow}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={s.num}>{atual}</Text>
            <Text style={s.de}>de {book.pages}</Text>
          </View>
          <View style={s.delta}>
            <Text style={s.deltaText}>+{delta} no desafio</Text>
          </View>
        </View>

        <Slider value={atual} max={book.pages} onChange={setP} />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[10, 25, 50].map((n) => (
            <Pressable key={n} onPress={() => setP(atual + n)} style={s.mais}>
              <Text style={s.maisText}>+{n}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => setFoto(!foto)} style={[s.foto, foto && { borderStyle: 'solid', borderColor: colors.accentLine, backgroundColor: colors.accentSoft }]}>
          {foto ? <Check size={16} color={colors.accentDark} /> : <Camera size={16} color={colors.inkSoft} />}
          <Text style={[s.fotoText, foto && { color: colors.accentDark }]}>{foto ? 'Foto anexada ao mural' : 'Foto para o mural (opcional)'}</Text>
        </Pressable>

        <TextInput
          value={frase}
          onChangeText={setFrase}
          placeholder="Uma frase para o grupo? (opcional)"
          placeholderTextColor={colors.faint}
          multiline
          style={s.frase}
        />

        <Pressable onPress={salvar} style={({ pressed }) => [j.primary, { marginTop: 4 }, pressed && { opacity: 0.9 }]}>
          <Text style={j.primaryText}>Salvar e publicar no mural</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 20, paddingRight: 12, paddingBottom: 4 },
  numRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  num: { fontFamily: fonts.monoBold, fontSize: 56, lineHeight: 60, color: colors.ink, letterSpacing: -1 },
  de: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 20, color: colors.muted },
  delta: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.greenSoft, marginBottom: 8 },
  deltaText: { fontFamily: fonts.monoBold, fontSize: 13, lineHeight: 16, color: colors.green },
  mais: { flex: 1, height: 44, borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  maisText: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.ink },
  foto: {
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fotoText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.inkSoft },
  frase: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    backgroundColor: colors.card,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    textAlignVertical: 'top',
  },
});
