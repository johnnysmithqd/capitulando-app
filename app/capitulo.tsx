import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Clock, Download, EyeOff, Headphones, Lock, MapPin, Send, Users, Video } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bolinha, CapaMini, DataBox, TopoTitulo, useAviso } from '../src/components/clube';
import { Card, IconButton } from '../src/components/ui';
import * as api from '../src/data/api';
import type { CapituloClube, MensagemClube, SessaoClube } from '../src/data/juntos/clubes';
import { colors, fonts, type } from '../src/theme';

// Capítulo do clube (uma frente de encontros): sessões e conversa.
// Parâmetros: ?clube=cortico&cap=vozalta&n=11 (n = capítulo do livro aberto na conversa).
export default function Capitulo() {
  const { clube = 'cortico', cap, n } = useLocalSearchParams<{ clube?: string; cap?: string; n?: string }>();
  const insets = useSafeAreaInsets();
  const [d, setD] = useState<CapituloClube | null>(null);
  const [sub, setSub] = useState<'sessoes' | 'leitura'>('sessoes');
  const [aviso, avisar] = useAviso();
  const presencaAntes = useRef<string | undefined>(undefined);
  const carregou = useRef(false);

  // Recarrega ao voltar da folha de presença para mostrar "Confirmado".
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      api.getCapituloClube(clube, cap).then((r) => {
        if (!vivo) return;
        const s0 = r.arco.sessoes[0];
        if (carregou.current && r.presenca && r.presenca !== 'nao' && r.presenca !== presencaAntes.current && s0) {
          const [dia, hora] = s0.h.split(' · ');
          avisar(`Presença confirmada · ${dia}, ${s0.d} de ${s0.m.toLowerCase()}, ${hora}`);
        }
        presencaAntes.current = r.presenca;
        carregou.current = true;
        setD(r);
      });
      return () => {
        vivo = false;
      };
    }, [clube, cap, avisar]),
  );

  if (!d) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const { arco } = d;
  const livroId = arco.livroId ?? 'memorias';
  const abrirProgresso = () => router.push({ pathname: '/progresso', params: { id: livroId } });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopoTitulo
        top={insets.top}
        titulo={arco.nome}
        sub={d.clube.nome}
        direita={
          <IconButton label="Convidar" onPress={() => router.push({ pathname: '/convidar', params: { clube: d.clube.id } })} style={{ width: 44, height: 44 }}>
            <Users size={22} color={colors.ink} />
          </IconButton>
        }
      />

      <Card style={s.livro}>
        <CapaMini cor={arco.cor} titulo={arco.livro} fontSize={8} />
        <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
          <Text numberOfLines={1} style={[type.title, { fontSize: 14, lineHeight: 18 }]}>
            {arco.livro}
          </Text>
          <Text style={type.small}>{arco.autor}</Text>
          <View style={s.trilho}>
            <View style={[s.barra, { width: `${arco.grupo}%`, backgroundColor: colors.lineStrong }]} />
            <View style={[s.barra, { width: `${arco.voce}%`, backgroundColor: colors.accent }]} />
          </View>
          <Text style={type.small}>{arco.ritmo}</Text>
        </View>
        <Pressable onPress={abrirProgresso} style={s.paginas} hitSlop={4}>
          <Text style={s.paginasText}>+ páginas</Text>
        </Pressable>
      </Card>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 14 }}>
        <Pilula label={`Sessões · ${arco.sessoes.length}`} on={sub === 'sessoes'} onPress={() => setSub('sessoes')} />
        <Pilula label={arco.conversaTxt} on={sub === 'leitura'} onPress={() => setSub('leitura')} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 + insets.bottom }} keyboardShouldPersistTaps="handled">
        {sub === 'sessoes' ? (
          <Sessoes d={d} />
        ) : arco.fio === 'livro' ? (
          <FioLivro d={d} abertoInicial={Number(n) || d.meuCap} abrirProgresso={abrirProgresso} />
        ) : (
          <FioSimples d={d} />
        )}
      </ScrollView>
      {aviso}
    </View>
  );
}

function Pilula({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.pilula, { backgroundColor: on ? colors.accentSoft : colors.cream }]}>
      <Text style={[s.pilulaText, { color: on ? colors.accentDark : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

function IconeSessao({ tipo }: { tipo: SessaoClube['tipo'] }) {
  const p = { size: 14, color: colors.accentDark };
  if (tipo === 'video') return <Video {...p} />;
  if (tipo === 'local') return <MapPin {...p} />;
  return <Headphones {...p} />;
}

function Sessoes({ d }: { d: CapituloClube }) {
  const [prox, ...depois] = d.arco.sessoes;
  const confirmado = d.presenca === 'vou' || d.presenca === 'talvez';
  const rsvp = () => router.push({ pathname: '/rsvp', params: { clube: d.clube.id } });
  if (!prox) return null;
  return (
    <View style={{ gap: 16 }}>
      <View style={s.prox}>
        <Text style={[type.eyebrow, { color: colors.accentDark }]}>Próxima sessão</Text>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <DataBox
            d={prox.d}
            m={prox.m}
            w={60}
            dSize={26}
            bg={confirmado ? colors.greenSoft : colors.accentSoft}
            fg={confirmado ? colors.green : colors.accentDark}
          />
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Text style={s.proxTitulo}>{prox.titulo}</Text>
            <Text style={s.sub13}>{prox.h}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <IconeSessao tipo={prox.tipo} />
              <Text style={[s.sub13, { color: colors.accentDark, fontFamily: fonts.sansSemi, flex: 1 }]}>{prox.lugar}</Text>
            </View>
            <Text style={type.small}>{prox.confirmaram} confirmaram</Text>
          </View>
        </View>
        {prox.arquivos?.length ? (
          <View style={{ gap: 6 }}>
            {prox.arquivos.map((f) => (
              <View key={f.nome} style={s.arquivo}>
                <Download size={16} color={colors.muted} />
                <Text numberOfLines={1} style={[s.sub13, { flex: 1, fontFamily: fonts.sansSemi, color: colors.ink }]}>
                  {f.nome}
                </Text>
                <Text style={s.mono11}>{f.tamanho}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {prox.enquete ? (
          <View style={{ gap: 6 }}>
            <Text style={[type.body, { fontFamily: fonts.sansSemi }]}>{prox.enquete.pergunta}</Text>
            {prox.enquete.opcoes.map((o, i) => (
              <View key={o.t} style={s.opcao}>
                <View style={[s.barra, { borderRadius: 0, width: `${o.pct}%`, backgroundColor: i === 0 ? colors.accentSoft : colors.line }]} />
                <Text style={[s.opcaoText, { flex: 1 }]}>{o.t}</Text>
                <Text style={[s.mono12, { color: i === 0 ? colors.accentDark : colors.muted }]}>{o.pct}%</Text>
              </View>
            ))}
            <Text style={type.small}>{prox.enquete.meta}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={rsvp}
          style={[
            s.btnPresenca,
            confirmado ? { backgroundColor: colors.greenSoft, borderColor: colors.greenMint } : { backgroundColor: colors.card, borderColor: colors.lineStrong },
          ]}
        >
          <Text style={[s.btnPresencaText, { color: confirmado ? colors.green : colors.ink }]}>{confirmado ? 'Confirmado' : 'Confirmar presença'}</Text>
        </Pressable>
        <Text style={[type.small, { textAlign: 'center' }]}>O link abre 10 minutos antes. Gravação fica 30 dias.</Text>
      </View>

      {depois.length ? (
        <View style={{ gap: 2 }}>
          <Text style={[type.eyebrow, { paddingBottom: 6 }]}>{depois.length === 1 ? 'Depois dessa' : `Depois dessa · ${depois.length}`}</Text>
          {depois.map((x) => (
            <Pressable key={x.d + x.m} onPress={rsvp} style={s.depois}>
              <View style={{ width: 44, alignItems: 'center' }}>
                <Text style={{ fontFamily: fonts.serif, fontSize: 17, lineHeight: 19, color: colors.inkSoft }}>{x.d}</Text>
                <Text style={[s.mono10, { color: colors.faint }]}>{x.m}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text style={s.depoisTitulo}>{x.titulo}</Text>
                <Text style={type.small}>
                  {x.h} · {x.lugar}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.faint} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable onPress={() => router.push({ pathname: '/sala-clube/[id]', params: { id: d.clube.id, aba: 'acervo' } })} style={s.linkAcervo}>
        <Clock size={16} color={colors.accentDark} />
        <Text style={[s.sub13, { fontSize: 14, fontFamily: fonts.sansSemi, color: colors.accentDark }]}>O que já passou está no acervo</Text>
      </Pressable>
    </View>
  );
}

function Mensagem({ m, ocultar }: { m: MensagemClube; ocultar?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <Bolinha p={m.autor} />
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={s.nome13}>{m.autor.nome}</Text>
          {m.conduz ? (
            <View style={s.conduz}>
              <Text style={s.conduzText}>conduz</Text>
            </View>
          ) : null}
          <Text style={[type.small, { color: colors.faint }]}>{m.quando}</Text>
        </View>
        {ocultar ? (
          <View style={s.spoiler}>
            <EyeOff size={14} color={colors.inkSoft} />
            <Text style={[type.small, { flex: 1, fontFamily: fonts.sansSemi, color: colors.inkSoft }]}>Fala do cap. 12 do livro · visível para quem passou dele</Text>
          </View>
        ) : (
          <Text style={type.body}>{m.txt}</Text>
        )}
        <Text style={s.respostas}>{m.respostas ? `${m.respostas} ${m.respostas === 1 ? 'resposta' : 'respostas'}` : 'Responder'}</Text>
      </View>
    </View>
  );
}

function Compositor({ placeholder, onSend, style }: { placeholder: string; onSend: (t: string) => void; style?: StyleProp<ViewStyle> }) {
  const [txt, setTxt] = useState('');
  const enviar = () => {
    const t = txt.trim();
    if (!t) return;
    onSend(t);
    setTxt('');
  };
  return (
    <View style={[{ flexDirection: 'row', gap: 8 }, style]}>
      <TextInput
        value={txt}
        onChangeText={setTxt}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        style={s.input}
        onSubmitEditing={enviar}
        returnKeyType="send"
      />
      <Pressable onPress={enviar} accessibilityLabel="Enviar" style={s.enviar}>
        <Send size={18} color={colors.accentDark} />
      </Pressable>
    </View>
  );
}

function useConversa(inicial: MensagemClube[], d: CapituloClube) {
  const [lista, setLista] = useState(inicial);
  const enviar = (t: string) => api.comentarCapitulo(d.clube.id, d.arco.id, t).then((m) => setLista((l) => [...l, m]));
  return [lista, enviar] as const;
}

function FioSimples({ d }: { d: CapituloClube }) {
  const [lista, enviar] = useConversa(d.arco.discussao ?? [], d);
  return (
    <View style={{ gap: 14 }}>
      {lista.map((m) => (
        <Mensagem key={m.id} m={m} />
      ))}
      <Compositor placeholder={d.arco.composer ?? 'Escrever'} onSend={enviar} />
    </View>
  );
}

function FioLivro({ d, abertoInicial, abrirProgresso }: { d: CapituloClube; abertoInicial: number; abrirProgresso: () => void }) {
  const [aberto, setAberto] = useState(abertoInicial);
  const [lista, enviar] = useConversa(d.discussaoLivro, d);
  const meu = d.meuCap;
  return (
    <View style={{ gap: 8 }}>
      {d.capitulosLivro.map((c) => {
        const passado = c.n < meu;
        const atual = c.n === meu;
        const futuro = c.n > meu;
        const open = aberto === c.n;
        return (
          <View key={c.n} style={[s.capBox, { backgroundColor: atual ? colors.accentSoft : colors.card }]}>
            <Pressable onPress={() => setAberto(open ? 0 : c.n)} style={s.capHead}>
              <View style={[s.capNum, { backgroundColor: passado ? colors.greenSoft : atual ? colors.accent : colors.cream }]}>
                <Text style={[s.mono12, { color: passado ? colors.green : atual ? colors.paper : colors.faint }]}>{c.n}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[type.title, { fontSize: 14, lineHeight: 18, color: atual ? colors.accentDark : futuro ? colors.faint : colors.ink }]}>{c.titulo}</Text>
                <Text style={type.small}>
                  {c.sem} · {c.lidos} de {d.totalMembros} leram
                </Text>
              </View>
              {futuro ? <Lock size={16} color={colors.faint} /> : null}
              {passado ? <Text style={[s.mono12, { color: colors.muted }]}>{c.msgs}</Text> : null}
              {atual ? <Text style={[s.mono12, { color: colors.accentDark }]}>{c.msgs} novas</Text> : null}
            </Pressable>
            {open && futuro ? (
              <View style={s.capCorpo}>
                <View style={s.gated}>
                  <EyeOff size={18} color={colors.inkSoft} />
                  <Text style={[type.small, { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: fonts.sansSemi, color: colors.ink }]}>
                    Abre quando você registrar o cap. {c.n} do livro. Quem já leu está conversando lá dentro.
                  </Text>
                </View>
                <Pressable onPress={abrirProgresso} style={s.btnJaLi}>
                  <Text style={[s.btnPresencaText, { fontSize: 14 }]}>Já li · atualizar progresso</Text>
                </Pressable>
              </View>
            ) : null}
            {open && atual ? (
              <View style={[s.capCorpo, { gap: 10 }]}>
                {lista.map((m) => (
                  <Mensagem key={m.id} m={m} ocultar={m.spoiler} />
                ))}
                <Compositor placeholder={`Comentar o cap. ${c.n} do livro`} onSend={enviar} style={{ marginTop: 4 }} />
              </View>
            ) : null}
            {open && passado ? (
              <View style={s.capCorpo}>
                <Text style={s.sub13}>{c.msgs} mensagens · discussão encerrada, leitura livre.</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  sub13: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  nome13: { fontFamily: fonts.sansBold, fontSize: 13, lineHeight: 16, color: colors.ink },
  mono10: { fontFamily: fonts.monoBold, fontSize: 10, lineHeight: 14, letterSpacing: 1.2 },
  mono11: { fontFamily: fonts.monoBold, fontSize: 11, lineHeight: 16, color: colors.muted },
  mono12: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16 },
  livro: { marginHorizontal: 20, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', gap: 12, alignItems: 'center' },
  trilho: { height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' },
  barra: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  paginas: { height: 40, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  paginasText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.accentDark },
  pilula: { height: 38, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  pilulaText: { fontFamily: fonts.sansSemi, fontSize: 13 },
  prox: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FDF8F4',
    borderWidth: 1,
    borderColor: colors.accentLine,
    shadowColor: colors.ink,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  proxTitulo: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 24, color: colors.ink },
  arquivo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.cream },
  opcao: { height: 40, borderRadius: 10, backgroundColor: colors.cream, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  opcaoText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink },
  btnPresenca: { height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  btnPresencaText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
  depois: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  depoisTitulo: { fontFamily: fonts.sansSemi, fontSize: 14, lineHeight: 19, color: colors.ink },
  linkAcervo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  conduz: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999, backgroundColor: colors.goldSoft },
  conduzText: { fontFamily: fonts.sansBold, fontSize: 10, lineHeight: 14, color: colors.gold },
  spoiler: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  respostas: { fontFamily: fonts.sansSemi, fontSize: 12, lineHeight: 16, color: colors.accentDark },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
  },
  enviar: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  capBox: { borderRadius: 12, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  capHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  capNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  capCorpo: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  gated: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.cream },
  btnJaLi: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
});
