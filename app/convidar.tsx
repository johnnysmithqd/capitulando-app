import { router, useLocalSearchParams } from 'expo-router';
import { MessageCircle, Users, X } from 'lucide-react-native';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { juntosStyles as j } from '../src/components/juntos';
import { Sheet } from '../src/components/Sheet';
import * as api from '../src/data/api';
import { useApi } from '../src/data/store';
import { colors, fonts } from '../src/theme';

export default function ConvidarDesafio() {
  const { desafio: desafioId = 'setembro' } = useLocalSearchParams<{ desafio?: string }>();
  const d = useApi(() => api.getDesafio(desafioId), [desafioId]);
  const link = d?.link ?? '';

  const copiar = () => {
    api.inviteToChallenge(desafioId, 'link');
    router.back();
    Alert.alert('Link copiado', link);
  };
  const whatsapp = () => {
    api.inviteToChallenge(desafioId, 'whatsapp');
    Share.share({ message: `Bora ler junto? ${d?.nome ?? ''} no Capitulando: https://${link}` });
  };
  const seguindo = () => {
    api.inviteToChallenge(desafioId, 'seguindo');
    router.back();
    Alert.alert('Convite enviado', 'Quem você escolher recebe o convite na caixa de avisos.');
  };

  return (
    <Sheet showClose={false}>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Text style={s.titulo}>Chamar para o desafio</Text>
          <Text style={j.rowSub}>quem entrar pelo link começa do zero hoje</Text>
        </View>
        <Pressable onPress={() => router.back()} style={j.topBtn} accessibilityLabel="Fechar">
          <X size={22} color={colors.inkSoft} />
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 10 }}>
        <View style={s.link}>
          <Text style={j.linkText} numberOfLines={1}>
            {link}
          </Text>
          <Pressable onPress={copiar} style={j.copiar} hitSlop={4}>
            <Text style={j.copiarText}>Copiar</Text>
          </Pressable>
        </View>
        <Pressable onPress={whatsapp} style={({ pressed }) => [j.primary, pressed && { opacity: 0.9 }]}>
          <MessageCircle size={18} color={colors.paper} />
          <Text style={j.primaryText}>Mandar no WhatsApp</Text>
        </Pressable>
        <Pressable onPress={seguindo} style={({ pressed }) => [j.outline, pressed && { opacity: 0.9 }]}>
          <Users size={18} color={colors.inkSoft} />
          <Text style={j.outlineText}>Escolher quem eu sigo</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 12, paddingBottom: 6 },
  titulo: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 28, color: colors.ink },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingLeft: 14,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
});
