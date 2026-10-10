/** Accueil : reprise de partie, choix du mode, accès au carnet et aux stats. */
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BoardMark } from '@/components/BoardInput';
import { Chart, Book, Gear, Users } from '@/components/icons';
import { Card, Label, Screen } from '@/components/ui';
import { MODES, PRESETS, Preset } from '@/data/modes';
import { runMatch } from '@/engine';
import { useApp } from '@/store/app';
import { alpha, C, R, SP, T } from '@/theme/tokens';
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
      <ScrollView contentContainerStyle={{ paddingBottom: SP.xl }} showsVerticalScrollIndicator={false}>
        <View style={s.brandRow}>
          <BoardMark size={58} />
          <View style={{ marginLeft: SP.md, flex: 1 }}>
            <Text style={s.brand}>DARTCOOL</Text>
            <Text style={[T.small, { marginTop: -2 }]}>
              Le carnet de scores de toutes les fléchettes
            </Text>
          </View>
        </View>

        {resume && resumeState ? (
          <Pressable
            onPress={() => {
              tapMedium();
              router.push('/match');
            }}
            style={({ pressed }) => [s.resume, { opacity: pressed ? 0.85 : 1 }]}>
            <View style={{ flex: 1 }}>
              <Label style={{ color: C.onBrass }}>Reprendre la partie</Label>
              <Text style={[T.subtitle, { color: C.onBrass, marginTop: 2 }]}>{resume.title}</Text>
              <Text style={[T.small, { color: alpha(C.onBrass, 0.75), marginTop: 2 }]}>
                {resume.players.map((p) => p.name).join(' · ')} — {resumeState.headline}
              </Text>
            </View>
            <Text style={[T.score, { color: C.onBrass, fontSize: 40 }]}>›</Text>
          </Pressable>
        ) : null}

        <View style={s.sectionHead}>
          <Label>Modes de jeu</Label>
          <Text style={[T.small, { color: C.chalkFaint }]}>{PRESETS.length} formats</Text>
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
                  {
                    backgroundColor: pressed ? C.panelHigher : C.panel,
                    borderColor: p.featured ? alpha(C.brass, 0.45) : C.line,
                  },
                ]}>
                <Text
                  style={[
                    T.title,
                    { fontSize: 30, color: p.featured ? C.brass : C.chalkDim, letterSpacing: 0 },
                  ]}>
                  {p.glyph}
                </Text>
                <Text style={[T.bodyStrong, { marginTop: 4 }]} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={[T.small, { color: C.chalkFaint }]} numberOfLines={1}>
                  {p.sub}
                </Text>
                <Text style={[T.small, { color: C.chalkFaint, marginTop: 6, fontSize: 11 }]} numberOfLines={2}>
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
            icon={<Users color={C.chalk} />}
            label="Joueurs"
            value={players.length ? `${players.length}` : '—'}
            onPress={() => router.push('/players')}
          />
          <NavBtn
            icon={<Chart color={C.chalk} />}
            label="Stats"
            value={history.length ? `${history.length}` : '—'}
            onPress={() => router.push('/stats')}
          />
          <NavBtn icon={<Book color={C.chalk} />} label="Règles" onPress={() => router.push('/rules')} />
          <NavBtn icon={<Gear color={C.chalk} />} label="Réglages" onPress={() => router.push('/settings')} />
        </View>

        {history.length > 0 ? (
          <Card style={{ marginHorizontal: SP.md, marginTop: SP.md }}>
            <Label>Dernière partie</Label>
            <Text style={[T.bodyStrong, { marginTop: 4 }]}>{history[0].title}</Text>
            <Text style={[T.small, { marginTop: 2 }]}>
              {history[0].result?.ranking.map((r, i) => `${i + 1}. ${r.name} ${r.score}`).join('   ')}
            </Text>
          </Card>
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
      style={({ pressed }) => [s.nav, { backgroundColor: pressed ? C.panelHigher : C.panel }]}>
      {icon}
      <Text style={[T.small, { color: C.chalk, marginTop: 6, fontWeight: '700' }]}>{label}</Text>
      {value ? <Text style={[T.small, { color: C.chalkFaint, fontSize: 11 }]}>{value}</Text> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.md,
    paddingTop: SP.sm,
    paddingBottom: SP.md,
  },
  brand: {
    fontFamily: T.title.fontFamily,
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: 2,
    color: C.chalk,
  },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.brass,
    marginHorizontal: SP.md,
    borderRadius: R.md,
    padding: SP.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: SP.md,
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
    borderRadius: R.md,
    borderWidth: 1,
    padding: SP.md,
    minHeight: 124,
  },
  navRow: { flexDirection: 'row', gap: SP.xs, paddingHorizontal: SP.md },
  nav: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SP.md,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
  },
});
