/** Carnet de joueurs : ajout, renommage, couleur, suppression. */
import { router } from 'expo-router';
import React, { useState } from 'react';
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

import { Plus, Trash } from '@/components/icons';
import { Btn, Card, Empty, Label, Screen, Sheet, TopBar } from '@/components/ui';
import { useApp } from '@/store/app';
import { alpha, C, PLAYER_COLORS, R, SP, T } from '@/theme/tokens';
import { tapError, tapLight, tapMedium } from '@/utils/feedback';

export default function Players() {
  const { players, addPlayer, renamePlayer, setPlayerColor, removePlayer, history } = useApp();
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const editing = players.find((p) => p.id === editId) ?? null;

  const add = () => {
    const created = addPlayer(name);
    if (!created) {
      tapError();
      return;
    }
    tapMedium();
    setName('');
  };

  const played = (id: string) => history.filter((m) => m.players.some((p) => p.id === id)).length;
  const won = (id: string) => history.filter((m) => m.result?.winnerIds.includes(id)).length;

  return (
    <Screen>
      <TopBar title="Joueurs" subtitle={`${players.length} au carnet`} onBack={() => router.back()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: SP.md, paddingBottom: SP.xl, gap: SP.sm }}
          keyboardShouldPersistTaps="handled">
          <Card>
            <Label>Ajouter</Label>
            <View style={s.addRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Prénom ou surnom"
                placeholderTextColor={C.chalkFaint}
                style={s.input}
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={add}
                autoCorrect={false}
              />
              <Pressable onPress={add} style={s.addBtn} accessibilityLabel="Ajouter">
                <Plus color={C.onBrass} />
              </Pressable>
            </View>
            <Text style={[T.small, { marginTop: SP.sm }]}>
              Les joueurs et leurs statistiques restent sur cet appareil.
            </Text>
          </Card>

          {players.length === 0 ? (
            <Empty
              title="Carnet vide"
              text="Ajoute les habitués : ils seront proposés à chaque nouvelle partie."
            />
          ) : (
            players.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => {
                  tapLight();
                  setEditId(p.id);
                  setEditName(p.name);
                }}
                style={({ pressed }) => [
                  s.row,
                  { backgroundColor: pressed ? C.panelHigher : C.panel, borderLeftColor: p.color },
                ]}>
                <View style={{ flex: 1 }}>
                  <Text style={T.bodyStrong}>{p.name}</Text>
                  <Text style={[T.small, { marginTop: 2 }]}>
                    {played(p.id)} partie{played(p.id) > 1 ? 's' : ''} · {won(p.id)} victoire
                    {won(p.id) > 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={[T.label, { color: C.chalkFaint }]}>MODIFIER</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Sheet visible={Boolean(editing)} onClose={() => setEditId(null)} title={editing?.name ?? ''}>
        {editing ? (
          <View>
            <Label>Nom</Label>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[s.input, { marginTop: 6 }]}
              maxLength={18}
              autoCorrect={false}
            />
            <Label style={{ marginTop: SP.md }}>Couleur</Label>
            <View style={s.colors}>
              {PLAYER_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => {
                    tapLight();
                    setPlayerColor(editing.id, c);
                  }}
                  style={[
                    s.swatch,
                    {
                      backgroundColor: alpha(c, 0.9),
                      borderColor: editing.color === c ? C.chalk : 'transparent',
                    },
                  ]}
                  accessibilityLabel={`Couleur ${c}`}
                />
              ))}
            </View>
            <Btn
              label="Enregistrer"
              onPress={() => {
                renamePlayer(editing.id, editName);
                setEditId(null);
              }}
              style={{ marginTop: SP.lg }}
            />
            <Btn
              label="Retirer du carnet"
              variant="danger"
              icon={<Trash size={18} color={C.red} />}
              onPress={() => {
                removePlayer(editing.id);
                setEditId(null);
              }}
              style={{ marginTop: SP.xs }}
            />
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const s = StyleSheet.create({
  addRow: { flexDirection: 'row', gap: SP.xs, marginTop: 6 },
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    borderLeftWidth: 3,
    padding: SP.md,
  },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: SP.xs, marginTop: 6 },
  swatch: { width: 42, height: 42, borderRadius: R.sm, borderWidth: 2 },
});
