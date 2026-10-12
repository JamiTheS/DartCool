/**
 * Saisie par total de volée : la méthode du bar quand ça va vite.
 * On tape 1-4-0, on valide, c'est au suivant. Les totaux impossibles à trois
 * fléchettes (179, 178, 176…) sont refusés, et les scores fréquents sont à
 * portée de pouce.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { isPossibleTurnTotal, totalDart } from '../engine';
import { Dart } from '../engine/darts';
import { C, R, SH, SP, T } from '../theme/tokens';
import { tapError, tapLight } from '../utils/feedback';
import { Check, Undo } from './icons';

const QUICK = [26, 41, 45, 60, 81, 100, 140, 180];

export function TotalPad({
  onDart,
  max,
  disabled,
}: {
  onDart: (d: Dart) => void;
  /** Reste du joueur, pour prévenir d'un bust évident. */
  max?: number;
  disabled?: boolean;
}) {
  const [raw, setRaw] = useState('');
  const n = raw === '' ? null : parseInt(raw, 10);
  const valid = n !== null && isPossibleTurnTotal(n);

  const push = (digit: string) => {
    if (disabled) return;
    const next = (raw + digit).replace(/^0+(?=\d)/, '');
    if (parseInt(next, 10) > 180) {
      tapError();
      return;
    }
    tapLight();
    setRaw(next);
  };

  const send = (v: number) => {
    if (disabled) return;
    if (!isPossibleTurnTotal(v)) {
      tapError();
      return;
    }
    tapLight();
    onDart(totalDart(v));
    setRaw('');
  };

  const warn =
    n !== null && !valid
      ? 'Total impossible avec trois fléchettes'
      : n !== null && max !== undefined && n > max
        ? 'Au-dessus du reste : ce sera un bust'
        : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.display}>
        <Text style={[T.score, { color: raw ? C.ink : C.ink3 }]}>{raw || '—'}</Text>
        <Text style={[T.label, { color: warn ? C.danger : C.ink3 }]}>
          {warn ?? 'Total de la volée'}
        </Text>
      </View>

      <View style={s.quickRow}>
        {QUICK.map((q) => (
          <Pressable
            key={q}
            onPress={() => send(q)}
            style={({ pressed }) => [s.quick, { backgroundColor: pressed ? C.pinkSoft : C.cardHi }]}
            accessibilityRole="button"
            accessibilityLabel={`Volée de ${q}`}>
            <Text style={[T.small, { color: C.ink2, fontWeight: '700' }]}>{q}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.grid}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <Pressable
            key={d}
            onPress={() => push(d)}
            style={({ pressed }) => [s.key, SH.sm, { backgroundColor: pressed ? C.cardHi2 : C.card }]}
            accessibilityRole="button"
            accessibilityLabel={d}>
            <Text style={[T.scoreSm, { fontSize: 28 }]}>{d}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            tapLight();
            setRaw((r) => r.slice(0, -1));
          }}
          style={({ pressed }) => [s.key, { backgroundColor: pressed ? C.cardHi2 : C.cardHi }]}
          accessibilityRole="button"
          accessibilityLabel="Effacer un chiffre">
          <Undo size={20} color={C.ink2} />
        </Pressable>
        <Pressable
          onPress={() => push('0')}
          style={({ pressed }) => [s.key, SH.sm, { backgroundColor: pressed ? C.cardHi2 : C.card }]}
          accessibilityRole="button"
          accessibilityLabel="0">
          <Text style={[T.scoreSm, { fontSize: 28 }]}>0</Text>
        </Pressable>
        <Pressable
          onPress={() => (n === null ? tapError() : send(n))}
          disabled={!valid}
          style={({ pressed }) => [
            s.key,
            valid ? SH.sm : null,
            {
              backgroundColor: valid ? (pressed ? C.pinkInk : C.ink) : C.cardHi,
              opacity: valid ? 1 : 0.6,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Valider la volée">
          <Check size={24} color={valid ? '#FFFFFF' : C.ink3} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  display: { alignItems: 'center', paddingBottom: SP.xs },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: SP.sm,
  },
  quick: {
    borderRadius: R.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 46,
    alignItems: 'center',
  },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'stretch', gap: 7 },
  key: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
  },
});
