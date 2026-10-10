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
import { alpha, C, R, SP, T } from '../theme/tokens';
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
        <Text style={[T.score, { color: raw ? C.chalk : C.chalkFaint }]}>{raw || '—'}</Text>
        <Text style={[T.label, { color: warn ? C.red : C.chalkFaint }]}>
          {warn ?? 'Total de la volée'}
        </Text>
      </View>

      <View style={s.quickRow}>
        {QUICK.map((q) => (
          <Pressable
            key={q}
            onPress={() => send(q)}
            style={({ pressed }) => [
              s.quick,
              { backgroundColor: pressed ? alpha(C.brass, 0.25) : 'transparent' },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Volée de ${q}`}>
            <Text style={[T.small, { color: C.chalkDim, fontWeight: '700' }]}>{q}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.grid}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <Pressable
            key={d}
            onPress={() => push(d)}
            style={({ pressed }) => [s.key, { backgroundColor: pressed ? C.panelHigher : C.panelHigh }]}
            accessibilityRole="button"
            accessibilityLabel={d}>
            <Text style={T.scoreSm}>{d}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            tapLight();
            setRaw((r) => r.slice(0, -1));
          }}
          style={({ pressed }) => [s.key, { backgroundColor: pressed ? C.panelHigher : C.panel }]}
          accessibilityRole="button"
          accessibilityLabel="Effacer un chiffre">
          <Undo size={20} color={C.chalkDim} />
        </Pressable>
        <Pressable
          onPress={() => push('0')}
          style={({ pressed }) => [s.key, { backgroundColor: pressed ? C.panelHigher : C.panelHigh }]}
          accessibilityRole="button"
          accessibilityLabel="0">
          <Text style={T.scoreSm}>0</Text>
        </Pressable>
        <Pressable
          onPress={() => (n === null ? tapError() : send(n))}
          disabled={!valid}
          style={({ pressed }) => [
            s.key,
            {
              backgroundColor: valid ? (pressed ? alpha(C.brass, 0.8) : C.brass) : C.panel,
              opacity: valid ? 1 : 0.5,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Valider la volée">
          <Check size={24} color={valid ? C.onBrass : C.chalkFaint} />
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
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.sm,
    paddingHorizontal: 11,
    paddingVertical: 7,
    minWidth: 44,
    alignItems: 'center',
  },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'stretch', gap: 6 },
  key: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.line,
  },
});
