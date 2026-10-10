/**
 * Écran de partie. Trois zones immuables : le tableau de score en haut, les
 * trois fléchettes de la volée au milieu, la saisie en bas sous le pouce.
 * Rien ne bouge d'un mode à l'autre : seules la zone de score et les cibles
 * éclairées changent.
 */
import { router } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BoardInput } from '@/components/BoardInput';
import { CricketScoreboard, GenericScoreboard, X01Scoreboard } from '@/components/boards';
import { DartPad } from '@/components/DartPad';
import { Dots } from '@/components/icons';
import { ThrowTray } from '@/components/ThrowTray';
import { TotalPad } from '@/components/TotalPad';
import { Btn, Divider, Label, Screen, Sheet, TopBar } from '@/components/ui';
import { MODES } from '@/data/modes';
import { Dart, label as dartLabel, MISS, runMatch } from '@/engine';
import { useApp } from '@/store/app';
import { alpha, C, R, SP, T } from '@/theme/tokens';
import { tapError, tapMedium, tapSuccess } from '@/utils/feedback';

type InputMode = 'pad' | 'board' | 'total';

export default function MatchScreen() {
  const { current, settings, pushDart, undoDart, finishMatch, abandonMatch } = useApp();
  const [input, setInput] = useState<InputMode>(settings.inputMode);
  const [menu, setMenu] = useState(false);
  const [rules, setRules] = useState(false);
  const [quit, setQuit] = useState(false);
  const [turnsSheet, setTurnsSheet] = useState(false);
  const [inputBox, setInputBox] = useState({ w: 0, h: 0 });
  const lastFlash = useRef<string | null>(null);

  // L'écran reste allumé pendant la partie : personne ne veut déverrouiller
  // son téléphone entre deux volées.
  useEffect(() => {
    if (!settings.keepAwake) return;
    activateKeepAwakeAsync().catch(() => {});
    return () => {
      try {
        deactivateKeepAwake();
      } catch {
        // sans conséquence
      }
    };
  }, [settings.keepAwake]);

  useEffect(() => {
    if (!current) router.replace('/');
  }, [current]);

  const state = useMemo(() => (current ? runMatch(current) : null), [current]);

  // Fin de partie : on archive et on affiche le résultat.
  useEffect(() => {
    if (!state?.finished) return;
    tapSuccess();
    finishMatch();
    router.replace('/summary');
  }, [state?.finished, finishMatch]);

  // Retour haptique sur les événements marquants.
  useEffect(() => {
    const f = state?.flash;
    if (!f) {
      lastFlash.current = null;
      return;
    }
    if (lastFlash.current === f.text) return;
    lastFlash.current = f.text;
    if (f.kind === 'bust' || f.kind === 'out') tapError();
    else if (f.kind === 'win' || f.kind === 'leg' || f.kind === 'big') tapSuccess();
  }, [state?.flash]);

  if (!current || !state) return <Screen />;

  const mode = MODES[current.modeId];
  const cur = state.players[state.turnIdx];
  const onDart = (d: Dart) => pushDart(d);

  const skipTurn = () => {
    tapMedium();
    const left = 3 - state.dartsInTurn;
    for (let i = 0; i < left; i += 1) pushDart(MISS);
    setMenu(false);
  };

  const doQuit = () => {
    abandonMatch();
    router.replace('/');
  };

  const onInputLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setInputBox({ w: width, h: height });
  };

  const boardSize = Math.max(180, Math.min(inputBox.w, inputBox.h - 46));
  const flash = state.flash;
  const statusColor =
    flash?.kind === 'bust' || flash?.kind === 'out'
      ? C.red
      : flash?.kind === 'win' || flash?.kind === 'leg'
        ? C.green
        : flash?.kind === 'big'
          ? C.brass
          : C.chalkDim;

  return (
    <Screen>
      <TopBar
        title={mode.name}
        subtitle={state.headline}
        onBack={() => {
          if (settings.confirmQuit && current.darts.length > 0) setQuit(true);
          else doQuit();
        }}
        right={
          <Pressable onPress={() => setMenu(true)} hitSlop={12} accessibilityLabel="Menu de la partie">
            <Dots color={C.chalkDim} />
          </Pressable>
        }
      />

      <View style={{ paddingHorizontal: SP.md }}>
        {state.kind === 'x01' ? (
          <X01Scoreboard state={state} showCheckout={settings.showCheckout} />
        ) : state.kind === 'cricket' ? (
          <CricketScoreboard state={state} />
        ) : (
          <GenericScoreboard state={state} />
        )}
      </View>

      <View style={s.status}>
        <Text numberOfLines={1} style={[T.small, { color: statusColor, fontWeight: '700', flex: 1 }]}>
          {flash?.text ?? state.hint ?? `Au lancer : ${cur.name}`}
        </Text>
        {state.target && state.kind !== 'generic' ? (
          <Text style={[T.label, { color: C.brass }]}>CIBLE {state.target}</Text>
        ) : null}
      </View>

      <ThrowTray
        darts={state.turnDarts}
        onUndo={undoDart}
        canUndo={current.darts.length > 0}
        accent={cur.color}
      />

      <View style={s.inputArea} onLayout={onInputLayout}>
        {input === 'pad' ? (
          <DartPad onDart={onDart} focus={state.focus} focusMult={state.focusMult} />
        ) : input === 'board' ? (
          <ScrollView contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            <BoardInput
              onDart={onDart}
              focus={state.focus}
              focusMult={state.focusMult}
              size={boardSize}
            />
          </ScrollView>
        ) : (
          <TotalPad
            onDart={onDart}
            max={state.kind === 'x01' ? state.players[state.turnIdx].score : undefined}
          />
        )}
      </View>

      <View style={s.switchRow}>
        {([
          ['pad', 'Pavé'],
          ['board', 'Cible'],
          ['total', 'Total'],
        ] as const).map(([key, lbl]) => {
          const allowed = key !== 'total' || (state.allowTotal && state.dartsInTurn === 0);
          const active = input === key;
          return (
            <Pressable
              key={key}
              onPress={() => {
                if (!allowed) {
                  tapError();
                  return;
                }
                tapMedium();
                setInput(key);
              }}
              style={[
                s.switchBtn,
                {
                  backgroundColor: active ? alpha(C.brass, 0.16) : 'transparent',
                  borderColor: active ? alpha(C.brass, 0.5) : C.line,
                  opacity: allowed ? 1 : 0.35,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <Text style={[T.small, { color: active ? C.brass : C.chalkDim, fontWeight: '700' }]}>
                {lbl}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Sheet visible={menu} onClose={() => setMenu(false)} title="Partie en cours">
        <Text style={[T.small, { marginBottom: SP.md }]}>
          {current.title} · {current.players.map((p) => p.name).join(' · ')}
        </Text>
        <Btn
          label="Annuler la dernière fléchette"
          variant="quiet"
          onPress={() => {
            undoDart();
            setMenu(false);
          }}
          disabled={current.darts.length === 0}
          style={{ marginBottom: SP.xs }}
        />
        <Btn
          label="Passer la main"
          variant="quiet"
          onPress={skipTurn}
          disabled={state.dartsInTurn === 0}
          style={{ marginBottom: SP.xs }}
        />
        <Btn
          label="Historique des volées"
          variant="quiet"
          onPress={() => {
            setMenu(false);
            setTurnsSheet(true);
          }}
          style={{ marginBottom: SP.xs }}
        />
        <Btn
          label="Règles du mode"
          variant="quiet"
          onPress={() => {
            setMenu(false);
            setRules(true);
          }}
          style={{ marginBottom: SP.md }}
        />
        <Btn label="Abandonner la partie" variant="danger" onPress={doQuit} />
      </Sheet>

      <Sheet visible={rules} onClose={() => setRules(false)} title={`Règles · ${mode.name}`}>
        {mode.rules.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: SP.sm }}>
            <Text style={[T.num, { color: C.brass, width: 22 }]}>{i + 1}</Text>
            <Text style={[T.body, { flex: 1, color: C.chalk }]}>{r}</Text>
          </View>
        ))}
      </Sheet>

      <Sheet visible={turnsSheet} onClose={() => setTurnsSheet(false)} title="Volées">
        {state.turns.length === 0 ? (
          <Text style={T.small}>Aucune volée terminée.</Text>
        ) : (
          [...state.turns].reverse().map((t, i) => {
            const p = state.players[t.playerIdx];
            return (
              <View key={`${t.round}-${i}`}>
                <View style={s.turnRow}>
                  <Label style={{ width: 34 }}>T{t.round}</Label>
                  <Text style={[T.bodyStrong, { flex: 1, color: p.color }]}>{p.name}</Text>
                  <Text style={[T.small, { flex: 1.3 }]}>
                    {t.darts.map((d) => dartLabel(d)).join(' · ')}
                  </Text>
                  <Text style={[T.num, { width: 46, textAlign: 'right', color: t.bust ? C.red : C.chalk }]}>
                    {t.bust ? 'BUST' : t.scored}
                  </Text>
                </View>
                <Divider />
              </View>
            );
          })
        )}
      </Sheet>

      <Sheet visible={quit} onClose={() => setQuit(false)} title="Abandonner ?">
        <Text style={[T.body, { marginBottom: SP.md }]}>
          La partie en cours sera perdue. Les statistiques ne seront pas enregistrées.
        </Text>
        <Btn label="Continuer à jouer" variant="quiet" onPress={() => setQuit(false)} style={{ marginBottom: SP.xs }} />
        <Btn label="Abandonner" variant="danger" onPress={doQuit} />
      </Sheet>
    </Screen>
  );
}

const s = StyleSheet.create({
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.sm,
    paddingHorizontal: SP.md,
    height: 26,
  },
  inputArea: { flex: 1, paddingHorizontal: SP.md, paddingBottom: SP.xs },
  switchRow: {
    flexDirection: 'row',
    gap: SP.xs,
    paddingHorizontal: SP.md,
    paddingTop: SP.xs,
    paddingBottom: SP.xs,
  },
  switchBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: R.sm,
    borderWidth: 1,
  },
  turnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, gap: 6 },
});
