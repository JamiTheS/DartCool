/** Résultat de la partie : classement, statistiques, revanche. */
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { onGameFinished } from '@/ads';
import { BoardMark } from '@/components/BoardInput';
import { Trophy } from '@/components/icons';
import { Btn, Card, Divider, Label, Screen, TopBar } from '@/components/ui';
import { MODES } from '@/data/modes';
import { fmt0, fmt1, Match, PlayerMatchStats } from '@/engine';
import { useApp } from '@/store/app';
import { alpha, C, R, SH, SP, T } from '@/theme/tokens';

export default function Summary() {
  const { current, history, rematch, abandonMatch } = useApp();
  const match: Match | undefined = current?.finishedAt ? current : history[0];

  if (!match || !match.result) {
    return (
      <Screen>
        <TopBar title="Résultat" onBack={() => router.replace('/')} />
        <View style={{ padding: SP.lg }}>
          <Text style={T.body}>Aucune partie terminée à afficher.</Text>
        </View>
      </Screen>
    );
  }

  const mode = MODES[match.modeId];
  const result = match.result;
  const winner = result.ranking[0];
  const winnerColor =
    match.players.find((p) => p.id === winner.playerId)?.color ?? C.pink;

  /**
   * Sortie de l'écran Résultat : c'est le seul endroit de l'app où une pub
   * peut s'afficher, et seulement une partie sur trois (voir `src/ads`).
   * `onGameFinished` résout toujours, y compris sans pub, donc la navigation
   * suit dans tous les cas.
   */
  const leave = async (go: () => void) => {
    await onGameFinished(match.id);
    go();
  };

  const goRematch = () =>
    leave(() => {
      const m = rematch();
      if (m) router.replace('/match');
    });

  const goHome = () =>
    leave(() => {
      abandonMatch();
      router.replace('/');
    });

  return (
    <Screen>
      <TopBar
        title="Résultat"
        subtitle={match.title}
        onBack={goHome}
      />

      <ScrollView contentContainerStyle={{ padding: SP.md, paddingBottom: SP.xl, gap: SP.md }}>
        <View style={[s.winner, SH.md, { backgroundColor: alpha(winnerColor, 0.14) }]}>
          <View style={{ position: 'absolute', right: -14, top: -14, opacity: 0.12 }}>
            <BoardMark size={130} />
          </View>
          <Trophy size={26} color={winnerColor} />
          <Text style={[T.label, { marginTop: SP.sm }]}>Vainqueur</Text>
          <Text style={[T.title, { fontSize: 40, color: C.ink, marginTop: -2 }]}>
            {winner.name.toUpperCase()}
          </Text>
          <Text style={[T.body, { color: C.ink }]}>{winner.score}</Text>
        </View>

        <Card>
          <Label>Classement</Label>
          <View style={{ marginTop: SP.sm }}>
            {result.ranking.map((r, i) => {
              const color = match.players.find((p) => p.id === r.playerId)?.color ?? C.ink2;
              return (
                <View key={r.playerId}>
                  <View style={s.rankRow}>
                    <Text style={[T.num, { width: 26, color: i === 0 ? C.pink : C.ink3 }]}>
                      {i + 1}
                    </Text>
                    <Text style={[T.bodyStrong, { flex: 1, color }]}>{r.name}</Text>
                    <Text style={T.num}>{r.score}</Text>
                  </View>
                  {i < result.ranking.length - 1 ? <Divider /> : null}
                </View>
              );
            })}
          </View>
        </Card>

        {result.ranking.map((r) => {
          const st = result.stats[r.playerId];
          if (!st) return null;
          const color = match.players.find((p) => p.id === r.playerId)?.color ?? C.ink2;
          return <StatCard key={r.playerId} name={r.name} color={color} st={st} x01={match.modeId === 'x01'} />;
        })}

        <View style={{ gap: SP.xs }}>
          <Btn label="Revanche" onPress={goRematch} big />
          <Btn label="Changer de mode" variant="ghost" onPress={goHome} />
        </View>

        <Text style={[T.small, { textAlign: 'center', color: C.ink3 }]}>
          {mode.name} · {new Date(match.finishedAt ?? match.startedAt).toLocaleString('fr-FR')}
        </Text>
      </ScrollView>
    </Screen>
  );
}

function StatCard({
  name,
  color,
  st,
  x01,
}: {
  name: string;
  color: string;
  st: PlayerMatchStats;
  x01: boolean;
}) {
  const cells: { label: string; value: string }[] = [
    { label: 'Fléchettes', value: String(st.darts) },
    { label: 'Moy. / 3 fl.', value: fmt1(st.avg3) },
    { label: 'Meilleure volée', value: fmt0(st.highTurn) },
    { label: 'Doubles', value: String(st.doublesHit) },
    { label: 'Triples', value: String(st.triplesHit) },
    { label: 'Bulls', value: String(st.bullsHit) },
  ];
  if (x01) {
    cells.push(
      { label: '180 / 140+ / 100+', value: `${st.c180} / ${st.c140} / ${st.c100}` },
      { label: 'Moy. 9 premières', value: fmt1(st.avgFirst9) },
      { label: '% doubles', value: st.checkoutPct === null ? '—' : `${st.checkoutPct.toFixed(0)} %` },
      { label: 'Meilleure manche', value: st.bestLegDarts === null ? '—' : `${st.bestLegDarts} fl.` },
      { label: 'Plus haute sortie', value: st.highFinish ? String(st.highFinish) : '—' }
    );
  }
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={T.bodyStrong}>{name}</Text>
      </View>
      <View style={s.statGrid}>
        {cells.map((c) => (
          <View key={c.label} style={s.statCell}>
            <Text style={[T.label, { fontSize: 10 }]}>{c.label}</Text>
            <Text style={[T.num, { marginTop: 1 }]}>{c.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  winner: {
    borderRadius: R.xl,
    padding: SP.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: SP.sm },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SP.sm },
  statCell: { width: '33.33%', paddingVertical: 6, paddingRight: 6 },
});
