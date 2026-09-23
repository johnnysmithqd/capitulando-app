import { router } from 'expo-router';
import { Check, GripVertical, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { precisaDoAparelho } from '../src/components/menu';
import { Sheet } from '../src/components/Sheet';
import { Avatar, Divider, Eyebrow, T } from '../src/components/ui';
import * as api from '../src/data/api';
import { useApi } from '../src/data/store';
import type { Book } from '../src/data/types';
import { colors, fonts, radius, type } from '../src/theme';

const BIO_MAX = 120;

export default function EditarPerfil() {
  const me = useApi(api.getMe);
  const profile = useApi(api.getProfile);
  const [nome, setNome] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [favs, setFavs] = useState<Book[]>([]);

  useEffect(() => {
    if (me) {
      setNome(me.name);
      setHandle(me.handle);
      setBio('Leio devagar e anoto tudo. Recife.');
    }
  }, [me]);
  useEffect(() => {
    if (profile) setFavs(profile.favorites);
  }, [profile]);

  const handleOk = /^[a-z0-9._]{3,30}$/.test(handle);
  const salvar = () => {
    if (!nome.trim() || !handleOk) return;
    api.updateProfile({ name: nome.trim(), handle, bio, favorites: favs.map((b) => b.id) });
    router.back();
  };

  return (
    <Sheet showClose={false} full>
      <View style={s.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={s.cancel}>Cancelar</Text>
        </Pressable>
        <Text style={type.h2}>Editar perfil</Text>
        <Pressable onPress={salvar} hitSlop={8}>
          <Text style={[s.save, !handleOk && { opacity: 0.4 }]}>Salvar</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30, gap: 10 }} keyboardShouldPersistTaps="handled">
        {me ? (
          <View style={{ alignItems: 'center', gap: 10, marginVertical: 8 }}>
            <Avatar initials={me.initials} bg={me.avatarBg} fg={me.avatarFg} size={84} />
            <Pressable style={s.photo} onPress={() => precisaDoAparelho('Trocar foto')}>
              <Text style={s.photoText}>Trocar foto</Text>
            </Pressable>
          </View>
        ) : null}

        <Eyebrow style={s.label}>Nome</Eyebrow>
        <TextInput value={nome} onChangeText={setNome} style={s.input} />

        <Eyebrow style={s.label}>Nome de usuário</Eyebrow>
        <View style={[s.input, s.inputRow]}>
          <Text style={s.at}>@</Text>
          <TextInput
            value={handle}
            onChangeText={(t) => setHandle(t.toLowerCase())}
            autoCapitalize="none"
            autoCorrect={false}
            style={s.inputFlex}
          />
          {handleOk ? <Check size={18} color={colors.ink} /> : <X size={18} color="#8C332B" />}
        </View>

        <View style={[s.label, { flexDirection: 'row', justifyContent: 'space-between' }]}>
          <Eyebrow>Bio</Eyebrow>
          <Text style={type.mono}>
            {bio.length}/{BIO_MAX}
          </Text>
        </View>
        <TextInput value={bio} onChangeText={(t) => setBio(t.slice(0, BIO_MAX))} multiline style={[s.input, { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 }]} />

        <View style={[s.label, { flexDirection: 'row', justifyContent: 'space-between' }]}>
          <Eyebrow>Favoritos</Eyebrow>
          <T style={type.small}>toque para remover</T>
        </View>
        {favs.map((b, i) => (
          <View key={b.id}>
            {i > 0 ? <Divider /> : null}
            <View style={s.fav}>
              <GripVertical size={16} color={colors.lineStrong} />
              <View style={[s.favCover, { backgroundColor: b.coverColor }]} />
              <T style={[type.body, { flex: 1, fontSize: 15 }]}>{b.title}</T>
              <Pressable onPress={() => setFavs(favs.filter((x) => x.id !== b.id))} hitSlop={8} accessibilityLabel="Remover">
                <X size={18} color={colors.muted} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </Sheet>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  cancel: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.inkSoft },
  save: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.accentDark },
  photo: { backgroundColor: colors.cream, borderRadius: radius.pill, paddingHorizontal: 14, height: 34, justifyContent: 'center' },
  photoText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.accentDark },
  label: { marginTop: 10 },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentLine,
    backgroundColor: colors.creamSoft,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inputFlex: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.ink, paddingVertical: 12 },
  at: { fontFamily: fonts.sans, fontSize: 15, color: colors.muted },
  fav: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  favCover: { width: 32, height: 46, borderRadius: 3 },
});
