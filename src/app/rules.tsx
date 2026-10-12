/**
 * Règles de tous les modes, lexique, et table des sorties.
 * La table est calculée par le même solveur que celui de la partie : ce qui
 * est affiché ici est exactement ce que l'app conseille en jeu.
 */
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChevronRight } from '@/components/icons';
import { Card, Divider, Label, Screen, Segmented, TopBar } from '@/components/ui';
import { MODES } from '@/data/modes';
import { checkout, ModeId } from '@/engine';
import { alpha, C, R, SP, T } from '@/theme/tokens';
import { tapLight } from '@/utils/feedback';

const LEXIQUE: { term: string; def: string }[] = [
  { term: 'Volée', def: 'Les trois fléchettes d’un joueur, à la suite. On dit aussi « un tour ».' },
  { term: 'Bust', def: 'Volée qui fait passer le score sous zéro, ou qui laisse 1 en sortie double : le score revient à sa valeur du début de volée.' },
  { term: 'Sortie (checkout)', def: 'La façon de tomber à zéro. En sortie double, la dernière fléchette doit être un double.' },
  { term: 'Manche (leg)', def: 'Une descente complète, de 501 à 0 par exemple. Un set est un paquet de manches.' },
  { term: 'Marque', def: 'Au Cricket, une unité sur une cible : un simple = 1, un double = 2, un triple = 3.' },
  { term: 'Moyenne à 3 fléchettes', def: 'Points marqués divisés par le nombre de fléchettes, multiplié par trois. La référence pour se comparer.' },
  { term: '180', def: 'Le maximum d’une volée : trois triples 20. Le 170 (T20-T20-bull) est la plus haute sortie possible.' },
  { term: 'Bull', def: 'Le centre. L’anneau extérieur vaut 25, le cœur vaut 50 et compte comme un double.' },
];

export default function Rules() {
  const [tab, setTab] = useState<string | number | boolean>('modes');
  const [open, setOpen] = useState<ModeId | null>(null);

  const outs = useMemo(() => {
    const rows: { n: number; path: string[] }[] = [];
    for (let n = 170; n >= 2; n -= 1) {
      const p = checkout(n, 3, 'double');
      if (p) rows.push({ n, path: p });
    }
    return rows;
  }, []);

  return (
    <Screen>
      <TopBar title="Règles" subtitle="Modes, lexique et sorties" onBack={() => router.back()} />

      <View style={{ paddingHorizontal: SP.md, paddingBottom: SP.sm }}>
        <Segmented
          items={[
            { value: 'modes', label: 'Modes' },
            { value: 'lexique', label: 'Lexique' },
            { value: 'sorties', label: 'Sorties' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.md, paddingTop: 0, paddingBottom: SP.xl, gap: SP.sm }}>
        {tab === 'modes'
          ? (Object.keys(MODES) as ModeId[]).map((id) => {
              const m = MODES[id];
              const isOpen = open === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => {
                    tapLight();
                    setOpen(isOpen ? null : id);
                  }}
                  style={({ pressed }) => [
                    s.modeCard,
                    { backgroundColor: pressed ? C.cardHi2 : C.card, borderColor: isOpen ? alpha(C.pink, 0.4) : C.line },
                  ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={T.subtitle}>{m.name}</Text>
                      <Text style={[T.small, { marginTop: 1 }]}>{m.tagline}</Text>
                    </View>
                    <View style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}>
                      <ChevronRight size={18} color={C.ink3} />
                    </View>
                  </View>
                  {isOpen ? (
                    <View style={{ marginTop: SP.sm }}>
                      <Divider style={{ marginBottom: SP.sm }} />
                      {m.rules.map((r, i) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
                          <Text style={[T.num, { color: C.pink, width: 20, fontSize: 15 }]}>{i + 1}</Text>
                          <Text style={[T.body, { flex: 1, color: C.ink }]}>{r}</Text>
                        </View>
                      ))}
                      <Text style={[T.small, { color: C.ink3, marginTop: 4 }]}>
                        {m.minPlayers === 1 ? 'Jouable en solo' : `${m.minPlayers} joueurs minimum`} ·{' '}
                        {m.maxPlayers} au maximum
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })
          : null}

        {tab === 'lexique'
          ? LEXIQUE.map((l) => (
              <Card key={l.term}>
                <Text style={T.bodyStrong}>{l.term}</Text>
                <Text style={[T.body, { marginTop: 2 }]}>{l.def}</Text>
              </Card>
            ))
          : null}

        {tab === 'sorties' ? (
          <View>
            <Card tone={C.ok}>
              <Label>Table des sorties</Label>
              <Text style={[T.small, { marginTop: 4 }]}>
                Reste par reste, le chemin conseillé en sortie double, de 170 (la plus haute sortie
                possible) jusqu’à 2. Les restes absents ne se terminent pas en trois fléchettes.
              </Text>
            </Card>
            <View style={{ marginTop: SP.sm }}>
              {outs.map((o) => (
                <View key={o.n} style={s.outRow}>
                  <Text style={[T.num, { width: 44, color: C.pink }]}>{o.n}</Text>
                  <Text style={[T.body, { color: C.ink, flex: 1 }]}>{o.path.join('  ·  ')}</Text>
                  <Text style={[T.label, { width: 30, textAlign: 'right' }]}>
                    {o.path.length} fl
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  modeCard: { borderRadius: R.md, borderWidth: 1, padding: SP.md },
  outRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: SP.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    gap: SP.sm,
  },
});
