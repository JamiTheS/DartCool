/**
 * Publicité : un seul interstitiel, à la sortie d'une partie terminée.
 *
 * Règles qu'on s'impose, et qui expliquent la forme de ce fichier :
 *
 * 1. **Jamais pendant une partie.** La cible occupe l'écran et les zones de
 *    toucher font 46 px : une bannière provoquerait des erreurs de saisie et
 *    casserait la règle « écran unique sans défilement ». Le seul point
 *    d'affichage est la sortie de l'écran Résultat.
 * 2. **Cadence tenue, pas une pub par partie.** Une partie sur trois au plus,
 *    et jamais deux fois en moins de cinq minutes.
 * 3. **Rien ne casse si la pub échoue.** Consentement refusé, réseau absent,
 *    chargement raté : on continue sans bloquer la navigation. Chaque appel
 *    public résout toujours, même en cas d'erreur.
 * 4. **Consentement avant toute requête.** Formulaire Google UMP (RGPD) puis
 *    App Tracking Transparency, et seulement ensuite l'initialisation du SDK.
 */
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Platform } from 'react-native';
import mobileAds, {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  InterstitialAd,
  MaxAdContentRating,
  TestIds,
} from 'react-native-google-mobile-ads';

import { KEYS, loadJSON, saveJSON } from '@/utils/storage';

/** En développement, les identifiants officiels de test de Google. */
const INTERSTITIAL_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-4942532111934732/6643593025';

/** Une partie sur trois au plus. */
const GAMES_BETWEEN_ADS = 3;
/** Et jamais deux interstitiels à moins de cinq minutes d'intervalle. */
const MIN_INTERVAL_MS = 5 * 60 * 1000;

type AdsState = {
  /** Parties terminées depuis le dernier interstitiel affiché. */
  gamesSinceAd: number;
  /** Horodatage du dernier affichage. */
  lastShownAt: number;
  /** Dernière partie comptée, pour ne pas compter deux fois la même. */
  lastMatchId: string | null;
};

const EMPTY: AdsState = { gamesSinceAd: 0, lastShownAt: 0, lastMatchId: null };

let state: AdsState = EMPTY;
let initialized = false;
let canRequestAds = false;
let privacyOptionsRequired = false;
let personalized = false;

/** L'interstitiel préchargé, prêt à être montré. */
let ad: InterstitialAd | null = null;
let adLoaded = false;
let retries = 0;

const MAX_RETRIES = 3;

function preload() {
  if (!canRequestAds) return;
  adLoaded = false;
  ad = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, {
    requestNonPersonalizedAdsOnly: !personalized,
  });
  ad.addAdEventListener(AdEventType.LOADED, () => {
    adLoaded = true;
    retries = 0;
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    adLoaded = false;
    // Un chargement raté ne doit pas condamner toute la session. C'est le cas
    // courant : réseau absent, ou bloc d'annonces récent qui ne remplit pas
    // encore. On retente, de plus en plus espacé, et `onGameFinished` relance
    // de toute façon à la partie suivante.
    if (retries < MAX_RETRIES) {
      retries += 1;
      setTimeout(preload, retries * 30000);
    }
  });
  ad.load();
}

/**
 * Consentement, puis initialisation du SDK. Appelé une fois au démarrage.
 * N'interrompt jamais le lancement de l'app : tout est encapsulé.
 */
export async function initAds(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    // 1. RGPD : le formulaire Google ne s'affiche que s'il est requis (UE).
    const info = await AdsConsent.gatherConsent();
    canRequestAds = info.canRequestAds;
    privacyOptionsRequired =
      info.privacyOptionsRequirementStatus ===
      AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
  } catch {
    // Sans information de consentement, on reste en pubs non personnalisées.
    canRequestAds = true;
  }

  try {
    // 2. ATT : nécessaire pour la personnalisation sur iOS, facultatif ailleurs.
    if (Platform.OS === 'ios') {
      const current = await getTrackingPermissionsAsync();
      const status = current.canAskAgain && current.status !== 'granted'
        ? (await requestTrackingPermissionsAsync()).status
        : current.status;
      personalized = status === 'granted';
    } else {
      personalized = true;
    }
  } catch {
    personalized = false;
  }

  try {
    // 3. Contenu calibré sur la classification 4+ de la fiche App Store.
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.G,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds().initialize();
  } catch {
    canRequestAds = false;
  }

  state = await loadJSON<AdsState>(KEYS.ads, EMPTY);
  preload();
}

/** Vrai si l'app doit proposer de rouvrir le formulaire de consentement. */
export function hasPrivacyOptions(): boolean {
  return privacyOptionsRequired;
}

/** Rouvre le formulaire de consentement depuis les réglages. */
export async function showPrivacyOptions(): Promise<void> {
  try {
    await AdsConsent.showPrivacyOptionsForm();
  } catch {
    // Formulaire indisponible : on ne signale rien, l'entrée est discrète.
  }
}

/**
 * Enregistre une partie terminée et montre un interstitiel si la cadence le
 * permet. Résout quand la pub est fermée, ou aussitôt s'il n'y en a pas :
 * l'appelant peut donc naviguer juste après, sans cas particulier.
 */
export async function onGameFinished(matchId: string | null): Promise<void> {
  if (!canRequestAds) return;

  if (matchId && matchId !== state.lastMatchId) {
    state = { ...state, gamesSinceAd: state.gamesSinceAd + 1, lastMatchId: matchId };
    await saveJSON(KEYS.ads, state);
  }

  const due = state.gamesSinceAd >= GAMES_BETWEEN_ADS;
  const rested = Date.now() - state.lastShownAt >= MIN_INTERVAL_MS;
  if (!due || !rested) return;

  // La cadence autorise une pub mais rien n'est prêt : on relance un
  // chargement pour la prochaine fois plutôt que de rester bloqué sans pub
  // jusqu'au prochain démarrage de l'app.
  if (!adLoaded || !ad) {
    retries = 0;
    preload();
    return;
  }

  try {
    const closed = new Promise<void>((resolve) => {
      const offClosed = ad!.addAdEventListener(AdEventType.CLOSED, () => {
        offClosed();
        resolve();
      });
      // Filet : si l'événement de fermeture n'arrive pas, on ne bloque pas
      // la navigation indéfiniment.
      setTimeout(resolve, 30000);
    });
    await ad.show();
    await closed;
    state = { ...state, gamesSinceAd: 0, lastShownAt: Date.now() };
    await saveJSON(KEYS.ads, state);
  } catch {
    // Affichage impossible : on passe, la partie suivante retentera.
  } finally {
    preload();
  }
}
