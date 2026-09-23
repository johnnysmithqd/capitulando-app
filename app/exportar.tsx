import { router, useLocalSearchParams } from 'expo-router';
import { AtSign, Camera, ChevronRight, Download, MessageCircle, Video } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '../src/components/Sheet';
import * as api from '../src/data/api';
import type { ConteudoCard, DestinoCard, EnvioCard } from '../src/data/juntos/estudio';
import { colors, fonts } from '../src/theme';

const DESTINOS: { id: DestinoCard; nome: string; para: string; Icon: ComponentType<{ size?: number; color?: string }> }[] = [
  { id: 'stories', nome: 'Instagram Stories', para: 'os Stories', Icon: Camera },
  { id: 'whatsapp', nome: 'WhatsApp', para: 'o WhatsApp', Icon: MessageCircle },
  { id: 'tiktok', nome: 'TikTok', para: 'o TikTok', Icon: Video },
  { id: 'x', nome: 'X', para: 'o X', Icon: AtSign },
  { id: 'imagem', nome: 'Salvar imagem', para: 'suas fotos', Icon: Download },
];

const FORMATOS: EnvioCard['formato'][] = ['9:16', '1:1', '4:5'];

/** Folha "Enviar para", aberta pelo Compartilhar do Estúdio. */
export default function Exportar() {
  const p = useLocalSearchParams<{ formato?: string; conteudo?: string; template?: string; texto?: string }>();
  const formato = FORMATOS.find((f) => f === p.formato) ?? '9:16';
  const texto = p.texto || 'Lendo no Capitulando. #Capitulando\ncapitulando.com';

  const enviar = async (d: (typeof DESTINOS)[number]) => {
    // Sem captura de tela no app: o card sai como texto + link pelo compartilhamento do sistema.
    try {
      const r = await Share.share({ message: texto });
      if (r.action === Share.dismissedAction) return;
    } catch {
      return;
    }
    api.registrarEnvioCard({ destino: d.id, formato, conteudo: (p.conteudo ?? 'progresso') as ConteudoCard, template: p.template ?? 'editorial' });
    router.back();
    Alert.alert('Card enviado para ' + d.para);
  };

  return (
    <Sheet title="Enviar para" subtitle={`formato ${formato} · marca d'água e link do livro incluídos`}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
        {DESTINOS.map((d) => (
          <Pressable key={d.id} onPress={() => enviar(d)} style={s.row}>
            <View style={s.icone}>
              <View style={{ opacity: 0.8 }}>
                <d.Icon size={20} color={colors.ink} />
              </View>
            </View>
            <Text style={s.nome}>{d.nome}</Text>
            <View style={{ opacity: 0.45 }}>
              <ChevronRight size={20} color={colors.ink} />
            </View>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 56,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  icone: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  nome: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 20, color: colors.ink },
});
