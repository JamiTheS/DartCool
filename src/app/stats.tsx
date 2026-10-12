/** Statistiques de carrière et historique des parties. */
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Empty, Label, Screen, Segmented, Sheet, TopBar } from '@/components/ui';
import { MODES } from '@/data/modes';
import { aggregate } from '@/engine/aggregate';
import { fmt0, fmt1, Match } from '@/engine';
import { useApp } from '@/store/app';
import { C, R, SP, T } from '@/theme/tokens';
import { tapLight } from '@/utils/feedback';

export default function Stats() {
  const { history, players, clearHistory } = useApp();
  const [tab, setTab] = useState<string | number | boolean>('joueurs');
  const [detail, setDetail] = useState<Match | null>(null);

  const stats = useMemo(() => aggregate(history, players), [history, players]);

  return (
    <Screen>
      <TopBar title="Statistiques" subtitle={`${history.length} parties`} onBack={() => router.back()} />

      <View style={{ paddingHorizontal: SP.md, paddingBottom: SP.sm }}>
        <Segmented
          items={[
            { value: 'joueurs', label: 'Joueurs' },
            { value: 'parties', label: 'Parties' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.md, paddingTop: 0, paddingBottom: SP.xl, gap: SP.sm }}>
        {tab === 'joueurs' ? (
          stats.length === 0 || history.length === 0 ? (
            <Empty title="Rien à mesurer" text="Les statistiques apparaissent après la première partie terminée." />
          ) : (
            stats.map((st) => (
              <Card key={st.playerId} tone={st.matches > 0 ? st.color : undefined}>
                <View style={s.head}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: st.color }} />
                    <Text style={T.subtitle}>{st.name}</Text>
                  </View>
                  <Text style={[T.num, { color: st.color }]}>
                    {st.wins}/{st.matches}
                  </Text>
                </View>
                <View style={s.grid}>
                  <Cell label="Victoires" value={st.winPct === null ? '—' : `${st.winPct.toFixed(0)} %`} />
                  <Cell label="Moy. X01" value={fmt1(st.avgX01)} />
                  <Cell label="Meilleure moy." value={fmt1(st.bestAvgX01)} />
                  <Cell label="Meilleure volée" value={fmt0(st.highTurn)} />
                  <Cell label="180" value={String(st.c180)} />
                  <Cell label="140+" value={String(st.c140)} />
                  <Cell label="100+" value={String(st.c100)} />
                  <Cell label="Doubles" value={String(st.doubles)} />
                  <Cell label="Triples" value={String(st.triples)} />
                  <Cell label="Bulls" value={String(st.bulls)} />
                  <Cell
                    label="Meilleure manche"
                    value={st.bestLegDarts === null ? '—' : `${st.bestLegDarts} fl.`}
                  />
                  <Cell label="Plus haute sortie" value={st.highFinish ? String(st.highFinish) : '—'} />
                </View>
                {st.favouriteMode ? (
                  <Text style={[T.small, { marginTop: SP.xs, color: C.ink3 }]}>
                    Mode favori : {MODES[st.favouriteMode].name} ({st.perMode[st.favouriteMode]?.played} parties)
                  </Text>
                ) : null}
              </Card>
            ))
          )
        ) : history.length === 0 ? (
          <Empty title="Aucune partie" text="L’historique garde les 60 dernières parties terminées." />
        ) : (
          <>
            {history.map((m) => (
              <Pressable
                key={m.id}
                onPress={() => {
                  tapLight();
                  setDetail(m);
                }}
                style={({ pressed }) => [s.row, { backgroundColor: pressed ? C.cardHi2 : C.card }]}>
                <View style={{ flex: 1 }}>
                  <Text style={T.bodyStrong}>{m.title}</Text>
                  <Text style={[T.small, { marginTop: 2 }]}>
                    {new Date(m.finishedAt ?? m.startedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {m.players.length} joueur{m.players.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Label>Vainqueur</Label>
                  <Text style={[T.bodyStrong, { color: C.pink }]}>
                    {m.result?.ranking[0]?.name ?? '—'}
                  </Text>
                </View>
              </Pressable>
            ))}
            <Pressable
              onPress={clearHistory}
              style={{ paddingVertical: SP.md, alignItems: 'center' }}
              accessibilityRole="button">
              <Text style={[T.small, { color: C.danger }]}>Effacer l’historique</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <Sheet visible={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.title ?? ''}>
        {detail?.result ? (
          <View>
            {detail.result.ranking.map((r, i) => {
              const st = detail.result?.stats[r.playerId];
              return (
                <View key={r.playerId} style={{ marginBottom: SP.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[T.num, { width: 24, color: i === 0 ? C.pink : C.ink3 }]}>{i + 1}</Text>
                    <Text style={[T.bodyStrong, { flex: 1 }]}>{r.name}</Text>
                    <Text style={T.num}>{r.score}</Text>
                  </View>
                  {st ? (
                    <Text style={[T.small, { marginLeft: 24, marginTop: 2 }]}>
                      {st.darts} fléchettes · moy. {fmt1(st.avg3)} · meilleure volée {st.highTurn}
                    </Text>
                  ) : null}
                </View>
              );
            })}
            <Text style={[T.small, { color: C.ink3 }]}>
              {MODES[detail.modeId].name} ·{' '}
              {new Date(detail.finishedAt ?? detail.startedAt).toLocaleString('fr-FR')}
            </Text>
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.cell}>
      <Text style={[T.label, { fontSize: 10 }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[T.num, { marginTop: 1 }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: SP.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SP.sm },
  cell: { width: '33.33%', paddingVertical: 6, paddingRight: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    padding: SP.md,
    gap: SP.sm,
  },
});
