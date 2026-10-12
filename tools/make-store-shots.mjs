/**
 * Compose les captures App Store (1206 × 2622) à partir des captures brutes
 * de l'app (store/raw) : fond porcelaine, cible en filigrane, titre, sous-titre
 * et la capture elle-même avec coins arrondis et ombre portée.
 *
 *   npm run store:shots
 *
 * Les captures brutes sont de vraies captures de l'application, prises à
 * 402 × 874 points en densité 3 — exactement le format demandé par Apple pour
 * la famille iPhone 6,1"/6,3", la seule encore acceptée au chargement.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = resolve(HERE, '../store/raw');
const OUT = resolve(HERE, '../store/appstore/iphone-6.3');

const W = 1206;
const H = 2622;
const COL = {
  bg: '#F5F4F7',
  bgTop: '#FFFFFF',
  ink: '#16161C',
  ink2: '#6C6C78',
  pink: '#FF9EC4',
  pinkInk: '#D8528C',
  peach: '#FFC08A',
  rim: '#1B1B22',
  dark: '#16161C',
  light: '#DCDCE6',
};

const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const rad = (d) => (d * Math.PI) / 180;
const pt = (r, a) => [r * Math.cos(rad(a)), r * Math.sin(rad(a))];
const f = (n) => n.toFixed(2);
function ring(r1, r2, a1, a2) {
  const [x1, y1] = pt(r2, a1);
  const [x2, y2] = pt(r2, a2);
  const [x3, y3] = pt(r1, a2);
  const [x4, y4] = pt(r1, a1);
  return `M ${f(x1)} ${f(y1)} A ${r2} ${r2} 0 0 1 ${f(x2)} ${f(y2)} L ${f(x3)} ${f(y3)} A ${r1} ${r1} 0 0 0 ${f(x4)} ${f(y4)} Z`;
}
function boardSvg(R) {
  let out = '';
  SECTORS.forEach((n, i) => {
    const a = -90 + i * 18;
    const dark = i % 2 === 0;
    const body = dark ? COL.dark : COL.light;
    const col = dark ? COL.pink : COL.peach;
    out += `<path d="${ring(R * 0.858, R, a - 9, a + 9)}" fill="${col}"/>`;
    out += `<path d="${ring(R * 0.643, R * 0.858, a - 9, a + 9)}" fill="${body}"/>`;
    out += `<path d="${ring(R * 0.5, R * 0.643, a - 9, a + 9)}" fill="${col}"/>`;
    out += `<path d="${ring(R * 0.155, R * 0.5, a - 9, a + 9)}" fill="${body}"/>`;
  });
  out += `<circle r="${f(R * 0.155)}" fill="${COL.peach}"/><circle r="${f(R * 0.072)}" fill="${COL.pink}"/>`;
  out += `<circle r="${f(R * 1.06)}" fill="none" stroke="${COL.rim}" stroke-width="${R * 0.12}"/>`;
  return out;
}

/** Fond : dégradé porcelaine + cible en filigrane en haut à droite. */
function background() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stop-color="${COL.bgTop}"/>
        <stop offset="45%" stop-color="${COL.bg}"/>
        <stop offset="100%" stop-color="#ECEAF0"/>
      </linearGradient>
      <radialGradient id="halo" cx="50%" cy="50%" r="50%">
        <stop offset="40%" stop-color="${COL.pink}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${COL.pink}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <circle cx="1120" cy="170" r="430" fill="url(#halo)"/>
    <g transform="translate(1110 160)" opacity="0.14">${boardSvg(300)}</g>
  </svg>`);
}

async function text(str, { font, color, width, align = 'left', spacing = 0 }) {
  const markup = `<span foreground="${color}" letter_spacing="${spacing}">${str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')}</span>`;
  return sharp({ text: { text: markup, font, rgba: true, width, align, wrap: 'word' } })
    .png()
    .toBuffer({ resolveWithObject: true });
}

/** Capture d'écran : coins arrondis, filet clair, ombre portée. */
async function device(file, width) {
  const src = sharp(resolve(RAW, file));
  const meta = await src.metadata();
  const height = Math.round((meta.height / meta.width) * width);
  const r = Math.round(width * 0.085);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  );
  const frame = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${r}" ry="${r}" fill="none" stroke="rgba(22,22,28,0.10)" stroke-width="2"/></svg>`
  );
  const body = await src
    .resize(width, height)
    .composite([
      { input: mask, blend: 'dest-in' },
      { input: frame, blend: 'over' },
    ])
    .png()
    .toBuffer();
  return { body, width, height };
}

const SHOTS = [
  {
    raw: '02-x01.png',
    out: '01-cible.png',
    title: 'TAPE SUR LA CIBLE,\nC’EST TOUT',
    sub: 'Chaque fléchette laisse sa marque à l’endroit touché. Le score suit tout seul.',
  },
  {
    raw: '01-home.png',
    out: '02-modes.png',
    title: 'TOUS LES JEUX\nDE FLÉCHETTES',
    sub: '13 formats prêts à lancer : 501, cricket, tour de cadran, killer, golf…',
  },
  {
    raw: '03-cricket.png',
    out: '03-cricket.png',
    title: 'LA CIBLE SAIT\nCE QU’IL TE FAUT',
    sub: 'Au cricket, seules les cibles utiles restent allumées.',
  },
  {
    raw: '04-pad.png',
    out: '04-pave.png',
    title: 'OU LE PAVÉ,\nSI TU PRÉFÈRES',
    sub: 'Trois façons de saisir, à un appui l’une de l’autre.',
  },
  {
    raw: '05-summary.png',
    out: '05-stats.png',
    title: 'LES STATS\nQUI COMPTENT',
    sub: 'Moyenne, 180, meilleure manche, plus haute sortie.',
  },
  {
    raw: '06-sorties.png',
    out: '06-sorties.png',
    title: 'LA TABLE\nDES SORTIES',
    sub: 'De 170 à 2, le chemin conseillé en sortie double.',
  },
];

await mkdir(OUT, { recursive: true });
console.log('Composition des captures App Store');

const DEV_W = 960;
const DEV_X = Math.round((W - DEV_W) / 2);
const DEV_Y = 500;

for (const shot of SHOTS) {
  const bg = background();
  const dev = await device(shot.raw, DEV_W);

  const title = await text(shot.title, {
    font: 'Bahnschrift SemiBold Condensed 74',
    color: COL.ink,
    width: W - 160,
    spacing: 1100,
  });
  const sub = await text(shot.sub, {
    font: 'Segoe UI 32',
    color: COL.ink2,
    width: W - 220,
  });

  // Ombre douce : un rectangle arrondi flouté, pas la capture assombrie —
  // sinon le dégradé de l'app bave sur les bords.
  const shadow = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${dev.width + 80}" height="${dev.height + 80}"><rect x="40" y="40" width="${dev.width}" height="${dev.height}" rx="${Math.round(dev.width * 0.085)}" fill="rgba(22,22,28,0.16)"/></svg>`
    )
  )
    .blur(26)
    .png()
    .toBuffer();

  const titleTop = 146;
  const subTop = titleTop + title.info.height + 24;

  await sharp(bg)
    .composite([
      { input: shadow, left: DEV_X - 40, top: DEV_Y - 40 + 22, blend: 'over' },
      { input: dev.body, left: DEV_X, top: DEV_Y },
      { input: title.data, left: 78, top: titleTop },
      { input: sub.data, left: 82, top: subTop },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="104" height="8"><rect width="104" height="8" rx="4" fill="${COL.pink}"/></svg>`
        ),
        left: 82,
        top: titleTop - 44,
      },
    ])
    .flatten({ background: COL.bg })
    .png({ compressionLevel: 9 })
    .toFile(resolve(OUT, shot.out));
  console.log(`  ${shot.out}`);
}

console.log(`Terminé : ${SHOTS.length} captures dans store/appstore/iphone-6.3`);
