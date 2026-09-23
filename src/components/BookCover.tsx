import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Book } from '../data/types';
import { fonts, shadow } from '../theme';

/** Capa do livro. Sem imagem, desenha a capa com a cor e o título (como no protótipo). */
export function BookCover({
  book,
  width,
  showTitle = true,
  onPress,
  style,
}: {
  book: Pick<Book, 'title' | 'coverColor' | 'coverUrl'>;
  width: number;
  showTitle?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const height = Math.round(width * 1.48);
  const fontSize = Math.max(8, Math.round(width / 9));
  const light = isLight(book.coverColor);
  const body = (
    <View style={[s.cover, shadow.cover, { width, height, backgroundColor: book.coverColor, borderRadius: Math.max(3, width / 30) }, style]}>
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={StyleSheet.absoluteFill} />
      ) : showTitle ? (
        <Text
          numberOfLines={4}
          style={[s.title, { fontSize, lineHeight: fontSize * 1.18, padding: Math.max(5, width / 12), color: light ? '#3E332E' : '#FFFDF9' }]}
        >
          {book.title}
        </Text>
      ) : null}
      <View style={s.spine} />
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

function isLight(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

const s = StyleSheet.create({
  cover: { justifyContent: 'flex-end', overflow: 'hidden' },
  title: { fontFamily: fonts.serifBold },
  spine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: 'rgba(0,0,0,.18)' },
});
