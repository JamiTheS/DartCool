/**
 * Écran de partie. La cible occupe la moitié basse de l'écran : on appuie là
 * où la fléchette est plantée, une marque rouge reste posée, et la troisième
 * passe la main. Le pavé et la saisie par total restent à un appui.
 */
import { router } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

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
import { alpha, C, R, SH, SP, T } from '@/theme/tokens';
import { tapError, tapMedium, tapSuccess } from '@/utils/feedback';

type InputMode = 'pad' | 'board' | 'total';

export default function MatchScreen() {
  const { current, settings, pushDart, undoDart, finishMatch, abandonMatch } = useApp();
  const [input, setInput] = useState<InputMode>(settings.inputMode);
  const [menu, setMenu] = useState(false);
  const [rules, setRules] = useState(false);
  const [quit, setQuit] = useState(false);
  const [turnsSheet, setTurnsSheet] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const lastFlash = useRef<string | null>(null);

  // L'écran reste allumé pendant la partie : personne ne veut déverrouiller
  // son téléphone entre deux volées.
  useEffect(() => {
    if (!settings.keepAwake) return;
    activateKeepAwakeAsync().catch(() => {});
    return () => {
      // Selon la plateforme, la libération renvoie une promesse qui peut être
      // rejetée si le verrou n'était pas encore posé : on l'absorbe des deux
      // façons, sinon la fin de partie affiche une erreur.
      try {
        Promise.resolve(deactivateKeepAwake()).catch(() => {});
      } catch {
        // sans conséquence
      }
    };
  }, [settings.keepAwake]);

  useEffect(() => {
    if (!current) router.replace('/');
  }, [current]);

  const state = useMemo(() => (current ? runMatch(current) : null), [current]);

  useEffect(() => {
    if (!state?.finished) return;
    tapSuccess();
    finishMatch();
    router.replace('/summary');
  }, [state?.finished, finishMatch]);

  useEffect(() => {
    const fl = state?.flash;
    if (!fl) {
      lastFlash.current = null;
      return;
    }
    if (lastFlash.current === fl.text) return;
    lastFlash.current = fl.text;
    if (fl.kind === 'bust' || fl.kind === 'out') tapError();
    else if (fl.kind === 'win' || fl.kind === 'leg' || fl.kind === 'big') tapSuccess();
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

  const onBox = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: width, h: height });
  };

  const boardSize = Math.max(200, Math.min(box.w, box.h - 34));
  const flash = state.flash;
  const flashColor =
    flash?.kind === 'bust' || flash?.kind === 'out'
      ? C.danger
      : flash?.kind === 'win' || flash?.kind === 'leg'
        ? C.ok
        : flash?.kind === 'big'
          ? C.pinkInk
          : C.ink2;

  return (
    <Screen>
      <TopBar
        title={current.title}
        subtitle={state.headline}
        onBack={() => {
          if (settings.confirmQuit && current.darts.length > 0) setQuit(true);
          else doQuit();
        }}
        right={
          <Pressable
            onPress={() => setMenu(true)}
            hitSlop={12}
            style={s.menuBtn}
            accessibilityLabel="Menu de la partie">
            <Dots color={C.ink2} />
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
        <Text numberOfLines={1} style={[T.small, { color: flashColor, fontWeight: '700', flex: 1 }]}>
          {flash?.text ?? state.hint ?? ''}
        </Text>
      </View>

      <ThrowTray
        darts={state.turnDarts}
        onUndo={undoDart}
        canUndo={current.darts.length > 0}
        accent={cur.color}
      />

      <View style={s.inputArea} onLayout={onBox}>
        {input === 'board' ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <BoardInput
            onDart={onDart}
            focus={state.focus}
            focusMult={state.focusMult}
            size={boardSize}
            turnCount={state.turnDarts.length}
          />
          </View>
        ) : input === 'pad' ? (
          <DartPad onDart={onDart} focus={state.focus} focusMult={state.focusMult} />
        ) : (
          <TotalPad
            onDart={onDart}
            max={state.kind === 'x01' ? state.players[state.turnIdx].score : undefined}
          />
        )}
      </View>

      <View style={s.switchRow}>
        {([
          ['board', 'Cible'],
          ['pad', 'Pavé'],
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
                active ? [{ backgroundColor: C.card }, SH.sm] : null,
                { opacity: allowed ? 1 : 0.35 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <Text style={[T.bodyStrong, { color: active ? C.ink : C.ink2, fontSize: 13.5 }]}>
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
            <Text style={[T.num, { color: C.pinkInk, width: 22 }]}>{i + 1}</Text>
            <Text style={[T.body, { flex: 1, color: C.ink }]}>{r}</Text>
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
                  <Label style={{ width: 32 }}>T{t.round}</Label>
                  <Text style={[T.bodyStrong, { flex: 1, fontSize: 14 }]}>{p.name}</Text>
                  <Text style={[T.small, { flex: 1.3 }]}>
                    {t.darts.map((d) => dartLabel(d)).join(' · ')}
                  </Text>
                  <Text
                    style={[T.num, { width: 46, textAlign: 'right', color: t.bust ? C.danger : C.ink }]}>
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
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...SH.sm,
  },
  status: { paddingHorizontal: SP.md, height: 22, justifyContent: 'center' },
  inputArea: { flex: 1, paddingHorizontal: SP.md },
  switchRow: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: SP.md,
    marginTop: SP.xs,
    marginBottom: SP.xs,
    padding: 4,
    backgroundColor: alpha('#16161C', 0.05),
    borderRadius: R.md,
  },
  switchBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: R.sm,
  },
  turnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, gap: 6 },
});
