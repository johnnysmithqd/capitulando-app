import { ActionSheetIOS, Alert, Platform } from 'react-native';

export interface OpcaoMenu {
  label: string;
  destrutiva?: boolean;
  onPress: () => void;
}

/** Menu de opções nativo (action sheet no iOS, diálogo no Android). */
export function menu(titulo: string, opcoes: OpcaoMenu[]) {
  if (Platform.OS === 'ios') {
    const destr = opcoes.findIndex((o) => o.destrutiva);
    ActionSheetIOS.showActionSheetWithOptions(
      { title: titulo, options: [...opcoes.map((o) => o.label), 'Cancelar'], cancelButtonIndex: opcoes.length, destructiveButtonIndex: destr >= 0 ? destr : undefined },
      (i) => opcoes[i]?.onPress(),
    );
    return;
  }
  Alert.alert(titulo, undefined, [
    ...opcoes.map((o) => ({ text: o.label, style: (o.destrutiva ? 'destructive' : 'default') as 'destructive' | 'default', onPress: o.onPress })),
    { text: 'Cancelar', style: 'cancel' as const },
  ]);
}

/** Aviso simples para recursos que dependem de permissão do aparelho (câmera, fotos, arquivos, contatos). */
export function precisaDoAparelho(recurso: string) {
  Alert.alert(recurso, 'Essa ação usa um recurso do celular e será ligada junto com o backend.');
}
