/** Mise en place d'une partie : joueurs, ordre de lancer, réglages du mode. */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Plus, Shuffle } from '@/components/icons';
import { Btn, Card, Divider, Label, Screen, Segmented, Sheet, Stepper, ToggleRow, TopBar } from '@/components/ui';
import { MODES, matchTitle, presetById } from '@/data/modes';
import { ModeId, Options } from '@/engine';
import { useApp } from '@/store/app';
import { alpha, C, R, SP, T } from '@/theme/tokens';
import { tapError, tapLight, tapMedium } from '@/utils/feedback';

/** Numéros distincts tirés au sort pour le Killer. */
function drawNumbers(count: number): number[] {
  const pool = Array.from({ length: 20 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export default function Setup() {
  const params = useLocalSearchParams<{ preset?: string; mode?: string }>();
  const preset = params.preset ? presetById(params.preset) : undefined;
  const modeId = (preset?.modeId ?? (params.mode as ModeId) ?? 'x01') as ModeId;
  const mode = MODES[modeId];

  const { players, lineup, addPlayer, startMatch, current } = useApp();
  const [options, setOptions] = useState<Options>({ ...mode.defaults, ...(preset?.options ?? {}) });
  const [selected, setSelected] = useState<string[]>(() =>
    lineup.filter((id) => players.some((p) => p.id === id))
  );
  const [name, setName] = useState('');
  const [rules, setRules] = useState(false);
  const [nums, setNums] = useState<number[]>([]);
  const [numsFor, setNumsFor] = useState(0);

  // Killer : un numéro par joueur, retiré au sort quand la sélection change.
  if (modeId === 'killer' && numsFor !== selected.length) {
    setNumsFor(selected.length);
    setNums(drawNumbers(selected.length));
  }

  const toggle = (id: string) => {
    tapLight();
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const add = () => {
    const created = addPlayer(name);
    if (!created) {
      tapError();
      return;
    }
    tapMedium();
    setSelected((prev) => [...prev, created.id]);
    setName('');
  };

  const shuffle = () => {
    tapMedium();
    setSelected((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  const finalOptions = useMemo<Options>(
    () => (modeId === 'killer' ? { ...options, numbers: nums.join(',') } : options),
    [modeId, options, nums]
  );

  const enough = selected.length >= mode.minPlayers;
  const tooMany = selected.length > mode.maxPlayers;

  const start = () => {
    if (!enough || tooMany) {
      tapError();
      return;
    }
    const m = startMatch({
      modeId,
      presetId: preset?.id ?? modeId,
      options: finalOptions,
      playerIds: selected,
    });
    if (m) router.replace('/match');
  };

  return (
    <Screen>
      <TopBar
        title={mode.name}
        subtitle={matchTitle(modeId, finalOptions)}
        onBack={() => router.back()}
        right={
          <Pressable onPress={() => setRules(true)} hitSlop={10} accessibilityLabel="Voir les règles">
            <Text style={[T.label, { color: C.brass }]}>RÈGLES</Text>
          </Pressable>
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: SP.md, paddingBottom: SP.xl, gap: SP.md }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Card>
            <View style={s.head}>
              <Label>
                Joueurs · {selected.length}/{mode.maxPlayers}
              </Label>
              {selected.length > 1 ? (
                <Pressable onPress={shuffle} hitSlop={10} style={s.shuffle} accessibilityLabel="Mélanger l’ordre">
                  <Shuffle size={16} color={C.chalkDim} />
                  <Text style={[T.small, { color: C.chalkDim }]}>Mélanger</Text>
                </Pressable>
              ) : null}
            </View>

            {players.length === 0 ? (
              <Text style={[T.small, { marginBottom: SP.sm }]}>
                Ajoute les joueurs présents : ils resteront dans le carnet pour les prochaines parties.
              </Text>
            ) : null}

            <View style={s.chips}>
              {players.map((p) => {
                const at = selected.indexOf(p.id);
                const on = at >= 0;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => toggle(p.id)}
                    style={[
                      s.chip,
                      {
                        borderColor: on ? p.color : C.line,
                        backgroundColor: on ? alpha(p.color, 0.14) : 'transparent',
                      },
                    ]}>
                    {on ? (
                      <View style={[s.order, { backgroundColor: p.color }]}>
                        <Text style={s.orderTxt}>{at + 1}</Text>
                      </View>
                    ) : null}
                    <Text style={[T.bodyStrong, { color: on ? C.chalk : C.chalkDim }]}>{p.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={s.addRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nouveau joueur"
                placeholderTextColor={C.chalkFaint}
                style={s.input}
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={add}
                autoCorrect={false}
              />
              <Pressable onPress={add} style={s.addBtn} accessibilityLabel="Ajouter le joueur">
                <Plus color={C.onBrass} />
              </Pressable>
            </View>

            {selected.length > 1 ? (
              <Text style={[T.small, { marginTop: SP.sm, color: C.chalkFaint }]}>
                Ordre de lancer : {selected.map((id) => players.find((p) => p.id === id)?.name).join(' → ')}
              </Text>
            ) : null}
            {tooMany ? (
              <Text style={[T.small, { marginTop: 6, color: C.red }]}>
                {mode.name} se joue à {mode.maxPlayers} joueurs au maximum.
              </Text>
            ) : null}
            {!mode.solo && selected.length < 2 ? (
              <Text style={[T.small, { marginTop: 6, color: C.red }]}>
                Ce mode demande au moins deux joueurs.
              </Text>
            ) : null}
          </Card>

          {modeId === 'killer' && selected.length > 0 ? (
            <Card>
              <View style={s.head}>
                <Label>Numéros</Label>
                <Pressable
                  onPress={() => {
                    tapMedium();
                    setNums(drawNumbers(selected.length));
                  }}
                  hitSlop={10}
                  style={s.shuffle}>
                  <Shuffle size={16} color={C.chalkDim} />
                  <Text style={[T.small, { color: C.chalkDim }]}>Retirer au sort</Text>
                </Pressable>
              </View>
              {selected.map((id, i) => {
                const p = players.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <View key={id} style={s.numRow}>
                    <Text style={[T.bodyStrong, { flex: 1, color: p.color }]}>{p.name}</Text>
                    <Stepper
                      value={nums[i] ?? 20}
                      min={1}
                      max={20}
                      onChange={(v) => {
                        setNums((prev) => {
                          const copy = [...prev];
                          // Pas deux fois le même numéro : on échange.
                          const taken = copy.indexOf(v);
                          if (taken >= 0 && taken !== i) copy[taken] = copy[i];
                          copy[i] = v;
                          return copy;
                        });
                      }}
                    />
                  </View>
                );
              })}
            </Card>
          ) : null}

          {mode.options.length > 0 ? (
            <Card>
              <Label>Réglages</Label>
              <View style={{ gap: SP.md, marginTop: SP.sm }}>
                {mode.options.map((o) => {
                  if (o.kind === 'toggle') {
                    return (
                      <ToggleRow
                        key={o.key}
                        label={o.label}
                        hint={o.hint}
                        value={options[o.key] === true}
                        onChange={(v) => setOptions((prev) => ({ ...prev, [o.key]: v }))}
                      />
                    );
                  }
                  if (o.kind === 'stepper') {
                    return (
                      <View key={o.key} style={s.optRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={T.bodyStrong}>{o.label}</Text>
                          {o.hint ? <Text style={[T.small, { marginTop: 2 }]}>{o.hint}</Text> : null}
                        </View>
                        <Stepper
                          value={typeof options[o.key] === 'number' ? (options[o.key] as number) : o.min}
                          min={o.min}
                          max={o.max}
                          step={o.step}
                          suffix={o.suffix}
                          onChange={(v) => setOptions((prev) => ({ ...prev, [o.key]: v }))}
                        />
                      </View>
                    );
                  }
                  return (
                    <View key={o.key}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={T.bodyStrong}>{o.label}</Text>
                        {o.hint ? <Text style={T.small}>{o.hint}</Text> : null}
                      </View>
                      <Segmented
                        items={o.choices.map((c) => ({ value: c.value as string | number | boolean, label: c.label }))}
                        value={options[o.key] as string | number | boolean}
                        onChange={(v) => setOptions((prev) => ({ ...prev, [o.key]: v }))}
                        compact={o.choices.length > 3}
                      />
                    </View>
                  );
                })}
              </View>
            </Card>
          ) : null}

          <Card tone={C.brass}>
            <Label>En bref</Label>
            <Text style={[T.body, { marginTop: 4, color: C.chalk }]}>{mode.tagline}</Text>
            <Divider style={{ marginVertical: SP.sm }} />
            <Text style={T.small}>{mode.rules[0]}</Text>
            <Pressable onPress={() => setRules(true)} style={{ marginTop: SP.sm }}>
              <Text style={[T.small, { color: C.brass, fontWeight: '700' }]}>Lire toutes les règles →</Text>
            </Pressable>
          </Card>

          {current && !current.finishedAt ? (
            <Text style={[T.small, { color: C.chalkFaint, textAlign: 'center' }]}>
              Une partie est en cours ({current.title}) : la lancer ici l’abandonnera.
            </Text>
          ) : null}
        </ScrollView>

        <View style={s.footer}>
          <Btn label="Lancer la partie" onPress={start} disabled={!enough || tooMany} big />
        </View>
      </KeyboardAvoidingView>

      <Sheet visible={rules} onClose={() => setRules(false)} title={`Règles · ${mode.name}`}>
        {mode.rules.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: SP.sm }}>
            <Text style={[T.num, { color: C.brass, width: 22 }]}>{i + 1}</Text>
            <Text style={[T.body, { flex: 1, color: C.chalk }]}>{r}</Text>
          </View>
        ))}
      </Sheet>
    </Screen>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SP.sm },
  shuffle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SP.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  order: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  orderTxt: { fontSize: 11, fontWeight: '800', color: C.onBrass },
  addRow: { flexDirection: 'row', gap: SP.xs, marginTop: SP.sm },
  input: {
    flex: 1,
    backgroundColor: C.panelHigh,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: SP.md,
    height: 48,
    color: C.chalk,
    fontSize: 16,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: R.sm,
    backgroundColor: C.brass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: SP.sm },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: SP.sm },
  footer: {
    paddingHorizontal: SP.md,
    paddingTop: SP.sm,
    paddingBottom: SP.sm,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.base,
  },
});
