/**
 * Version web : aucune publicité.
 *
 * Le SDK Google Mobile Ads n'existe pas sur le web, et `npm run web` sert à
 * produire les captures de la fiche App Store — une pub y serait nuisible.
 * Metro choisit ce fichier automatiquement pour la plateforme web.
 */
export async function initAds(): Promise<void> {}

export function hasPrivacyOptions(): boolean {
  return false;
}

export async function showPrivacyOptions(): Promise<void> {}

export async function onGameFinished(_matchId: string | null): Promise<void> {}
