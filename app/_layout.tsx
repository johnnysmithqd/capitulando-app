import { CourierPrime_400Regular, CourierPrime_700Bold } from '@expo-google-fonts/courier-prime';
import {
  Literata_400Regular,
  Literata_400Regular_Italic,
  Literata_600SemiBold,
  Literata_700Bold,
} from '@expo-google-fonts/literata';
import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider } from '../src/data/store';
import { colors } from '../src/theme';

const sheet = { presentation: 'transparentModal', animation: 'none', contentStyle: { backgroundColor: 'transparent' } } as const;

export default function RootLayout() {
  const [loaded] = useFonts({
    Literata_400Regular,
    Literata_400Regular_Italic,
    Literata_600SemiBold,
    Literata_700Bold,
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    CourierPrime_400Regular,
    CourierPrime_700Bold,
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="livro/[id]" />
          <Stack.Screen name="estante/[status]" />
          <Stack.Screen name="registrar" options={sheet} />
          <Stack.Screen name="busca" options={sheet} />
          <Stack.Screen name="status" options={sheet} />
          <Stack.Screen name="progresso" options={sheet} />
          <Stack.Screen name="detalhes" options={sheet} />
          <Stack.Screen name="salvo" options={sheet} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
