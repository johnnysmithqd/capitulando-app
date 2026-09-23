import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ChipGroup } from '../src/components/ChipGroup';
import { Sheet } from '../src/components/Sheet';
import { Button } from '../src/components/ui';
import * as api from '../src/data/api';
import { diarioFiltroPadrao, useApi, useStore, type DiarioFiltro } from '../src/data/store';
import { filtrarDiario } from '../src/data/filtros';
import { colors, fonts, type } from '../src/theme';

export default function FiltrarDiario() {
  const store = useStore();
  const p = useApi(api.getProfile);
  const [f, setF] = useState(store.diarioFiltro);
  const total = p ? filtrarDiario(p.diary, f).reduce((a, m) => a + m.items.length, 0) : 0;

  return (
    <Sheet showClose={false}>
      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={type.h1}>Filtrar o diário</Text>
          <Pressable onPress={() => setF(diarioFiltroPadrao)} hitSlop={8}>
            <Text style={{ fontFamily: fonts.sansSemi, fontSize: 14, color: colors.accentDark }}>Limpar</Text>
          </Pressable>
        </View>
        <ChipGroup
          label="Ano"
          value={f.ano}
          onChange={(ano) => setF({ ...f, ano })}
          options={[
            ['todos', 'Todos'],
            ['2026', '2026'],
            ['2025', '2025'],
          ]}
        />
        <ChipGroup
          label="Nota mínima"
          value={String(f.notaMin)}
          onChange={(v) => setF({ ...f, notaMin: Number(v) })}
          options={[
            ['0', 'Qualquer'],
            ['3', '★★★+'],
            ['4', '★★★★+'],
            ['4.5', '★★★★½+'],
            ['5', '★★★★★'],
          ]}
        />
        <ChipGroup<DiarioFiltro['tipo']>
          label="Tipo de entrada"
          value={f.tipo}
          onChange={(tipo) => setF({ ...f, tipo })}
          options={[
            ['todas', 'Todas'],
            ['resenha', 'Com resenha'],
            ['releitura', 'Releituras'],
            ['clube', 'De clube'],
          ]}
        />
        <Button
          label={`Ver ${total} ${total === 1 ? 'entrada' : 'entradas'}`}
          onPress={() => {
            store.setDiarioFiltro(f);
            router.back();
          }}
        />
      </View>
    </Sheet>
  );
}
