/**
 * Solveur de finitions (« checkout »).
 * Donne le meilleur chemin pour sortir d'un reste donné avec les fléchettes
 * restantes, en respectant la règle de sortie. Les finitions classiques du
 * circuit sont privilégiées via une table de préférences ; tout le reste est
 * résolu par recherche exhaustive (l'espace est minuscule : 62 valeurs
 * possibles, 3 fléchettes au plus).
 */
import { ALL_DARTS, Dart, isDouble, isTriple, targetLabel, value } from './darts';

export type OutRule = 'double' | 'straight' | 'master';

function closesOut(d: Dart, rule: OutRule): boolean {
  if (rule === 'straight') return true;
  if (rule === 'master') return isDouble(d) || isTriple(d);
  return isDouble(d);
}

/** Finitions standard du circuit professionnel, en sortie double. */
const PREFERRED: Record<number, string[]> = {
  170: ['T20', 'T20', 'BULL'],
  167: ['T20', 'T19', 'BULL'],
  164: ['T20', 'T18', 'BULL'],
  161: ['T20', 'T17', 'BULL'],
  160: ['T20', 'T20', 'D20'],
  158: ['T20', 'T20', 'D19'],
  157: ['T20', 'T19', 'D20'],
  156: ['T20', 'T20', 'D18'],
  155: ['T20', 'T19', 'D19'],
  154: ['T20', 'T18', 'D20'],
  153: ['T20', 'T19', 'D18'],
  152: ['T20', 'T20', 'D16'],
  151: ['T20', 'T17', 'D20'],
  150: ['T20', 'T18', 'D18'],
  149: ['T20', 'T19', 'D16'],
  148: ['T20', 'T16', 'D20'],
  147: ['T20', 'T17', 'D18'],
  146: ['T20', 'T18', 'D16'],
  145: ['T20', 'T15', 'D20'],
  144: ['T20', 'T20', 'D12'],
  143: ['T20', 'T17', 'D16'],
  142: ['T20', 'T14', 'D20'],
  141: ['T20', 'T19', 'D12'],
  140: ['T20', 'T20', 'D10'],
  139: ['T20', 'T13', 'D20'],
  138: ['T20', 'T18', 'D12'],
  137: ['T20', 'T19', 'D10'],
  136: ['T20', 'T20', 'D8'],
  135: ['T20', 'T17', 'D12'],
  134: ['T20', 'T14', 'D16'],
  133: ['T20', 'T19', 'D8'],
  132: ['T20', 'T16', 'D12'],
  131: ['T20', 'T13', 'D16'],
  130: ['T20', 'T18', 'D8'],
  129: ['T19', 'T16', 'D12'],
  128: ['T18', 'T14', 'D16'],
  127: ['T20', 'T17', 'D8'],
  126: ['T19', 'T19', 'D6'],
  125: ['T20', 'T19', 'D4'],
  124: ['T20', 'T16', 'D8'],
  123: ['T19', 'T16', 'D9'],
  122: ['T18', 'T18', 'D7'],
  121: ['T20', 'T11', 'D14'],
  120: ['T20', '20', 'D20'],
  119: ['T19', 'T10', 'D16'],
  118: ['T20', '18', 'D20'],
  117: ['T20', '17', 'D20'],
  116: ['T20', '16', 'D20'],
  115: ['T20', '15', 'D20'],
  114: ['T20', '14', 'D20'],
  113: ['T20', '13', 'D20'],
  112: ['T20', '12', 'D20'],
  111: ['T20', '19', 'D16'],
  110: ['T20', 'BULL'],
  109: ['T20', '17', 'D16'],
  108: ['T20', '16', 'D16'],
  107: ['T19', 'BULL'],
  106: ['T20', '14', 'D16'],
  105: ['T20', '13', 'D16'],
  104: ['T18', 'BULL'],
  103: ['T19', '10', 'D18'],
  102: ['T20', '10', 'D16'],
  101: ['T17', 'BULL'],
  100: ['T20', 'D20'],
  99: ['T19', '10', 'D16'],
  98: ['T20', 'D19'],
  97: ['T19', 'D20'],
  96: ['T20', 'D18'],
  95: ['T19', 'D19'],
  94: ['T18', 'D20'],
  93: ['T19', 'D18'],
  92: ['T20', 'D16'],
  91: ['T17', 'D20'],
  90: ['T20', 'D15'],
  89: ['T19', 'D16'],
  88: ['T20', 'D14'],
  87: ['T17', 'D18'],
  86: ['T18', 'D16'],
  85: ['T15', 'D20'],
  84: ['T20', 'D12'],
  83: ['T17', 'D16'],
  82: ['BULL', 'D16'],
  81: ['T19', 'D12'],
  80: ['T20', 'D10'],
  79: ['T19', 'D11'],
  78: ['T18', 'D12'],
  77: ['T19', 'D10'],
  76: ['T20', 'D8'],
  75: ['T17', 'D12'],
  74: ['T14', 'D16'],
  73: ['T19', 'D8'],
  72: ['T16', 'D12'],
  71: ['T13', 'D16'],
  70: ['T18', 'D8'],
  69: ['T19', 'D6'],
  68: ['T20', 'D4'],
  67: ['T17', 'D8'],
  66: ['T10', 'D18'],
  65: ['T19', 'D4'],
  64: ['T16', 'D8'],
  63: ['T13', 'D12'],
  62: ['T10', 'D16'],
  61: ['T15', 'D8'],
  60: ['20', 'D20'],
  59: ['19', 'D20'],
  58: ['18', 'D20'],
  57: ['17', 'D20'],
  56: ['16', 'D20'],
  55: ['15', 'D20'],
  54: ['14', 'D20'],
  53: ['13', 'D20'],
  52: ['20', 'D16'],
  51: ['19', 'D16'],
  50: ['BULL'],
  49: ['17', 'D16'],
  48: ['16', 'D16'],
  47: ['15', 'D16'],
  46: ['14', 'D16'],
  45: ['13', 'D16'],
  44: ['12', 'D16'],
  43: ['11', 'D16'],
  42: ['10', 'D16'],
  41: ['9', 'D16'],
  40: ['D20'],
  39: ['7', 'D16'],
  38: ['D19'],
  37: ['5', 'D16'],
  36: ['D18'],
  35: ['3', 'D16'],
  34: ['D17'],
  33: ['1', 'D16'],
  32: ['D16'],
  31: ['15', 'D8'],
  30: ['D15'],
  29: ['13', 'D8'],
  28: ['D14'],
  27: ['11', 'D8'],
  26: ['D13'],
  25: ['9', 'D8'],
  24: ['D12'],
  23: ['7', 'D8'],
  22: ['D11'],
  21: ['5', 'D8'],
  20: ['D10'],
  19: ['3', 'D8'],
  18: ['D9'],
  17: ['1', 'D8'],
  16: ['D8'],
  15: ['7', 'D4'],
  14: ['D7'],
  13: ['5', 'D4'],
  12: ['D6'],
  11: ['3', 'D4'],
  10: ['D5'],
  9: ['1', 'D4'],
  8: ['D4'],
  7: ['3', 'D2'],
  6: ['D3'],
  5: ['1', 'D2'],
  4: ['D2'],
  3: ['1', 'D1'],
  2: ['D1'],
};

/** Intérêt d'une fléchette dans un chemin : on préfère les gros triples devant. */
function dartRank(d: Dart): number {
  if (d.seg === 25) return d.mult === 2 ? 55 : 25;
  return value(d) + (d.mult === 3 ? 6 : 0);
}

function solve(remaining: number, dartsLeft: number, rule: OutRule): Dart[] | null {
  if (remaining <= 0 || dartsLeft <= 0) return null;
  let best: Dart[] | null = null;
  let bestScore = -Infinity;

  const search = (left: number, budget: number, path: Dart[]) => {
    if (budget === 0) return;
    for (const d of ALL_DARTS) {
      const v = value(d);
      if (v > left) continue;
      if (v === left) {
        if (!closesOut(d, rule)) continue;
        const candidate = [...path, d];
        // Le moins de fléchettes d'abord, puis le chemin le plus naturel.
        const score = -candidate.length * 1000 + dartRank(candidate[0]);
        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
        continue;
      }
      if (budget - 1 === 0) continue;
      const rest = left - v;
      // Il faut pouvoir finir derrière : en sortie double, rester à 1 est mort.
      if (rule === 'double' && rest === 1) continue;
      search(rest, budget - 1, [...path, d]);
    }
  };

  search(remaining, dartsLeft, []);
  return best;
}

const cache = new Map<string, string[] | null>();

/**
 * Chemin conseillé pour sortir, en libellés (« T20 », « D16 »…).
 * `null` quand il n'existe aucune sortie avec les fléchettes restantes.
 */
export function checkout(
  remaining: number,
  dartsLeft: number,
  rule: OutRule = 'double'
): string[] | null {
  if (remaining < 2 && rule === 'double') return null;
  if (remaining < 1) return null;
  if (dartsLeft < 1) return null;

  const key = `${remaining}|${dartsLeft}|${rule}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  let res: string[] | null = null;
  const pref = rule === 'double' ? PREFERRED[remaining] : undefined;
  if (pref && pref.length <= dartsLeft) {
    res = pref;
  } else {
    const path = solve(remaining, dartsLeft, rule);
    res = path ? path.map((d) => targetLabel(d.seg, d.mult)) : null;
  }
  cache.set(key, res);
  return res;
}

/** Vrai si le reste est finissable avec une seule fléchette. */
export function isOneDartOut(remaining: number, rule: OutRule): boolean {
  if (remaining === 50) return true;
  if (rule === 'straight') return remaining <= 20 || remaining === 25;
  if (rule === 'master') {
    return (remaining % 2 === 0 && remaining <= 40) || (remaining % 3 === 0 && remaining <= 60);
  }
  return remaining % 2 === 0 && remaining <= 40;
}
