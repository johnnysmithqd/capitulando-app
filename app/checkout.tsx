import { router, useLocalSearchParams } from 'expo-router';
import { CreditCard, MapPin, QrCode, ReceiptText } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Sheet } from '../src/components/Sheet';
import { Button, Eyebrow, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { useApi } from '../src/data/store';
import { colors, fonts, radius, type } from '../src/theme';

/**
 * Pagar um apoio (projeto) ou uma cadeira (clube).
 * Parâmetros: tipo = apoio | clube, id = projeto ou clube, opcao = recompensa ou plano.
 */
export default function Checkout() {
  const { tipo = 'apoio', id = 'quadrinhos', opcao = '' } = useLocalSearchParams<{ tipo?: api.TipoCheckout; id?: string; opcao?: string }>();
  const ck = useApi(() => api.getCheckout(tipo, id, opcao), [tipo, id, opcao]);
  const [forma, setForma] = useState<api.FormaPagamento>('cartao');
  const [noFeed, setNoFeed] = useState(true);
  const [pagando, setPagando] = useState(false);

  const pagar = async () => {
    if (!ck || pagando) return;
    setPagando(true);
    await api.pagar({ tipo, alvoId: ck.alvoId, opcaoId: opcao, forma, mostrarNoFeed: noFeed });
    router.replace(tipo === 'apoio' ? `/apoio/${ck.alvoId}` : `/sala-clube/${ck.alvoId}`);
  };

  return (
    <Sheet title={ck?.titulo ?? 'Pagar'} subtitle={ck?.subtitulo}>
      {!ck ? (
        <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 8 }}>
          <View style={s.table}>
            {ck.linhas.map((l) => (
              <View key={l.label} style={[s.row, s.rowLine]}>
                <T style={{ flex: 1 }}>{l.label}</T>
                <Text style={s.mono}>{l.valor}</Text>
              </View>
            ))}
            <View style={[s.row, { backgroundColor: colors.cream }]}>
              <T style={[type.title, { flex: 1 }]}>Total</T>
              <Text style={[s.mono, { fontSize: 16 }]}>{ck.total}</Text>
            </View>
          </View>

          {!ck.gratis ? (
            <>
              <Eyebrow style={{ marginTop: 4 }}>Como pagar</Eyebrow>
              <Forma
                on={forma === 'cartao'}
                onPress={() => setForma('cartao')}
                icon={<CreditCard size={20} color={colors.ink} />}
                title="Cartão"
                sub={tipo === 'clube' ? 'renova sozinho todo mês' : 'cobrado só se a meta bater'}
              />
              <Forma
                on={forma === 'pix'}
                onPress={() => setForma('pix')}
                icon={<QrCode size={20} color={colors.ink} />}
                title="Pix"
                sub={tipo === 'clube' ? 'pago a cada mês · sem pagar, perde o acesso' : 'devolvido em até 7 dias se a meta não bater'}
              />
            </>
          ) : null}

          {ck.endereco ? (
            <>
              <Eyebrow style={{ marginTop: 4 }}>Entregar em</Eyebrow>
              <View style={s.endereco}>
                <MapPin size={20} color={colors.ink} />
                <T style={{ flex: 1 }}>{ck.endereco}</T>
                <Text style={s.link}>trocar</Text>
              </View>
            </>
          ) : null}

          <View style={s.taxa}>
            <ReceiptText size={18} color={colors.inkSoft} />
            <T style={[type.small, { flex: 1, color: colors.inkSoft, fontSize: 13, lineHeight: 18 }]}>{ck.taxaTxt}</T>
          </View>

          {tipo === 'apoio' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Switch value={noFeed} onValueChange={setNoFeed} trackColor={{ true: colors.accent, false: colors.line }} thumbColor={colors.paper} />
              <View>
                <T style={type.title}>Contar no feed que apoiei</T>
                <T style={type.small}>sem mostrar o valor</T>
              </View>
            </View>
          ) : null}

          <Button label={pagando ? 'Processando…' : ck.botao} onPress={pagar} style={pagando ? { opacity: 0.7 } : null} />
          {!ck.gratis ? (
            <T style={[type.small, { textAlign: 'center' }]}>Pix abre o QR code aqui mesmo; a confirmação chega em segundos.</T>
          ) : null}
        </ScrollView>
      )}
    </Sheet>
  );
}

function Forma({ on, onPress, icon, title, sub }: { on: boolean; onPress: () => void; icon: ReactNode; title: string; sub: string }) {
  return (
    <Pressable onPress={onPress} style={[s.forma, on && s.formaOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
      {icon}
      <View style={{ flex: 1 }}>
        <T style={type.title}>{title}</T>
        <T style={type.small}>{sub}</T>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  table: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', backgroundColor: colors.paper },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.line },
  mono: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.ink },
  forma: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.card },
  formaOn: { borderWidth: 2, borderColor: colors.accent, backgroundColor: '#FDF8F4' },
  endereco: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.card },
  link: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.accentDark },
  taxa: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: colors.cream },
});
