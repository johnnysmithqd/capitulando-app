import { router, useLocalSearchParams } from 'expo-router';
import { Bell, BookOpen, ChevronRight, Heart, Info, MessageCircle, Pencil, Plus, Target, Video } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AbasFita, Bolinha, CapaMini, Filtros, TopoTitulo, useAviso } from '../../src/components/clube';
import { Card, IconButton } from '../../src/components/ui';
import * as api from '../../src/data/api';
import type { IconeArco, SalaClube } from '../../src/data/juntos/clubes';
import { useApi } from '../../src/data/store';
import { colors, fonts, type } from '../../src/theme';

type Aba = 'capitulos' | 'mural' | 'acervo' | 'enquetes' | 'pessoas';
const ABAS: { id: Aba; label: string }[] = [
  { id: 'capitulos', label: 'Capítulos' },
  { id: 'mural', label: 'Mural' },
  { id: 'acervo', label: 'Acervo' },
  { id: 'enquetes', label: 'Enquetes' },
  { id: 'pessoas', label: 'Pessoas' },
];

function IconeDoArco({ icone, size, color = colors.accentDark }: { icone: IconeArco; size: number; color?: string }) {
  if (icone === 'filme') return <Video size={size} color={color} />;
  if (icone === 'jogo') return <Target size={size} color={color} />;
  if (icone === 'poesia') return <Pencil size={size} color={color} />;
  return <BookOpen size={size} color={color} />;
}

// Sala do clube (visão de membro). Aceita ?aba=mural|acervo|enquetes|pessoas.
export default function SalaClubeTela() {
  const { id = 'cortico', aba: abaInicial } = useLocalSearchParams<{ id?: string; aba?: string }>();
  const insets = useSafeAreaInsets();
  const sala = useApi(() => api.getSalaClube(id), [id]);
  const [aba, setAba] = useState<Aba>(ABAS.some((a) => a.id === abaInicial) ? (abaInicial as Aba) : 'capitulos');
  const [aviso, avisar] = useAviso();

  if (!sala) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopoTitulo
        top={insets.top}
        titulo={sala.nome}
        sub={sala.sub}
        direita={
          <IconButton label="Sobre o clube" onPress={() => router.push(`/clube/${sala.id}`)} style={{ width: 44, height: 44 }}>
            <Info size={22} color={colors.ink} />
          </IconButton>
        }
      />
      <AbasFita itens={ABAS} value={aba} onChange={setAba} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 40 + insets.bottom }}>
        {aba === 'capitulos' && <Capitulos sala={sala} />}
        {aba === 'mural' && <Mural sala={sala} avisar={avisar} />}
        {aba === 'acervo' && <Acervo sala={sala} />}
        {aba === 'enquetes' && <Enquetes sala={sala} avisar={avisar} />}
        {aba === 'pessoas' && <Pessoas sala={sala} />}
      </ScrollView>
      {aviso}
    </View>
  );
}

function Capitulos({ sala }: { sala: SalaClube }) {
  return (
    <View style={{ gap: 10 }}>
      {sala.arcos.map((ar) => (
        <Pressable key={ar.id} onPress={() => router.push({ pathname: '/capitulo', params: { clube: sala.id, cap: ar.id } })}>
          <Card style={s.arco}>
            <CapaMini cor={ar.cor} titulo={ar.livro} />
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text numberOfLines={1} style={type.title}>
                {ar.nome}
              </Text>
              <Text numberOfLines={1} style={s.sub13}>
                {ar.livro} · {ar.autor}
              </Text>
              <Text style={s.monoAccent}>{ar.prox}</Text>
            </View>
            <ChevronRight size={20} color={colors.faint} />
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

function Mural({ sala, avisar }: { sala: SalaClube; avisar: (m: string) => void }) {
  const [filtro, setFiltro] = useState<'tudo' | 'aviso' | 'comunidade'>('tudo');
  const n = sala.muralContagem;
  const posts = sala.mural.filter((m) => filtro === 'tudo' || m.tipo === filtro);
  return (
    <View style={{ gap: 12 }}>
      <Filtros
        itens={[
          { id: 'tudo', label: `Tudo · ${n.tudo}` },
          { id: 'aviso', label: `Avisos · ${n.aviso}` },
          { id: 'comunidade', label: `Comunidade · ${n.comunidade}` },
        ]}
        value={filtro}
        onChange={setFiltro}
      />
      {posts.map((m) => (
        <View key={m.id} style={s.post}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Bolinha p={m.autor} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.nome13}>{m.autor.nome}</Text>
              <Text style={[type.small, { color: colors.faint }]}>
                {m.quando} · {m.arco}
              </Text>
            </View>
            {m.tipo === 'aviso' ? (
              <View style={s.seloAviso}>
                <Bell size={11} color={colors.accentDark} />
                <Text style={[s.selo, { color: colors.accentDark }]}>aviso</Text>
              </View>
            ) : null}
          </View>
          <Text style={s.postTitulo}>{m.titulo}</Text>
          <Text style={s.postTxt}>{m.txt}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 2 }}>
            <Pressable onPress={() => avisar('Abrindo o assunto no mural')} hitSlop={8} style={s.acao}>
              <MessageCircle size={14} color={colors.accentDark} />
              <Text style={[s.acaoText, { color: colors.accentDark, fontFamily: fonts.sansSemi }]}>
                {m.respostas} {m.respostas === 1 ? 'resposta' : 'respostas'}
              </Text>
            </Pressable>
            <View style={s.acao}>
              <Heart size={14} color={colors.muted} />
              <Text style={[s.acaoText, { color: colors.muted }]}>{m.curtidas}</Text>
            </View>
          </View>
        </View>
      ))}
      <BotaoTracejado icon={<Pencil size={16} color={colors.inkSoft} />} label="Escrever no mural" onPress={() => avisar('O editor do mural abre aqui')} />
      {sala.conduzo ? (
        <Pressable style={s.btnAviso} onPress={() => avisar('O editor de avisos abre aqui')}>
          <Bell size={16} color={colors.accentDark} />
          <Text style={[s.btnText, { color: colors.accentDark }]}>Publicar um aviso</Text>
        </Pressable>
      ) : (
        <Text style={[type.small, { textAlign: 'center', lineHeight: 17 }]}>O mural é de todo mundo. Os avisos, com o sino, vêm de quem conduz.</Text>
      )}
    </View>
  );
}

function Acervo({ sala }: { sala: SalaClube }) {
  const [filtro, setFiltro] = useState('tudo');
  const total = sala.acervo.reduce((t, g) => t + g.obras.length, 0);
  const curto: Record<string, string> = { vozalta: 'Voz alta', cineminha: 'Cineminha', jogos: 'Jogos', poesia: 'Poesia' };
  const chips = [{ id: 'tudo', label: `Tudo · ${total}` }, ...sala.acervo.map((g) => ({ id: g.id, label: `${curto[g.id] ?? g.arco} · ${g.obras.length}` }))];
  const grupos = sala.acervo.filter((g) => filtro === 'tudo' || g.id === filtro);
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 6 }}>
        <Text style={s.h2}>Tudo o que este clube já atravessou</Text>
        <Text style={[type.body, { color: colors.inkSoft }]}>A memória do clube, em ordem. Serve para lembrar, para mostrar a quem chega e para não repetir sem querer.</Text>
      </View>
      <View style={s.grade}>
        {[0, 2].map((i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 1 }}>
            {sala.acervoNumeros.slice(i, i + 2).map((a) => (
              <View key={a.d} style={s.gradeItem}>
                <Text style={s.gradeN}>{a.n}</Text>
                <Text style={type.small}>{a.d}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      <Filtros itens={chips} value={filtro} onChange={setFiltro} />
      {grupos.map((g) => (
        <View key={g.id} style={{ gap: 8 }}>
          <View style={s.grupoHead}>
            <View style={[s.icone, { backgroundColor: colors.accentSoft }]}>
              <IconeDoArco icone={g.icone} size={17} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={s.grupoTitulo}>
                {g.arco}
              </Text>
              <Text style={type.small}>
                {g.obras.length} {g.obras.length === 1 ? 'obra' : 'obras'} · {g.meta}
              </Text>
            </View>
          </View>
          {g.obras.map((o) => (
            <Pressable key={o.titulo} disabled={!o.livroId} onPress={() => o.livroId && router.push(`/livro/${o.livroId}`)} style={s.obra}>
              <CapaMini cor={o.cor} titulo={o.titulo} w={36} h={54} />
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text style={[type.title, { fontSize: 14, lineHeight: 19 }]}>{o.titulo}</Text>
                <Text style={type.small}>{o.autor}</Text>
                <Text style={type.small}>
                  {o.periodo} · {o.encontros}
                </Text>
                <Text style={[s.mono12, { color: o.agora ? colors.accentDark : colors.muted }]}>{o.nota}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ))}
      {sala.conduzo ? <BotaoTracejado icon={<Plus size={16} color={colors.inkSoft} />} label="Registrar uma obra" onPress={() => router.push(`/painel-clube/${sala.id}`)} /> : null}
    </View>
  );
}

function Enquetes({ sala, avisar }: { sala: SalaClube; avisar: (m: string) => void }) {
  const SELO = {
    ativa: { t: 'aberta', bg: colors.greenSoft, fg: colors.green, barra: colors.accent },
    encerrada: { t: 'encerrada', bg: colors.cream, fg: colors.muted, barra: colors.lineStrong },
    agendada: { t: 'agendada', bg: colors.goldSoft, fg: colors.gold, barra: colors.line },
  } as const;
  return (
    <View style={{ gap: 10 }}>
      <Text style={[s.sub13, { color: colors.muted, marginBottom: 2 }]}>
        {sala.conduzo
          ? 'Perguntar antes de decidir. Uma enquete pode valer para o clube todo, para um capítulo ou só para uma sessão.'
          : 'Quem conduz abre as enquetes. Você responde as que estão abertas e vê o resultado das encerradas.'}
      </Text>
      {sala.enquetes.map((e) => {
        const selo = SELO[e.estado];
        const podeResponder = e.estado === 'ativa' && !sala.conduzo;
        return (
          <Pressable
            key={e.id}
            style={s.enquete}
            onPress={() => avisar(e.estado === 'ativa' ? (sala.conduzo ? 'Abrindo a enquete' : 'Abrindo para responder') : 'Abrindo o resultado')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <View style={[s.icone, { backgroundColor: colors.cream }]}>
                <IconeDoArco icone={e.icone} size={16} color={colors.inkSoft} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <Text style={s.grupoTitulo}>{e.titulo}</Text>
                <Text style={type.small}>{e.arco}</Text>
                <Text style={type.small}>
                  {e.quem} · {e.prazo}
                </Text>
              </View>
              <View style={[s.seloBox, { backgroundColor: selo.bg }]}>
                <Text style={[s.selo, { color: selo.fg }]}>{selo.t}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
                <Text style={[s.nome13, { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.inkSoft }]}>{e.resp}</Text>
                <View style={s.trilho}>
                  <View style={{ width: `${e.pct}%`, height: 6, borderRadius: 3, backgroundColor: selo.barra }} />
                </View>
              </View>
              {podeResponder ? (
                <View style={s.responder}>
                  <Text style={[s.btnText, { fontSize: 13, color: colors.paper }]}>Responder</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
      {sala.conduzo ? <BotaoTracejado icon={<Plus size={16} color={colors.inkSoft} />} label="Nova enquete" onPress={() => router.push({ pathname: '/nova-enquete', params: { clube: sala.id } })} /> : null}
    </View>
  );
}

function Pessoas({ sala }: { sala: SalaClube }) {
  return (
    <View>
      {sala.membros.map((m) => (
        <Pressable key={m.nome} style={s.membro} onPress={() => (m.id ? router.push(`/pessoa/${m.id}`) : router.push('/(tabs)/perfil'))}>
          <Bolinha p={m} size={40} fontSize={14} />
          <View style={{ flex: 1 }}>
            <Text style={type.title}>{m.nome}</Text>
            <Text style={[type.small, { fontSize: 13 }]}>{m.desc}</Text>
          </View>
          <ChevronRight size={20} color={colors.faint} />
        </Pressable>
      ))}
      <Text style={[type.small, { textAlign: 'center', paddingVertical: 14 }]}>{sala.membrosRodape}</Text>
    </View>
  );
}

function BotaoTracejado({ icon, label, onPress }: { icon: ReactNode; label: string; onPress?: () => void }) {
  return (
    <Pressable style={s.tracejado} onPress={onPress}>
      {icon}
      <Text style={[s.btnText, { color: colors.inkSoft }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  h2: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 27, color: colors.ink, letterSpacing: -0.2 },
  sub13: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 17, color: colors.inkSoft },
  nome13: { fontFamily: fonts.sansBold, fontSize: 13, lineHeight: 17, color: colors.ink },
  mono12: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16 },
  monoAccent: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 16, color: colors.accentDark },
  arco: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  post: { gap: 8, padding: 14, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  postTitulo: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 23, color: colors.ink },
  postTxt: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkSoft },
  acao: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  acaoText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 },
  seloAviso: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.accentSoft },
  seloBox: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  selo: { fontFamily: fonts.sansBold, fontSize: 10, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase' },
  tracejado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
  },
  btnAviso: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 12, backgroundColor: colors.accentSoft },
  btnText: { fontFamily: fonts.sansSemi, fontSize: 14 },
  grade: { gap: 1, backgroundColor: colors.line, borderWidth: 1, borderColor: colors.line, borderRadius: 12, overflow: 'hidden' },
  gradeItem: { flex: 1, backgroundColor: colors.card, paddingVertical: 12, paddingHorizontal: 14, gap: 2 },
  gradeN: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 24, color: colors.ink },
  grupoHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  icone: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  grupoTitulo: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 21, color: colors.ink },
  obra: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.card },
  enquete: { gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  trilho: { height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' },
  responder: { height: 36, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  membro: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
});
