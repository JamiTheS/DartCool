/**
 * Pavé de saisie — la solution de repli quand on préfère taper les chiffres.
 * Un appui sur le multiplicateur, un appui sur le numéro. Le multiplicateur
 * revient tout seul sur « simple », et il reprend les couleurs de la cible :
 * rose pour le double, pêche pour le triple.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Dart } from '../engine';
import { alpha, C, R, SH, SP, T } from '../theme/tokens';
import { tapLight } from '../utils/feedback';

const NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);

export function DartPad({
  onDart,
  focus,
  focusMult,
  disabled,
}: {
  onDart: (d: Dart) => void;
  focus?: number[];
  focusMult?: 1 | 2 | 3;
  disabled?: boolean;
}) {
  const [mult, setMult] = useState<1 | 2 | 3>(focusMult ?? 1);
  const [seenFocus, setSeenFocus] = useState(focusMult);

  // Quand le mode impose une zone, on s'y place — ajustement pendant le rendu.
  if (seenFocus !== focusMult) {
    setSeenFocus(focusMult);
    setMult(focusMult ?? 1);
  }

  const hot = (n: number) => !focus || focus.length === 0 || focus.includes(n);

  const send = (seg: number, m?: 1 | 2 | 3) => {
    if (disabled) return;
    tapLight();
    onDart({ seg, mult: m ?? mult });
    setMult(focusMult ?? 1);
  };

  const multColor = mult === 3 ? C.peach : mult === 2 ? C.pink : C.ink;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.multRow}>
        {([1, 2, 3] as const).map((m) => {
          const active = mult === m;
          const bg = m === 3 ? C.peach : m === 2 ? C.pink : C.ink;
          return (
            <Pressable
              key={m}
              onPress={() => {
                tapLight();
                setMult(m);
              }}
              style={[
                s.multBtn,
                active ? [{ backgroundColor: bg }, SH.sm] : { backgroundColor: C.cardHi2 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <Text
                style={[
                  T.bodyStrong,
                  {
                    color: active ? (m === 1 ? '#FFFFFF' : C.ink) : C.ink2,
                    fontSize: 12.5,
                    letterSpacing: 1.1,
                    fontWeight: '700',
                  },
                ]}>
                {m === 1 ? 'SIMPLE' : m === 2 ? 'DOUBLE' : 'TRIPLE'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={s.grid}>
        {NUMBERS.map((n) => {
          const on = hot(n);
          return (
            <Pressable
              key={n}
              onPress={() => send(n)}
              style={({ pressed }) => [
                s.key,
                on ? SH.sm : null,
                {
                  backgroundColor: pressed ? alpha(multColor, 0.16) : on ? C.card : C.cardHi,
                  opacity: on ? 1 : 0.5,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${mult === 2 ? 'double ' : mult === 3 ? 'triple ' : ''}${n}`}>
              <Text style={[T.scoreSm, { color: on ? C.ink : C.ink3, fontSize: 27 }]}>{n}</Text>
              {mult > 1 ? (
                <Text style={[T.label, { color: mult === 2 ? C.pinkInk : C.peachInk, marginTop: -3 }]}>
                  {n * mult}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={s.bottomRow}>
        <Pressable
          onPress={() => send(0, 1)}
          style={({ pressed }) => [
            s.wideKey,
            { backgroundColor: pressed ? C.cardHi2 : C.cardHi },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Fléchette manquée">
          <Text style={[T.bodyStrong, { color: C.ink2, letterSpacing: 1.2, fontSize: 13 }]}>RATÉ</Text>
        </Pressable>
        <Pressable
          onPress={() => send(25, 1)}
          style={({ pressed }) => [
            s.wideKey,
            SH.sm,
            { backgroundColor: pressed ? C.peach : C.peachSoft, opacity: hot(25) ? 1 : 0.5 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="25, simple bull">
          <Text style={[T.subtitle, { color: C.ink }]}>25</Text>
        </Pressable>
        <Pressable
          onPress={() => send(25, 2)}
          style={({ pressed }) => [
            s.wideKey,
            SH.sm,
            { backgroundColor: pressed ? C.pink : C.pinkSoft, opacity: hot(25) ? 1 : 0.5 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Bull, 50">
          <Text style={[T.subtitle, { color: C.ink }]}>BULL</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  multRow: { flexDirection: 'row', gap: SP.xs, marginBottom: SP.sm },
  multBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: R.sm,
  },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'stretch', gap: 6 },
  key: {
    flexGrow: 1,
    flexBasis: '18%',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
  },
  bottomRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  wideKey: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
  },
});
