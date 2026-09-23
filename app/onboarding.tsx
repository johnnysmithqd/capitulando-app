import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, ContactRound, Info, Lightbulb, Minus, Plus, Upload } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '../src/components/BookCover';
import { precisaDoAparelho } from '../src/components/menu';
import { Avatar, Button, Divider, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { useApi } from '../src/data/store';
import { colors, fonts, radius, shadow, type } from '../src/theme';

const TOTAL = 6;

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const data = useApi(api.getOnboarding);
  const { passo } = useLocalSearchParams<{ passo?: string }>();
  const [step, setStep] = useState(Math.min(TOTAL, Math.max(1, Number(passo) || 1)));
  const [genres, setGenres] = useState<string[]>(['Romance', 'Literatura brasileira', 'Não ficção']);
  const [ratings, setRatings] = useState<Record<string, number>>({ torto: 5, casmurro: 5, capitaes: 4 });
  const [follows, setFollows] = useState<string[]>(['camila', 'luiza']);
  const [goal, setGoal] = useState(40);

  const next = () => setStep((n) => Math.min(TOTAL, n + 1));
  const finish = (withGoal: boolean) => {
    api.finishOnboarding({ genres, ratings, follows, yearGoal: withGoal ? goal : undefined });
    router.replace('/');
  };
  const rated = Object.keys(ratings).length;

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}>
      {/* Progresso */}
      <View style={s.top}>
        {step > 1 ? (
          <Pressable onPress={() => setStep(step - 1)} hitSlop={10} accessibilityLabel="Voltar">
            <ChevronLeft size={24} color={colors.ink} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <View style={s.track}>
          <View style={[s.fill, { width: `${(step / TOTAL) * 100}%` }]} />
        </View>
        {step > 1 ? (
          <Pressable onPress={step === TOTAL ? () => finish(false) : next} hitSlop={10}>
            <Text style={s.skip}>Pular</Text>
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {step === 1 && <Boas onNext={next} />}

      {step === 2 && (
        <Passo title="O que você gosta de ler?" sub="Escolha pelo menos três. Dá para mudar depois.">
          <View style={s.wrap}>
            {data?.genres.map((g) => {
              const on = genres.includes(g);
              return (
                <Pressable
                  key={g}
                  onPress={() => setGenres(on ? genres.filter((x) => x !== g) : [...genres, g])}
                  style={[s.genre, on && { backgroundColor: colors.accentSoft, borderColor: colors.accentLine }]}
                >
                  <Text style={[s.genreText, on && { color: colors.accentDark }]}>{on ? `✓ ${g}` : g}</Text>
                </Pressable>
              );
            })}
          </View>
        </Passo>
      )}

      {step === 3 && data && (
        <Passo title="Já leu algum destes?" sub="Toque na capa para marcar como lido e dê uma nota. Cinco bastam para a casa te conhecer.">
          <RateGrid books={data.books} ratings={ratings} onChange={setRatings} />
        </Passo>
      )}

      {step === 4 && (
        <Passo title="Já tem estante em outro lugar?" sub="Traga o histórico: lidos, notas e datas. Nada é apagado de lá.">
          {[
            ['Sk', 'Skoob', 'exporte o CSV em Configurações › Meus dados'],
            ['Gr', 'Goodreads', 'My Books › Import and export › Export'],
          ].map(([ini, n, d]) => (
            <Pressable key={n} style={s.import} onPress={() => precisaDoAparelho(`Importar do ${n}`)}>
              <View style={s.importIcon}>
                <Text style={type.title}>{ini}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <T style={type.title}>{n}</T>
                <T style={type.small}>{d}</T>
              </View>
              <Upload size={20} color={colors.ink} />
            </Pressable>
          ))}
          <View style={s.info}>
            <Info size={18} color={colors.ink} />
            <T style={[type.small, { flex: 1, color: colors.inkSoft }]}>
              A importação roda em segundo plano. Você já pode usar o app; a casa avisa quando a estante estiver completa.
            </T>
          </View>
        </Passo>
      )}

      {step === 5 && data && (
        <Passo title="Quem você quer por perto?" sub="Sugestões pelas suas notas e pela sua cidade. O app funciona mesmo sem seguir ninguém.">
          {data.people.map((p) => {
            const on = follows.includes(p.id);
            return (
              <View key={p.id}>
                <View style={s.person}>
                  <Avatar initials={p.initials} bg={p.avatarBg} fg={p.avatarFg} size={44} />
                  <View style={{ flex: 1 }}>
                    <T style={type.title}>{p.name}</T>
                    <T style={type.small}>{p.why}</T>
                  </View>
                  <Pressable
                    onPress={() => setFollows(on ? follows.filter((x) => x !== p.id) : [...follows, p.id])}
                    style={[s.follow, on ? { backgroundColor: colors.cream } : { backgroundColor: colors.accent }]}
                  >
                    <Text style={[s.followText, { color: on ? colors.ink : colors.paper }]}>{on ? 'Seguindo' : 'Seguir'}</Text>
                  </Pressable>
                </View>
                <Divider />
              </View>
            );
          })}
          <Pressable style={s.person} onPress={() => precisaDoAparelho('Encontrar contatos')}>
            <View style={[s.importIcon, { borderRadius: 22, width: 44, height: 44 }]}>
              <ContactRound size={20} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <T style={type.title}>Encontrar contatos</T>
              <T style={type.small}>quem da sua agenda já está na casa</T>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
        </Passo>
      )}

      {step === 6 && (
        <Passo title={`Uma meta para ${new Date().getFullYear()}?`} sub="Opcional. Serve para você, não para a casa — dá para mudar quando quiser.">
          <View style={s.goalRow}>
            <Pressable style={s.goalBtn} onPress={() => setGoal(Math.max(1, goal - 1))} accessibilityLabel="Menos">
              <Minus size={22} color={colors.ink} />
            </Pressable>
            <Text style={s.goal}>{goal}</Text>
            <Pressable style={s.goalBtn} onPress={() => setGoal(goal + 1)} accessibilityLabel="Mais">
              <Plus size={22} color={colors.ink} />
            </Pressable>
          </View>
          <T style={{ textAlign: 'center', color: colors.inkSoft }}>
            livros no ano · cerca de <Text style={{ fontFamily: fonts.monoBold }}>{(goal / 12).toFixed(1).replace('.', ',')}</Text> por mês
          </T>
          <View style={[s.info, { backgroundColor: colors.cream, marginTop: 30 }]}>
            <Lightbulb size={18} color={colors.ink} />
            <T style={[type.small, { flex: 1, color: colors.inkSoft }]}>
              Quem lê com amigos costuma preferir meta em páginas. Você cria um desafio assim em Juntos, a qualquer hora.
            </T>
          </View>
        </Passo>
      )}

      {/* Rodapé */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {step === 2 && <Button label={`Continuar · ${genres.length} escolhidos`} onPress={next} />}
        {step === 3 && (
          <Button
            variant={rated >= 5 ? 'primary' : 'outline'}
            label={rated >= 5 ? `Continuar com ${rated} livros` : `Continuar com ${rated} livros · faltam ${5 - rated} para recomendar bem`}
            onPress={next}
          />
        )}
        {step === 4 && (
          <Pressable onPress={next} style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={s.plain}>Começar do zero</Text>
          </Pressable>
        )}
        {step === 5 && <Button label={`Continuar · seguindo ${follows.length}`} onPress={next} />}
        {step === 6 && (
          <>
            <Button label="Entrar na casa" onPress={() => finish(true)} />
            <Pressable onPress={() => finish(false)} style={{ alignItems: 'center', paddingVertical: 6 }}>
              <Text style={s.plain}>Sem meta por enquanto</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

function Passo({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, gap: 12 }}>
      <Text style={s.h}>{title}</Text>
      <T style={{ color: colors.inkSoft, lineHeight: 21, marginBottom: 8 }}>{sub}</T>
      {children}
    </ScrollView>
  );
}

function Boas({ onNext }: { onNext: () => void }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'flex-end', gap: 12 }}>
      <View style={s.fan}>
        <View style={[s.fanCover, { backgroundColor: '#7F3A22', transform: [{ rotate: '-8deg' }, { translateX: -70 }] }]} />
        <View style={[s.fanCover, { backgroundColor: colors.green, transform: [{ rotate: '6deg' }, { translateX: 70 }] }]} />
        <View style={[s.fanCover, { backgroundColor: '#4E4573', height: 170, width: 106 }]} />
      </View>
      <Text style={s.brand}>Capitulando</Text>
      <Text style={s.hero}>Puxe a cadeira. Aqui a gente lê junto.</Text>
      <T style={{ textAlign: 'center', color: colors.inkSoft, lineHeight: 21 }}>
        Suas estantes, seu diário, seus amigos e os clubes da casa — tudo a partir do que você lê.
      </T>
      <View style={{ gap: 10, marginTop: 40 }}>
        <Button label="Continuar com Apple" onPress={onNext} style={{ backgroundColor: colors.dark }} />
        <Button label="Continuar com Google" variant="outline" onPress={onNext} />
        <Pressable onPress={onNext} style={{ alignItems: 'center', paddingVertical: 10 }}>
          <Text style={s.plain}>Usar e-mail</Text>
        </Pressable>
      </View>
      <T style={[type.small, { textAlign: 'center', marginBottom: 8 }]}>
        Ao continuar você aceita as <Text style={{ textDecorationLine: 'underline' }}>regras da casa</Text>. Sem letra miúda.
      </T>
    </View>
  );
}

function RateGrid({
  books,
  ratings,
  onChange,
}: {
  books: { id: string; title: string; coverColor: string }[];
  ratings: Record<string, number>;
  onChange: (r: Record<string, number>) => void;
}) {
  const { width } = useWindowDimensions();
  const w = (width - 40 - 12) / 2;
  const set = (id: string, n: number) => onChange({ ...ratings, [id]: n });
  const toggle = (id: string) => {
    const next = { ...ratings };
    if (next[id]) delete next[id];
    else next[id] = 5;
    onChange(next);
  };
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {books.map((b) => {
        const n = ratings[b.id] ?? 0;
        return (
          <View key={b.id} style={{ width: w, gap: 8, marginBottom: 8 }}>
            <Pressable onPress={() => toggle(b.id)} style={[s.rateCover, n ? { borderColor: colors.accent } : null]}>
              <BookCover book={b} width={w - 6} />
            </Pressable>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', opacity: n ? 1 : 0.35 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} onPress={() => set(b.id, i)} hitSlop={4}>
                  <Text style={{ fontSize: 18, color: i <= n ? colors.gold : colors.lineStrong }}>★</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, height: 32 },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.accent },
  skip: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.muted },
  h: { fontFamily: fonts.serifBold, fontSize: 24, lineHeight: 30, color: colors.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genre: { borderWidth: 1, borderColor: colors.lineStrong, borderRadius: radius.pill, paddingHorizontal: 16, height: 42, justifyContent: 'center', backgroundColor: colors.paper },
  genreText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink },
  rateCover: { borderRadius: 8, borderWidth: 3, borderColor: 'transparent', alignItems: 'center' },
  import: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: colors.accentLine, borderRadius: radius.md, padding: 14, backgroundColor: colors.paper },
  importIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  info: { flexDirection: 'row', gap: 10, backgroundColor: colors.lilacSoft, borderRadius: radius.md, padding: 14, marginTop: 10 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  follow: { borderRadius: radius.sm, paddingHorizontal: 16, height: 38, justifyContent: 'center', minWidth: 96, alignItems: 'center' },
  followText: { fontFamily: fonts.sansBold, fontSize: 13 },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40, marginTop: 40, marginBottom: 20 },
  goalBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: colors.accentLine, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  goal: { fontFamily: fonts.monoBold, fontSize: 64, color: colors.ink, minWidth: 100, textAlign: 'center' },
  plain: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.inkSoft },
  fan: { height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  fanCover: { position: 'absolute', width: 96, height: 150, borderRadius: 4, ...shadow.cover },
  brand: { fontFamily: fonts.serifBold, fontSize: 22, color: colors.accentDark, textAlign: 'center' },
  hero: { fontFamily: fonts.serifBold, fontSize: 30, lineHeight: 36, color: colors.ink, textAlign: 'center' },
});
