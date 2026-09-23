import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, CalendarDays, Check, CheckCheck, Library, Quote } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '../src/components/Sheet';
import * as api from '../src/data/api';
import type { ConteudoCard } from '../src/data/juntos/estudio';
import { useApi } from '../src/data/store';
import { colors, fonts } from '../src/theme';

const ICONE: Record<ConteudoCard, ComponentType<{ size?: number; color?: string }>> = {
  progresso: BookOpen,
  citacao: Quote,
  terminado: CheckCheck,
  retrospectiva: CalendarDays,
  estante: Library,
};

/** Folha "O que virar card", aberta pelo botão de conteúdo do Estúdio. */
export default function Conteudo() {
  const { atual = 'progresso', tipo, id } = useLocalSearchParams<{ atual?: string; tipo?: string; id?: string }>();
  const opcoes = useApi(api.getOpcoesConteudoCard);

  const escolher = (c: ConteudoCard) => {
    // Volta para o Estúdio já aberto, trocando o conteúdo (os templates mudam junto).
    router.dismissTo({
      pathname: '/estudio',
      params: { conteudo: c, ...(tipo ? { tipo } : null), ...(id ? { id } : null) },
    });
  };

  return (
    <Sheet title="O que virar card" subtitle="os templates mudam junto; paleta, fonte e fundo continuam seus" showClose={false}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
        {(opcoes ?? []).map((o) => {
          const Icon = ICONE[o.id];
          return (
            <Pressable key={o.id} onPress={() => escolher(o.id)} style={s.row}>
              <View style={[s.icone, { backgroundColor: o.fundoIcone }]}>
                <View style={{ opacity: 0.8 }}>
                  <Icon size={20} color={colors.ink} />
                </View>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={s.nome}>{o.nome}</Text>
                <Text style={s.desc}>{o.desc}</Text>
              </View>
              {atual === o.id ? <Check size={20} color={colors.ink} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  icone: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nome: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 20, color: colors.ink },
  desc: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.muted },
});
