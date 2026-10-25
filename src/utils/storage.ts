/**
 * Persistance locale. Tout reste sur l'appareil : aucun compte, aucun réseau.
 * Chaque lecture et chaque écriture est protégée : un stockage indisponible
 * ne doit jamais empêcher l'app de démarrer ou une partie de continuer.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'dartcool.';

export const KEYS = {
  players: PREFIX + 'players',
  settings: PREFIX + 'settings',
  history: PREFIX + 'history',
  current: PREFIX + 'current',
  lineup: PREFIX + 'lineup',
  ads: PREFIX + 'ads',
} as const;

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silence volontaire : perdre une sauvegarde ne doit pas casser la partie.
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // idem
  }
}

export async function clearAll(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((k) => removeKey(k)));
}
