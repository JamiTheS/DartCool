/**
 * Tableaux de score. Trois formes, selon ce que le mode a besoin de montrer :
 * le reste géant du X01, la grille de marques du Cricket, les lignes de score
 * des autres modes. Le joueur au lancer est toujours en évidence.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { avg3, CricketState, fmt1, GenericState, X01State } from '../engine';
import { alpha, C, R, SP, T } from '../theme/tokens';
import { Chip, PlayerDot } from './ui';

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
      <View style={[s.hero, { borderColor: alpha(cur.color, 0.4), backgroundColor: alpha(cur.color, 0.07) }]}>
        <View style={s.heroTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <PlayerDot color={cur.color} size={12} />
            <Text numberOfLines={1} style={[T.title, { flex: 1 }]}>
              {cur.name.toUpperCase()}
            </Text>
          </View>
          {state.legsToWin > 1 || state.setsToWin > 1 ? (
            <Text style={T.label}>
              {state.setsToWin > 1 ? `${cur.sets} set · ` : ''}
              {cur.legs} manche{cur.legs > 1 ? 's' : ''}
            </Text>
          ) : (
            <Text style={T.label}>{state.start} · {state.outRule === 'double' ? 'double' : state.outRule === 'master' ? 'maître' : 'simple'}</Text>
          )}
        </View>

        <View style={s.heroMain}>
          <Text style={[T.hero, { color: cur.color }]}>{cur.score}</Text>
          <View style={s.heroSide}>
            <Text style={T.label}>Reste</Text>
            <Text style={[T.small, { marginTop: 6 }]}>
              {dartsLeft} fléchette{dartsLeft > 1 ? 's' : ''}
            </Text>
            <Text style={[T.small, { marginTop: 2 }]}>moy. {fmt1(avg3(cur.stat))}</Text>
            {cur.lastTurn !== null ? (
              <Text style={[T.small, { marginTop: 2 }]}>volée {cur.lastTurn}</Text>
            ) : null}
          </View>
        </View>

        {co ? (
          <View style={s.checkoutRow}>
            <Text style={[T.label, { color: C.green }]}>Sortie</Text>
            {co.map((step, i) => (
              <View key={`${step}-${i}`} style={s.coChip}>
                <Text style={[T.bodyStrong, { color: C.green, letterSpacing: 0.5 }]}>{step}</Text>
              </View>
            ))}
          </View>
        ) : showCheckout && cur.score > 170 ? (
          <View style={s.checkoutRow}>
            <Text style={[T.label, { color: C.chalkFaint }]}>Sortie possible à partir de 170</Text>
          </View>
        ) : showCheckout ? (
          <View style={s.checkoutRow}>
            <Text style={[T.label, { color: C.red }]}>
              {dartsLeft > 0 ? 'Aucune sortie avec ces fléchettes' : ''}
            </Text>
          </View>
        ) : null}
      </View>

      {others.length > 0 ? (
        <ScrollView
          horizontal={others.length > 3}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingTop: 6 }}
          style={{ marginTop: 2 }}>
          <View style={others.length > 3 ? { flexDirection: 'row', gap: 6 } : { gap: 6 }}>
            {others.map((p) => (
              <View
                key={p.id}
                style={[
                  s.otherRow,
                  others.length > 3 ? { minWidth: 150 } : null,
                  { borderLeftColor: p.color },
                ]}>
                <Text numberOfLines={1} style={[T.bodyStrong, { flex: 1 }]}>
                  {p.name}
                </Text>
                {state.legsToWin > 1 || state.setsToWin > 1 ? (
                  <Text style={[T.small, { marginRight: SP.sm }]}>
                    {state.setsToWin > 1 ? `${p.sets}s · ` : ''}
                    {p.legs}m
                  </Text>
                ) : null}
                <Text style={[T.num, { color: C.chalk }]}>{p.score}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

/* --------------------------------------------------------------- Cricket */

const MARK_GLYPH = ['·', '/', '✕', '⊗'];

export function CricketScoreboard({ state }: { state: CricketState }) {
  return (
    <View style={s.cricketWrap}>
      <View style={s.cricketHead}>
        <View style={{ flex: 1 }} />
        {state.targets.map((t) => (
          <Text key={t} style={[T.label, s.cricketCol, { color: C.chalkDim }]}>
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
              {
                borderLeftColor: active ? p.color : 'transparent',
                backgroundColor: active ? alpha(p.color, 0.08) : 'transparent',
              },
            ]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <PlayerDot color={p.color} size={8} />
              <Text numberOfLines={1} style={[active ? T.bodyStrong : T.body, { flex: 1 }]}>
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
                    { color: m >= 3 ? C.green : m > 0 ? C.chalk : C.chalkFaint, fontSize: 17 },
                  ]}>
                  {MARK_GLYPH[Math.min(3, m)]}
                </Text>
              );
            })}
            <Text style={[s.cricketPts, T.num, { color: active ? p.color : C.chalk }]}>
              {p.points}
            </Text>
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
      <View style={[s.hero, { borderColor: alpha(cur.color, 0.4), backgroundColor: alpha(cur.color, 0.07) }]}>
        <View style={s.heroTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <PlayerDot color={cur.color} size={12} />
            <Text numberOfLines={1} style={[T.title, { flex: 1 }]}>
              {cur.name.toUpperCase()}
            </Text>
          </View>
          {state.target ? <Chip label={`Cible ${state.target}`} tone={C.brass} strong /> : null}
        </View>

        <View style={s.heroMain}>
          <Text style={[T.score, { color: cur.color, fontSize: 72, lineHeight: 74 }]}>
            {cur.mainText ?? cur.main}
          </Text>
          <View style={s.heroSide}>
            <Text style={T.label}>{state.mainLabel}</Text>
            {cur.lines.map((l) => (
              <Text key={l.label} style={[T.small, { marginTop: 3 }]}>
                {l.label} {l.value}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {others.length > 0 ? (
        <View style={{ gap: 6, marginTop: 8 }}>
          {others.map((p) => (
            <View
              key={p.id}
              style={[
                s.otherRow,
                { borderLeftColor: p.color, opacity: p.out ? 0.45 : 1 },
              ]}>
              <Text numberOfLines={1} style={[T.bodyStrong, { flex: 1 }]}>
                {p.name}
              </Text>
              {p.lines.slice(0, 2).map((l) => (
                <Text key={l.label} style={[T.small, { marginRight: SP.sm }]}>
                  {l.label} {l.value}
                </Text>
              ))}
              <Text style={[T.num, { color: C.chalk }]}>{p.mainText ?? p.main}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    borderRadius: R.lg,
    borderWidth: 1,
    paddingHorizontal: SP.md,
    paddingTop: SP.sm,
    paddingBottom: SP.sm,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: SP.sm },
  heroMain: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroSide: { alignItems: 'flex-end', paddingBottom: 10 },
  checkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    minHeight: 26,
  },
  coChip: {
    borderWidth: 1,
    borderColor: alpha(C.green, 0.4),
    backgroundColor: alpha(C.green, 0.1),
    borderRadius: R.xs,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  otherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.panel,
    borderLeftWidth: 3,
    borderRadius: R.sm,
    paddingHorizontal: SP.sm,
    paddingVertical: 9,
  },
  cricketWrap: {
    backgroundColor: C.panel,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
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
    borderLeftWidth: 3,
    paddingVertical: 7,
    paddingLeft: 6,
    borderRadius: R.xs,
  },
  cricketCol: { width: 26, textAlign: 'center' },
  cricketPts: { width: 42, textAlign: 'right' },
});
