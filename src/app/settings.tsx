/** Réglages, informations légales et remise à zéro. */
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChevronRight } from '@/components/icons';
import { Btn, Card, Divider, Label, Screen, Segmented, Sheet, ToggleRow, TopBar } from '@/components/ui';
import { LINKS } from '@/data/links';
import { useApp } from '@/store/app';
import { C, SP, T } from '@/theme/tokens';
import { tapLight } from '@/utils/feedback';

export default function SettingsScreen() {
  const { settings, updateSettings, resetEverything, history, players } = useApp();
  const [reset, setReset] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const openUrl = (url: string) => {
    tapLight();
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Screen>
      <TopBar title="Réglages" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: SP.md, paddingBottom: SP.xl, gap: SP.sm }}>
        <Card>
          <Label>Saisie</Label>
          <Text style={[T.small, { marginTop: 4, marginBottom: 8 }]}>
            Mode de saisie proposé au lancement d’une partie.
          </Text>
          <Segmented
            items={[
              { value: 'pad', label: 'Pavé' },
              { value: 'board', label: 'Cible' },
              { value: 'total', label: 'Total' },
            ]}
            value={settings.inputMode}
            onChange={(v) => updateSettings({ inputMode: v as 'pad' | 'board' | 'total' })}
          />
          <Divider style={{ marginVertical: SP.sm }} />
          <ToggleRow
            label="Conseils de sortie"
            hint="Affiche le chemin pour finir au X01"
            value={settings.showCheckout}
            onChange={(v) => updateSettings({ showCheckout: v })}
          />
          <Divider />
          <ToggleRow
            label="Vibrations"
            hint="Retour haptique à chaque saisie"
            value={settings.haptics}
            onChange={(v) => updateSettings({ haptics: v })}
          />
          <Divider />
          <ToggleRow
            label="Écran toujours allumé"
            hint="Pendant une partie uniquement"
            value={settings.keepAwake}
            onChange={(v) => updateSettings({ keepAwake: v })}
          />
          <Divider />
          <ToggleRow
            label="Confirmer l’abandon"
            hint="Demande avant de quitter une partie commencée"
            value={settings.confirmQuit}
            onChange={(v) => updateSettings({ confirmQuit: v })}
          />
        </Card>

        <Card>
          <Label>À propos</Label>
          <Pressable style={s.row} onPress={() => router.push('/privacy')}>
            <Text style={[T.bodyStrong, { flex: 1 }]}>Confidentialité</Text>
            <ChevronRight size={18} color={C.ink3} />
          </Pressable>
          <Divider />
          <Pressable style={s.row} onPress={() => openUrl(LINKS.supportUrl)}>
            <Text style={[T.bodyStrong, { flex: 1 }]}>Aide et contact</Text>
            <ChevronRight size={18} color={C.ink3} />
          </Pressable>
          <Divider />
          <Pressable style={s.row} onPress={() => openUrl(`mailto:${LINKS.supportEmail}`)}>
            <Text style={[T.bodyStrong, { flex: 1 }]}>Écrire au développeur</Text>
            <Text style={T.small}>{LINKS.supportEmail}</Text>
          </Pressable>
          <Divider />
          <View style={s.row}>
            <Text style={[T.bodyStrong, { flex: 1 }]}>Version</Text>
            <Text style={T.small}>{version}</Text>
          </View>
        </Card>

        <Card>
          <Label>Données</Label>
          <Text style={[T.small, { marginTop: 4 }]}>
            {players.length} joueur{players.length > 1 ? 's' : ''} · {history.length} partie
            {history.length > 1 ? 's' : ''} en mémoire. Tout est stocké sur cet appareil, rien n’est
            envoyé.
          </Text>
          <Btn
            label="Tout effacer"
            variant="danger"
            onPress={() => setReset(true)}
            style={{ marginTop: SP.md }}
          />
        </Card>

        <Text style={[T.small, { textAlign: 'center', color: C.ink3, marginTop: SP.sm }]}>
          DartCool · fait pour les soirées fléchettes
        </Text>
      </ScrollView>

      <Sheet visible={reset} onClose={() => setReset(false)} title="Tout effacer ?">
        <Text style={[T.body, { marginBottom: SP.md }]}>
          Les joueurs, l’historique, les statistiques et les réglages seront supprimés. Cette action
          est définitive.
        </Text>
        <Btn label="Annuler" variant="quiet" onPress={() => setReset(false)} style={{ marginBottom: SP.xs }} />
        <Btn
          label="Effacer définitivement"
          variant="danger"
          onPress={() => {
            resetEverything();
            setReset(false);
            router.replace('/');
          }}
        />
      </Sheet>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SP.md, gap: SP.sm },
});
