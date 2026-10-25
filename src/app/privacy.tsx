/**
 * Politique de confidentialité, lisible hors ligne.
 * Elle doit dire exactement ce que fait le code : les parties restent locales,
 * et le seul accès réseau est celui du SDK publicitaire (voir `src/ads`).
 * Toute évolution de la publicité se répercute ici ET dans
 * `docs/privacy-policy.html`, qui est la version publiée sur le web.
 */
import React from 'react';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Card, Label, Screen, TopBar } from '@/components/ui';
import { LINKS } from '@/data/links';
import { C, SP, T } from '@/theme/tokens';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Vos parties restent sur votre appareil',
    body:
      'Les noms des joueurs que vous saisissez, les parties jouées, les statistiques et vos réglages sont enregistrés uniquement dans la mémoire locale de l’application, sur votre téléphone. L’éditeur n’y a pas accès : ces informations ne sont transmises à personne, et le jeu fonctionne sans connexion.',
  },
  {
    title: 'Pas de compte',
    body:
      'DartCool ne demande ni inscription, ni mot de passe, ni adresse e-mail. Il n’y a aucun compte à créer, donc aucun profil vous concernant chez l’éditeur.',
  },
  {
    title: 'Publicité',
    body:
      'L’application est gratuite et financée par la publicité. Une annonce peut s’afficher en quittant l’écran de résultat, au maximum une partie sur trois, et jamais pendant une partie. Ces annonces sont fournies par Google AdMob, qui se connecte à ses serveurs pour les afficher et les mesurer, et peut à cette occasion traiter un identifiant publicitaire, votre adresse IP et des informations techniques sur l’appareil. C’est le seul moment où l’application utilise le réseau.',
  },
  {
    title: 'Votre choix sur la publicité',
    body:
      'Au premier lancement, là où la réglementation l’exige, un écran vous demande si vous acceptez les annonces personnalisées. Vous pouvez revenir sur ce choix à tout moment par Réglages → Préférences publicitaires. Sur iPhone, l’autorisation de suivi se règle en plus dans Réglages iOS → Confidentialité et sécurité → Suivi. Si vous refusez, les annonces restent affichées mais ne sont pas personnalisées.',
  },
  {
    title: 'Suppression',
    body:
      'Réglages → Données → « Tout effacer » supprime immédiatement et définitivement les joueurs, l’historique, les statistiques et les réglages enregistrés sur l’appareil. Désinstaller l’application supprime également tout.',
  },
  {
    title: 'Enfants',
    body:
      'L’application convient à tous les publics et ne demande aucune information personnelle. Les annonces sont limitées au contenu tout public, en cohérence avec la classification 4+ de la fiche App Store.',
  },
  {
    title: 'Vos droits',
    body:
      'Les données enregistrées sur votre appareil vous appartiennent et vous pouvez les effacer vous-même à tout moment. Pour les données traitées par Google au titre de la publicité, les règles de confidentialité de Google s’appliquent et détaillent vos droits d’accès, de rectification et d’opposition. Pour toute question, écrivez à l’adresse ci-dessous.',
  },
];

export default function Privacy() {
  return (
    <Screen>
      <TopBar title="Confidentialité" subtitle="Version du 25 octobre 2026" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: SP.md, paddingBottom: SP.xl, gap: SP.sm }}>
        {SECTIONS.map((sec) => (
          <Card key={sec.title}>
            <Label>{sec.title}</Label>
            <Text style={[T.body, { marginTop: 6, color: C.ink }]}>{sec.body}</Text>
          </Card>
        ))}
        <View style={{ paddingVertical: SP.md }}>
          <Text style={T.small}>
            Une question ? Écrivez à{' '}
            <Text
              style={{ color: C.pink }}
              onPress={() => Linking.openURL(`mailto:${LINKS.supportEmail}`).catch(() => {})}>
              {LINKS.supportEmail}
            </Text>
            .
          </Text>
          <Pressable onPress={() => Linking.openURL(LINKS.privacyUrl).catch(() => {})}>
            <Text style={[T.small, { color: C.ink3, marginTop: 6 }]}>
              Cette politique est également publiée en ligne.
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
