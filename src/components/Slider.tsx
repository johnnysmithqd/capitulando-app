import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { colors } from '../theme';

/** Slider simples (0..max) desenhado no estilo do protótipo. */
export function Slider({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  const [w, setW] = useState(0);
  const wRef = useRef(0);
  const startX = useRef(0);
  const cb = useRef(onChange);
  cb.current = onChange;

  const toValue = (x: number) => Math.round(Math.max(0, Math.min(1, x / (wRef.current || 1))) * max);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        startX.current = e.nativeEvent.locationX;
        cb.current(toValue(startX.current));
      },
      onPanResponderMove: (_, g) => cb.current(toValue(startX.current + g.dx)),
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    wRef.current = e.nativeEvent.layout.width;
    setW(e.nativeEvent.layout.width);
  };
  const x = max ? (value / max) * w : 0;

  return (
    <View style={s.hit} onLayout={onLayout} {...pan.panHandlers}>
      <View style={s.track} pointerEvents="none">
        <View style={[s.fill, { width: x }]} />
      </View>
      <View style={[s.thumb, { left: x - 13 }]} pointerEvents="none" />
    </View>
  );
}

const s = StyleSheet.create({
  hit: { height: 40, justifyContent: 'center' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.lineStrong },
  thumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.paper,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
