/**
 * Politique de confidentialité, lisible hors ligne.
 * Elle dit exactement ce que fait le code : aucune collecte, aucun réseau.
 */
import React from 'react';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Card, Label, Screen, TopBar } from '@/components/ui';
import { LINKS } from '@/data/links';
import { C, SP, T } from '@/theme/tokens';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Aucune donnée collectée',
    body:
      'DartCool ne collecte aucune donnée personnelle. Il n’y a pas de compte, pas d’inscription, pas d’identifiant publicitaire, pas de traceur, pas d’outil de mesure d’audience.',
  },
  {
    title: 'Ce qui est stocké sur votre appareil',
    body:
      'Les noms des joueurs que vous saisissez, les parties jouées et vos réglages sont enregistrés uniquement dans la mémoire locale de l’application, sur votre téléphone. Ces informations ne sont jamais transmises à un serveur : l’application fonctionne entièrement hors ligne.',
  },
  {
    title: 'Suppression',
    body:
      'Réglages → Données → « Tout effacer » supprime immédiatement et définitivement les joueurs, l’historique, les statistiques et les réglages. Désinstaller l’application supprime également tout.',
  },
  {
    title: 'Enfants',
    body:
      'L’application convient à tous les publics. Elle ne demande aucune information personnelle et ne contient ni publicité ni achat intégré.',
  },
  {
    title: 'Vos droits',
    body:
      'Comme aucune donnée ne quitte votre appareil, il n’y a rien à demander, à corriger ou à faire effacer auprès de l’éditeur. Vos données vous appartiennent et restent sous votre contrôle.',
  },
];

export default function Privacy() {
  return (
    <Screen>
      <TopBar title="Confidentialité" subtitle="Version du 10 octobre 2026" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: SP.md, paddingBottom: SP.xl, gap: SP.sm }}>
        {SECTIONS.map((sec) => (
          <Card key={sec.title}>
            <Label>{sec.title}</Label>
            <Text style={[T.body, { marginTop: 6, color: C.chalk }]}>{sec.body}</Text>
          </Card>
        ))}
        <View style={{ paddingVertical: SP.md }}>
          <Text style={T.small}>
            Une question ? Écrivez à{' '}
            <Text
              style={{ color: C.brass }}
              onPress={() => Linking.openURL(`mailto:${LINKS.supportEmail}`).catch(() => {})}>
              {LINKS.supportEmail}
            </Text>
            .
          </Text>
          <Pressable onPress={() => Linking.openURL(LINKS.privacyUrl).catch(() => {})}>
            <Text style={[T.small, { color: C.chalkFaint, marginTop: 6 }]}>
              Cette politique est également publiée en ligne.
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
