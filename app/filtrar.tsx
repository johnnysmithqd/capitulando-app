import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ChipGroup } from '../src/components/ChipGroup';
import { Sheet } from '../src/components/Sheet';
import { Button } from '../src/components/ui';
import { estanteFiltroPadrao, useStore } from '../src/data/store';
import { colors, fonts, type } from '../src/theme';

export default function Filtrar() {
  const store = useStore();
  const [f, setF] = useState(store.estanteFiltro);
  const total = store.byStatus('lido').filter((x) => (x.reading.rating ?? 0) >= f.notaMin).length;

  return (
    <Sheet showClose={false}>
      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={type.h1}>Filtrar Lidos</Text>
          <Pressable onPress={() => setF(estanteFiltroPadrao)} hitSlop={8}>
            <Text style={{ fontFamily: fonts.sansSemi, fontSize: 14, color: colors.accentDark }}>Limpar</Text>
          </Pressable>
        </View>
        <ChipGroup
          label="Gênero"
          value={f.genero}
          onChange={(genero) => setF({ ...f, genero })}
          options={[
            ['todos', 'Todos'],
            ['romance', 'Romance'],
            ['nao-ficcao', 'Não ficção'],
            ['contos', 'Contos'],
            ['ficcao-cientifica', 'Ficção científica'],
          ]}
        />
        <ChipGroup
          label="Nota mínima"
          value={String(f.notaMin)}
          onChange={(v) => setF({ ...f, notaMin: Number(v) })}
          options={[
            ['0', 'Qualquer'],
            ['3.5', '★★★½+'],
            ['4', '★★★★+'],
            ['4.5', '★★★★½+'],
            ['5', '★★★★★'],
          ]}
        />
        <ChipGroup
          label="Ano em que li"
          value={f.ano}
          onChange={(ano) => setF({ ...f, ano })}
          options={[
            ['todos', 'Todos'],
            ['2026', '2026'],
            ['2025', '2025'],
          ]}
        />
        <Button
          label={`Ver ${total} livros`}
          onPress={() => {
            store.setEstanteFiltro(f);
            router.back();
          }}
        />
      </View>
    </Sheet>
  );
}
