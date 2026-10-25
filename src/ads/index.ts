/**
 * Publicité : un interstitiel au lancement de chaque partie.
 *
 * Règles qu'on s'impose, et qui expliquent la forme de ce fichier :
 *
 * 1. **Jamais pendant une partie.** La cible occupe l'écran et les zones de
 *    toucher font 46 px : une bannière provoquerait des erreurs de saisie et
 *    casserait la règle « écran unique sans défilement ». Le seul point
 *    d'affichage est le lancement — y compris une revanche, qui est un
 *    lancement comme un autre.
 * 2. **La pub ne retarde jamais le jeu.** Si rien n'est prêt — réseau absent,
 *    chargement raté, consentement refusé — on enchaîne directement sur la
 *    partie. `showBeforeMatch()` résout toujours, l'appelant n'a aucun cas
 *    particulier à gérer.
 * 3. **Consentement avant toute requête.** Formulaire Google UMP (RGPD) puis
 *    App Tracking Transparency, et seulement ensuite l'initialisation du SDK.
 *    Sans message de consentement publié côté AdMob, le SDK n'a le droit de
 *    faire aucune demande dans l'UE.
 * 4. **Les échecs sont silencieux pour le joueur, mais pas perdus.** Chaque
 *    étape retient son erreur dans `lastError` et l'état est lisible par
 *    `getAdsDiagnostics()`. Sans ça, une pub qui ne s'affiche pas est
 *    indébogable : on ne peut pas distinguer « consentement refusé » de
 *    « pas de remplissage » ni de « SDK non initialisé ».
 */
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Platform } from 'react-native';
import mobileAds, {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  AdsConsentStatus,
  InterstitialAd,
  MaxAdContentRating,
  TestIds,
} from 'react-native-google-mobile-ads';

/**
 * Affiche le bloc de diagnostic dans Réglages. **À repasser à `false` avant de
 * soumettre à l'App Store** : c'est un outil de mise au point, pas une
 * fonctionnalité.
 */
export const ADS_DEBUG = true;

/** En développement, les identifiants officiels de test de Google. */
const INTERSTITIAL_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-4942532111934732/6643593025';

let initialized = false;
let canRequestAds = false;
let privacyOptionsRequired = false;
let personalized = false;

/** Dernier état connu, pour le diagnostic. */
let consentStatus = 'jamais interrogé';
let formAvailable: boolean | null = null;
let lastError: string | null = null;
let requestCount = 0;

/** L'interstitiel préchargé, prêt à être montré. */
let ad: InterstitialAd | null = null;
let adLoaded = false;
let retries = 0;

const MAX_RETRIES = 3;

function statusLabel(s: AdsConsentStatus): string {
  switch (s) {
    case AdsConsentStatus.REQUIRED:
      return 'requis, non obtenu';
    case AdsConsentStatus.OBTAINED:
      return 'obtenu';
    case AdsConsentStatus.NOT_REQUIRED:
      return 'non requis (hors UE)';
    default:
      return 'inconnu';
  }
}

function note(step: string, e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  lastError = `${step} : ${msg}`.slice(0, 180);
}

function preload() {
  if (!canRequestAds) return;
  adLoaded = false;
  requestCount += 1;
  ad = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, {
    requestNonPersonalizedAdsOnly: !personalized,
  });
  ad.addAdEventListener(AdEventType.LOADED, () => {
    adLoaded = true;
    retries = 0;
  });
  ad.addAdEventListener(AdEventType.ERROR, (e) => {
    adLoaded = false;
    note('chargement', e);
    // Un chargement raté ne doit pas condamner toute la session. C'est le cas
    // courant : réseau absent, ou bloc d'annonces récent qui ne remplit pas
    // encore. On retente, de plus en plus espacé, et chaque lancement de
    // partie relance de toute façon.
    if (retries < MAX_RETRIES) {
      retries += 1;
      setTimeout(preload, retries * 30000);
    }
  });
  ad.load();
}

/** Recueille le consentement et met à jour l'état lisible. */
async function gather() {
  try {
    const info = await AdsConsent.gatherConsent();
    canRequestAds = info.canRequestAds;
    consentStatus = statusLabel(info.status);
    formAvailable = info.status !== AdsConsentStatus.REQUIRED;
    privacyOptionsRequired =
      info.privacyOptionsRequirementStatus ===
      AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
  } catch (e) {
    note('consentement', e);
    consentStatus = 'erreur';
    formAvailable = false;
    // Sans information de consentement, on reste en pubs non personnalisées.
    canRequestAds = true;
  }
}

/**
 * Consentement, puis initialisation du SDK. Appelé une fois au démarrage.
 * N'interrompt jamais le lancement de l'app : tout est encapsulé.
 */
export async function initAds(): Promise<void> {
  if (initialized) return;
  initialized = true;

  await gather();

  try {
    // ATT : nécessaire pour la personnalisation sur iOS, facultatif ailleurs.
    if (Platform.OS === 'ios') {
      const current = await getTrackingPermissionsAsync();
      const status = current.canAskAgain && current.status !== 'granted'
        ? (await requestTrackingPermissionsAsync()).status
        : current.status;
      personalized = status === 'granted';
    } else {
      personalized = true;
    }
  } catch (e) {
    note('suivi', e);
    personalized = false;
  }

  try {
    // Contenu calibré sur la classification 4+ de la fiche App Store.
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.G,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds().initialize();
  } catch (e) {
    note('initialisation', e);
    canRequestAds = false;
  }

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
  } catch (e) {
    note('options de confidentialité', e);
  }
}

/**
 * Efface le consentement mémorisé et rejoue la demande. Permet de revoir le
 * formulaire sans désinstaller l'app — indispensable pour tester.
 */
export async function resetConsent(): Promise<void> {
  try {
    AdsConsent.reset();
  } catch (e) {
    note('réinitialisation', e);
  }
  await gather();
  preload();
}

export type AdsDiagnostics = {
  consentStatus: string;
  canRequestAds: boolean;
  formAvailable: boolean | null;
  privacyOptionsRequired: boolean;
  personalized: boolean;
  adLoaded: boolean;
  requestCount: number;
  lastError: string | null;
};

/** Photographie de l'état du SDK, pour le bloc de diagnostic des réglages. */
export function getAdsDiagnostics(): AdsDiagnostics {
  return {
    consentStatus,
    canRequestAds,
    formAvailable,
    privacyOptionsRequired,
    personalized,
    adLoaded,
    requestCount,
    lastError,
  };
}

/**
 * Montre l'interstitiel avant de démarrer une partie, puis résout. Si aucune
 * pub n'est prête, résout aussitôt et relance un chargement pour la fois
 * suivante : la partie démarre sans attendre, dans tous les cas.
 */
export async function showBeforeMatch(): Promise<void> {
  if (!canRequestAds) return;

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
      // Filet : si l'événement de fermeture n'arrive pas, on ne retient pas
      // le joueur devant un écran bloqué.
      setTimeout(resolve, 30000);
    });
    await ad.show();
    await closed;
  } catch (e) {
    note('affichage', e);
  } finally {
    preload();
  }
}
