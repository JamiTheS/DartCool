/**
 * Les trois fléchettes de la volée en cours, le total, et l'annulation.
 * Le plateau est toujours visible : on voit ce qui a été saisi avant que la
 * main ne tourne, et on peut revenir en arrière d'un geste.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Dart, label as dartLabel, value } from '../engine';
import { alpha, C, R, SP, T } from '../theme/tokens';
import { tapMedium } from '../utils/feedback';
import { Undo } from './icons';

export function ThrowTray({
  darts,
  onUndo,
  canUndo,
  accent,
}: {
  darts: Dart[];
  onUndo: () => void;
  canUndo: boolean;
  accent: string;
}) {
  const total = darts.reduce((sum, d) => sum + value(d), 0);
  const isTotalEntry = darts.length === 1 && darts[0].turnTotal === true;
  const slots = isTotalEntry ? [darts[0]] : [darts[0], darts[1], darts[2]];

  return (
    <View style={s.wrap}>
      <View style={s.slots}>
        {slots.map((d, i) => {
          const filled = Boolean(d);
          const active = !isTotalEntry && !filled && darts.length === i;
          return (
            <View
              key={i}
              style={[
                s.slot,
                isTotalEntry ? { flex: 3 } : null,
                {
                  borderColor: filled ? alpha(accent, 0.5) : active ? alpha(accent, 0.75) : C.line,
                  backgroundColor: filled ? alpha(accent, 0.1) : active ? alpha(accent, 0.05) : 'transparent',
                  borderStyle: filled || active ? 'solid' : 'dashed',
                },
              ]}>
              <Text
                style={[
                  T.subtitle,
                  { color: filled ? C.chalk : C.chalkFaint, fontSize: isTotalEntry ? 26 : 21 },
                ]}>
                {filled ? dartLabel(d) : '·'}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={s.right}>
        <View style={{ alignItems: 'flex-end', marginRight: SP.sm }}>
          <Text style={[T.label, { color: C.chalkFaint }]}>Volée</Text>
          <Text style={[T.subtitle, { color: total > 0 ? C.chalk : C.chalkFaint }]}>{total}</Text>
        </View>
        <Pressable
          onPress={() => {
            if (!canUndo) return;
            tapMedium();
            onUndo();
          }}
          disabled={!canUndo}
          style={({ pressed }) => [
            s.undo,
            {
              opacity: canUndo ? (pressed ? 0.7 : 1) : 0.3,
              backgroundColor: pressed ? C.panelHigher : C.panelHigh,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Annuler la dernière fléchette">
          <Undo size={20} color={C.chalk} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.md,
    paddingVertical: SP.xs,
    gap: SP.sm,
  },
  slots: { flexDirection: 'row', flex: 1, gap: 6 },
  slot: {
    flex: 1,
    height: 48,
    borderRadius: R.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: { flexDirection: 'row', alignItems: 'center' },
  undo: {
    width: 48,
    height: 48,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
