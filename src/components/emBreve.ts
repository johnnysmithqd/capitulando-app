import { Alert } from 'react-native';

/** Aviso para ações que ainda não têm tela própria. */
export function emBreve(what: string) {
  Alert.alert(what, 'Essa parte ainda está em construção.');
}
