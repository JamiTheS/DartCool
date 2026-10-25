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
 *    faire aucune demande dans l'UE — c'est silencieux et c'est normal.
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

/** En développement, les identifiants officiels de test de Google. */
const INTERSTITIAL_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-4942532111934732/6643593025';

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
    // encore. On retente, de plus en plus espacé, et chaque lancement de
    // partie relance de toute façon.
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
  } catch {
    // Affichage impossible : on passe, la partie démarre quand même.
  } finally {
    preload();
  }
}
