/** Accueil : reprise de partie, choix du format, accès au carnet et aux stats. */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BoardMark } from '@/components/BoardInput';
import { Book, Chart, ChevronRight, Gear, Users } from '@/components/icons';
import { Label, Screen } from '@/components/ui';
import { MODES, PRESETS, Preset } from '@/data/modes';
import { runMatch } from '@/engine';
import { useApp } from '@/store/app';
import { C, R, SH, SP, T } from '@/theme/tokens';
import { tapMedium } from '@/utils/feedback';

export default function Home() {
  const { current, players, history } = useApp();
  const resume = current && !current.finishedAt ? current : null;
  const resumeState = resume ? runMatch(resume) : null;

  const open = (p: Preset) => {
    tapMedium();
    router.push({ pathname: '/setup', params: { preset: p.id } });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: SP.xxl }} showsVerticalScrollIndicator={false}>
        <View style={s.brandRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.brand}>
              DART<Text style={{ color: C.pinkInk }}>COOL</Text>
            </Text>
            <Text style={[T.small, { color: C.ink3, marginTop: -2 }]}>
              Le carnet de scores de toutes les fléchettes
            </Text>
          </View>
          <View style={s.mark}>
            <BoardMark size={46} />
          </View>
        </View>

        {resume && resumeState ? (
          <Pressable
            onPress={() => {
              tapMedium();
              router.push('/match');
            }}
            style={({ pressed }) => [s.resume, SH.md, { opacity: pressed ? 0.9 : 1 }]}>
            <View style={[s.resumeBar, { backgroundColor: C.pink }]} />
            <View style={{ flex: 1 }}>
              <Label style={{ color: C.pinkInk }}>Partie en cours</Label>
              <Text style={[T.bodyStrong, { fontSize: 16, marginTop: 2 }]}>{resume.title}</Text>
              <Text style={[T.small, { color: C.ink3, marginTop: 1 }]} numberOfLines={1}>
                {resume.players.map((p) => p.name).join(' · ')} — {resumeState.headline}
              </Text>
            </View>
            <ChevronRight size={20} color={C.ink3} />
          </Pressable>
        ) : null}

        <View style={s.sectionHead}>
          <Label>Formats</Label>
          <Text style={[T.small, { color: C.ink3 }]}>{PRESETS.length} au choix</Text>
        </View>

        <View style={s.grid}>
          {PRESETS.map((p) => {
            const mode = MODES[p.modeId];
            return (
              <Pressable
                key={p.id}
                onPress={() => open(p)}
                style={({ pressed }) => [
                  s.tile,
                  SH.sm,
                  {
                    backgroundColor: pressed ? C.cardHi2 : p.featured ? C.pinkSoft : C.card,
                  },
                ]}>
                <Text
                  style={[
                    T.title,
                    { fontSize: 32, color: p.featured ? C.pinkInk : C.ink, letterSpacing: 0 },
                  ]}>
                  {p.glyph}
                </Text>
                <Text style={[T.bodyStrong, { marginTop: 5, fontSize: 14 }]} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={[T.small, { color: C.ink3, fontSize: 12 }]} numberOfLines={1}>
                  {p.sub}
                </Text>
                <Text style={[T.small, { color: C.ink3, marginTop: 5, fontSize: 11 }]} numberOfLines={2}>
                  {mode.tagline}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={s.sectionHead}>
          <Label>Le carnet</Label>
        </View>
        <View style={s.navRow}>
          <NavBtn
            icon={<Users color={C.ink} size={20} />}
            label="Joueurs"
            value={players.length ? `${players.length}` : '—'}
            onPress={() => router.push('/players')}
          />
          <NavBtn
            icon={<Chart color={C.ink} size={20} />}
            label="Stats"
            value={history.length ? `${history.length}` : '—'}
            onPress={() => router.push('/stats')}
          />
          <NavBtn icon={<Book color={C.ink} size={20} />} label="Règles" onPress={() => router.push('/rules')} />
          <NavBtn icon={<Gear color={C.ink} size={20} />} label="Réglages" onPress={() => router.push('/settings')} />
        </View>

        {history.length > 0 && history[0].result ? (
          <View style={[s.last, SH.sm]}>
            <Label>Dernière partie</Label>
            <Text style={[T.bodyStrong, { marginTop: 4 }]}>{history[0].title}</Text>
            <Text style={[T.small, { marginTop: 2, color: C.ink3 }]} numberOfLines={2}>
              {history[0].result.ranking.map((r, i) => `${i + 1}. ${r.name} ${r.score}`).join('   ')}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function NavBtn({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        tapMedium();
        onPress();
      }}
      style={({ pressed }) => [s.nav, SH.sm, { backgroundColor: pressed ? C.cardHi2 : C.card }]}>
      {icon}
      <Text style={[T.small, { color: C.ink, marginTop: 5, fontWeight: '700', fontSize: 12 }]}>
        {label}
      </Text>
      {value ? <Text style={[T.small, { color: C.ink3, fontSize: 11 }]}>{value}</Text> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.lg,
    paddingTop: SP.sm,
    paddingBottom: SP.md,
  },
  brand: {
    fontFamily: T.title.fontFamily,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: 1,
    color: C.ink,
  },
  mark: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    ...SH.sm,
  },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.sm,
    backgroundColor: C.card,
    marginHorizontal: SP.md,
    borderRadius: R.lg,
    padding: SP.md,
  },
  resumeBar: { width: 3, height: 38, borderRadius: 2 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: SP.lg,
    paddingTop: SP.lg,
    paddingBottom: SP.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SP.xs,
    paddingHorizontal: SP.md,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: R.lg,
    padding: SP.md,
    minHeight: 118,
  },
  navRow: { flexDirection: 'row', gap: SP.xs, paddingHorizontal: SP.md },
  nav: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SP.md,
    borderRadius: R.md,
  },
  last: {
    marginHorizontal: SP.md,
    marginTop: SP.md,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: SP.md,
  },
});
