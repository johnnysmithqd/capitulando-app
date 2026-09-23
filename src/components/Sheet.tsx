import { router } from 'expo-router';
import { X, ChevronLeft } from 'lucide-react-native';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Dimensions, Easing, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';

const H = Dimensions.get('window').height;

/**
 * Folha que sobe de baixo, usada nas rotas modais (registrar, progresso...).
 * A rota precisa ser registrada com presentation "transparentModal" no _layout.
 */
export function Sheet({
  children,
  title,
  subtitle,
  onBack,
  showClose = true,
  full,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showClose?: boolean;
  full?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(H)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [y, fade]);

  const close = () => {
    Animated.parallel([
      Animated.timing(y, { toValue: H, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => router.back());
  };

  return (
    <KeyboardAvoidingView style={StyleSheet.absoluteFill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View style={[StyleSheet.absoluteFill, s.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Fechar" />
      </Animated.View>
      <Animated.View
        style={[
          s.panel,
          { paddingBottom: insets.bottom + 16, transform: [{ translateY: y }] },
          full && { top: insets.top + 20 },
        ]}
      >
        <View style={s.grabber} />
        {title || onBack || showClose ? (
          <View style={s.head}>
            {onBack ? (
              <View style={s.side}>
                <Pressable onPress={onBack} hitSlop={10} accessibilityLabel="Voltar">
                  <ChevronLeft size={24} color={colors.ink} />
                </Pressable>
              </View>
            ) : null}
            <View style={{ flex: 1, alignItems: onBack ? 'center' : 'flex-start' }}>
              {title ? <Text style={[s.title, onBack ? { textAlign: 'center' } : null]}>{title}</Text> : null}
              {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
            </View>
            <View style={[s.side, { alignItems: 'flex-end' }]}>
              {showClose ? (
                <Pressable onPress={close} hitSlop={10} accessibilityLabel="Fechar">
                  <X size={22} color={colors.ink} />
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
        {children}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(62,51,46,.45)' },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '92%',
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.lineStrong, marginBottom: 10 },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, minHeight: 32 },
  side: { width: 32 },
  title: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, color: colors.ink },
  subtitle: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
});
