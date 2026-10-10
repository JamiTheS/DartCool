/**
 * Pavé de saisie. Un appui sur le multiplicateur, un appui sur le numéro.
 * Le multiplicateur revient tout seul sur « simple » après chaque fléchette :
 * impossible d'enchaîner trois triples par erreur.
 * Les numéros qui comptent dans le mode en cours sont éclairés, les autres
 * restent accessibles mais en retrait.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Dart } from '../engine';
import { alpha, C, R, SP, T } from '../theme/tokens';
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

  // Quand le mode impose une zone (Bob's 27, horloge en doubles), on s'y place.
  // Ajustement pendant le rendu : pas d'effet, donc pas de double rendu.
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

  const multColor = mult === 3 ? C.green : mult === 2 ? C.red : C.brass;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.multRow}>
        {([1, 2, 3] as const).map((m) => {
          const active = mult === m;
          const col = m === 3 ? C.green : m === 2 ? C.red : C.brass;
          return (
            <Pressable
              key={m}
              onPress={() => {
                tapLight();
                setMult(m);
              }}
              style={[
                s.multBtn,
                { borderColor: active ? col : C.line, backgroundColor: active ? alpha(col, 0.18) : 'transparent' },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <Text
                style={[
                  T.bodyStrong,
                  { color: active ? col : C.chalkFaint, letterSpacing: 1.6, fontWeight: '800' },
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
                {
                  backgroundColor: pressed ? alpha(multColor, 0.3) : C.panelHigh,
                  borderColor: on ? alpha(multColor, 0.35) : C.line,
                  opacity: on ? 1 : 0.42,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${mult === 2 ? 'double ' : mult === 3 ? 'triple ' : ''}${n}`}>
              <Text style={[T.scoreSm, { color: on ? C.chalk : C.chalkDim }]}>{n}</Text>
              {mult > 1 ? (
                <Text style={[T.label, { color: multColor, marginTop: -4 }]}>{n * mult}</Text>
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
            { backgroundColor: pressed ? alpha(C.red, 0.2) : C.panel, borderColor: C.line },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Fléchette manquée">
          <Text style={[T.bodyStrong, { color: C.chalkDim, letterSpacing: 1.4 }]}>RATÉ</Text>
        </Pressable>
        <Pressable
          onPress={() => send(25, 1)}
          style={({ pressed }) => [
            s.wideKey,
            {
              backgroundColor: pressed ? alpha(C.green, 0.25) : C.panelHigh,
              borderColor: hot(25) ? alpha(C.green, 0.45) : C.line,
              opacity: hot(25) ? 1 : 0.42,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="25, simple bull">
          <Text style={[T.subtitle, { color: C.chalk }]}>25</Text>
        </Pressable>
        <Pressable
          onPress={() => send(25, 2)}
          style={({ pressed }) => [
            s.wideKey,
            {
              backgroundColor: pressed ? alpha(C.red, 0.3) : alpha(C.red, 0.14),
              borderColor: hot(25) ? alpha(C.red, 0.5) : C.line,
              opacity: hot(25) ? 1 : 0.42,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Bull, 50">
          <Text style={[T.subtitle, { color: C.chalk }]}>BULL</Text>
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
    paddingVertical: 9,
    borderRadius: R.sm,
    borderWidth: 1,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'stretch',
    gap: 5,
  },
  key: {
    flexGrow: 1,
    flexBasis: '18%',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
    borderWidth: 1,
  },
  bottomRow: { flexDirection: 'row', gap: 5, marginTop: 5 },
  wideKey: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
    borderWidth: 1,
  },
});
