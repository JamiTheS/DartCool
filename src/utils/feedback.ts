/**
 * Retour haptique, réglable et sans échec bloquant.
 * Sur web et quand le réglage est coupé, les appels ne font rien.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let enabled = true;

export function setHapticsEnabled(v: boolean): void {
  enabled = v;
}

const safe = (fn: () => Promise<unknown>) => {
  if (!enabled || Platform.OS === 'web') return;
  try {
    void fn();
  } catch {
    // ignoré
  }
};

/** Saisie d'une fléchette. */
export const tapLight = () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
/** Changement d'état net : fin de volée, bouton principal. */
export const tapMedium = () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
/** Manche gagnée, partie gagnée. */
export const tapSuccess = () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
/** Bust, action refusée. */
export const tapError = () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
