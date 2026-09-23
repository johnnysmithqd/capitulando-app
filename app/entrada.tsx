import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays, Pencil, Share2, X } from 'lucide-react-native';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '../src/components/BookCover';
import { Sheet } from '../src/components/Sheet';
import { Button, Stars, T, Tag } from '../src/components/ui';
import * as api from '../src/data/api';
import { useApi } from '../src/data/store';
import { colors, fonts, radius, type } from '../src/theme';

/** Entrada do diário (abre ao tocar num item da aba Diário do perfil). */
export default function Entrada() {
  const { id = 'solitaria' } = useLocalSearchParams<{ id?: string }>();
  const e = useApi(() => api.getDiaryEntry(id), [id]);

  return (
    <Sheet showClose={false}>
      {e ? (
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <BookCover book={e.book} width={54} showTitle={false} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.title}>{e.book.title}</Text>
              <T style={type.small}>{e.book.author}</T>
              <Stars value={e.rating} size={14} color={colors.ink} />
            </View>
            <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Fechar">
              <X size={22} color={colors.ink} />
            </Pressable>
          </View>

          <View style={s.date}>
            <CalendarDays size={18} color={colors.ink} />
            <View style={{ flex: 1 }}>
              <T style={[type.body, { fontFamily: fonts.sansMedium }]}>Terminei em {e.finished}</T>
              <T style={type.small}>{e.days} dias de leitura</T>
            </View>
            <Text style={s.link}>editar</Text>
          </View>

          {e.kind ? <Tag label={e.kind} /> : null}
          {e.text ? <Text style={s.text}>{e.text}</Text> : null}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              label="Editar"
              variant="outline"
              icon={<Pencil size={16} color={colors.ink} />}
              style={{ flex: 1, height: 46 }}
              onPress={() => router.replace({ pathname: '/detalhes', params: { id: e.book.id } })}
            />
            <Button
              label="Compartilhar"
              variant="outline"
              icon={<Share2 size={16} color={colors.ink} />}
              style={{ flex: 1, height: 46 }}
              onPress={() => Share.share({ message: `${e.book.title}, de ${e.book.author}: ${e.text ?? ''}` })}
            />
          </View>
          <Pressable style={s.page} onPress={() => router.replace(`/livro/${e.book.id}`)}>
            <Text style={s.pageText}>Ver a página do livro</Text>
          </Pressable>
        </View>
      ) : null}
    </Sheet>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
  date: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 12, backgroundColor: colors.paper },
  link: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.accentDark },
  text: { fontFamily: fonts.serifRegular, fontSize: 17, lineHeight: 26, color: colors.ink },
  page: { height: 46, borderRadius: radius.md, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  pageText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink },
});
