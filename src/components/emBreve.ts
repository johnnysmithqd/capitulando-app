import { Alert } from 'react-native';

/** Aviso para destinos que chegam na Fase 4 (apoio, checkout, painéis do condutor). */
export function emBreve(what: string) {
  Alert.alert(what, 'Chega na próxima fase do app.');
}
