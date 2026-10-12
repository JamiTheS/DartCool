/**
 * Les trois fléchettes de la volée en cours, le total, et l'annulation.
 * Toujours visible : on voit ce qui a été saisi avant que la main ne tourne,
 * et on revient en arrière d'un geste.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Dart, label as dartLabel, value } from '../engine';
import { alpha, C, R, SH, SP, T } from '../theme/tokens';
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
                SH.sm,
                isTotalEntry ? { flex: 3 } : null,
                filled
                  ? { backgroundColor: C.ink }
                  : active
                    ? { backgroundColor: C.card, borderWidth: 2, borderColor: alpha(accent, 0.9) }
                    : { backgroundColor: C.cardHi },
              ]}>
              <Text
                style={[
                  T.subtitle,
                  {
                    color: filled ? '#FFFFFF' : active ? C.ink2 : C.ink3,
                    fontSize: isTotalEntry ? 26 : 22,
                  },
                ]}>
                {filled ? dartLabel(d) : '·'}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={s.right}>
        <View style={{ alignItems: 'flex-end', marginRight: SP.sm }}>
          <Text style={[T.label, { color: C.ink3 }]}>Volée</Text>
          <Text style={[T.subtitle, { color: total > 0 ? C.ink : C.ink3 }]}>{total}</Text>
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
            SH.sm,
            {
              opacity: canUndo ? (pressed ? 0.7 : 1) : 0.35,
              backgroundColor: pressed ? C.cardHi2 : C.card,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Annuler la dernière fléchette">
          <Undo size={20} color={C.ink} />
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
  slots: { flexDirection: 'row', flex: 1, gap: 7 },
  slot: {
    flex: 1,
    height: 52,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: { flexDirection: 'row', alignItems: 'center' },
  undo: {
    width: 52,
    height: 52,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
