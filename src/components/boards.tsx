/**
 * Tableaux de score. Compacts par construction : sur l'écran de partie, c'est
 * la cible qui doit prendre la place. Le joueur au lancer est en évidence, les
 * autres tiennent sur une ligne.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { avg3, CricketState, fmt1, GenericState, X01State } from '../engine';
import { alpha, C, R, SH, SP, T } from '../theme/tokens';
import { PlayerDot } from './ui';

/* ------------------------------------------------------------------- X01 */

export function X01Scoreboard({
  state,
  showCheckout,
}: {
  state: X01State;
  showCheckout: boolean;
}) {
  const cur = state.players[state.turnIdx];
  const others = state.players.filter((p) => p.idx !== cur.idx);
  const dartsLeft = 3 - state.dartsInTurn;
  const co = showCheckout ? state.checkout : null;

  return (
    <View>
      <View style={s.hero}>
        <View style={{ flex: 1 }}>
          <Text style={T.label}>Au lancer</Text>
          <View style={s.whoRow}>
            <PlayerDot color={cur.color} size={11} />
            <Text numberOfLines={1} style={[T.bodyStrong, { fontSize: 17 }]}>
              {cur.name}
            </Text>
          </View>
          <Text style={[T.small, { color: C.ink3, marginTop: 2 }]}>
            {state.legsToWin > 1 || state.setsToWin > 1
              ? `${state.setsToWin > 1 ? `${cur.sets} set · ` : ''}${cur.legs} manche${cur.legs > 1 ? 's' : ''} · `
              : ''}
            moy. {fmt1(avg3(cur.stat))}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[T.hero, { fontSize: 76, lineHeight: 72, color: C.ink }]}>{cur.score}</Text>
          <Text style={[T.small, { color: C.ink3, marginTop: 2 }]}>
            {dartsLeft} fléchette{dartsLeft > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={s.outRow}>
        {co ? (
          <>
            <Text style={[T.label, { color: C.pinkInk }]}>Sortie</Text>
            {co.map((step, i) => (
              <View key={`${step}-${i}`} style={s.coChip}>
                <Text style={[T.subtitle, { color: C.pinkInk, fontSize: 16 }]}>{step}</Text>
              </View>
            ))}
          </>
        ) : showCheckout && cur.score > 170 ? (
          <Text style={[T.label, { color: C.ink3 }]}>Sortie possible à partir de 170</Text>
        ) : showCheckout && dartsLeft > 0 ? (
          <Text style={[T.label, { color: C.danger }]}>Aucune sortie avec ces fléchettes</Text>
        ) : null}
      </View>

      {others.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.othersRow}>
          {others.map((p) => (
            <View key={p.id} style={[s.oth, SH.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <PlayerDot color={p.color} size={7} />
                <Text numberOfLines={1} style={[T.small, { color: C.ink2, maxWidth: 86 }]}>
                  {p.name}
                </Text>
              </View>
              <Text style={[T.subtitle, { fontSize: 23, marginTop: -1 }]}>{p.score}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

/* --------------------------------------------------------------- Cricket */

const MARK_GLYPH = ['·', '/', '✕', '⊗'];

export function CricketScoreboard({ state }: { state: CricketState }) {
  return (
    <View style={[s.cricketWrap, SH.sm]}>
      <View style={s.cricketHead}>
        <View style={{ flex: 1 }} />
        {state.targets.map((t) => (
          <Text key={t} style={[T.label, s.cricketCol]}>
            {t === 25 ? 'B' : t}
          </Text>
        ))}
        <Text style={[T.label, s.cricketPts]}>PTS</Text>
      </View>

      {state.players.map((p) => {
        const active = p.idx === state.turnIdx;
        return (
          <View
            key={p.id}
            style={[
              s.cricketRow,
              active ? { backgroundColor: alpha(p.color, 0.14) } : null,
            ]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <PlayerDot color={p.color} size={8} />
              <Text numberOfLines={1} style={[active ? T.bodyStrong : T.body, { flex: 1, fontSize: 14 }]}>
                {p.name}
              </Text>
            </View>
            {state.targets.map((t) => {
              const m = p.marks[t] ?? 0;
              return (
                <Text
                  key={t}
                  style={[
                    s.cricketCol,
                    T.num,
                    { color: m >= 3 ? C.ok : m > 0 ? C.ink : C.ink3, fontSize: 16 },
                  ]}>
                  {MARK_GLYPH[Math.min(3, m)]}
                </Text>
              );
            })}
            <Text style={[s.cricketPts, T.num, { color: C.ink }]}>{p.points}</Text>
          </View>
        );
      })}
    </View>
  );
}

/* --------------------------------------------------------------- Générique */

export function GenericScoreboard({ state }: { state: GenericState }) {
  const cur = state.players[state.turnIdx];
  const others = state.players.filter((p) => p.idx !== cur.idx);

  return (
    <View>
      <View style={s.hero}>
        <View style={{ flex: 1 }}>
          <Text style={T.label}>Au lancer</Text>
          <View style={s.whoRow}>
            <PlayerDot color={cur.color} size={11} />
            <Text numberOfLines={1} style={[T.bodyStrong, { fontSize: 17 }]}>
              {cur.name}
            </Text>
          </View>
          {state.target ? (
            <View style={[s.target, { backgroundColor: C.pinkSoft }]}>
              <Text style={[T.bodyStrong, { color: C.pinkInk, fontSize: 13 }]}>
                Cible {state.target}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[T.hero, { fontSize: 64, lineHeight: 62 }]}>{cur.mainText ?? cur.main}</Text>
          <Text style={[T.label, { marginTop: 2 }]}>{state.mainLabel}</Text>
        </View>
      </View>

      {others.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.othersRow}>
          {others.map((p) => (
            <View key={p.id} style={[s.oth, SH.sm, { opacity: p.out ? 0.45 : 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <PlayerDot color={p.color} size={7} />
                <Text numberOfLines={1} style={[T.small, { color: C.ink2, maxWidth: 86 }]}>
                  {p.name}
                </Text>
              </View>
              <Text style={[T.subtitle, { fontSize: 23, marginTop: -1 }]}>
                {p.mainText ?? p.main}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: SP.xs },
  whoRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 3 },
  outRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
    paddingHorizontal: SP.xs,
    marginTop: 2,
  },
  coChip: {
    backgroundColor: C.pinkSoft,
    borderRadius: R.xs,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  othersRow: { gap: 7, paddingVertical: 6, paddingHorizontal: SP.xs },
  oth: {
    backgroundColor: C.card,
    borderRadius: R.sm,
    paddingHorizontal: 11,
    paddingVertical: 7,
    minWidth: 104,
  },
  target: { alignSelf: 'flex-start', borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 },
  cricketWrap: {
    backgroundColor: C.card,
    borderRadius: R.md,
    paddingHorizontal: SP.sm,
    paddingVertical: SP.xs,
  },
  cricketHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  cricketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: R.xs,
  },
  cricketCol: { width: 25, textAlign: 'center' },
  cricketPts: { width: 40, textAlign: 'right' },
});
