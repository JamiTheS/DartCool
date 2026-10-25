/**
 * Version web : aucune publicité.
 *
 * Le SDK Google Mobile Ads n'existe pas sur le web, et `npm run web` sert à
 * produire les captures de la fiche App Store — une pub y serait nuisible.
 * Metro choisit ce fichier automatiquement pour la plateforme web.
 */
export const ADS_DEBUG = false;

export async function initAds(): Promise<void> {}

export function hasPrivacyOptions(): boolean {
  return false;
}

export async function showPrivacyOptions(): Promise<void> {}

export async function resetConsent(): Promise<void> {}

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

export function getAdsDiagnostics(): AdsDiagnostics {
  return {
    consentStatus: 'web : pas de publicité',
    canRequestAds: false,
    formAvailable: null,
    privacyOptionsRequired: false,
    personalized: false,
    adLoaded: false,
    requestCount: 0,
    lastError: null,
  };
}

export async function showBeforeMatch(): Promise<void> {}
