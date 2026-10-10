/**
 * Compose les captures App Store (1290 × 2796) à partir des captures brutes
 * de l'app (store/raw) : fond dégradé, cible en filigrane, titre, sous-titre,
 * et la capture elle-même avec coins arrondis et ombre portée.
 *
 *   npm run store:shots
 *
 * Les captures brutes sont de vraies captures de l'application, prises à
 * 430 × 932 points en densité 3 — exactement le format demandé par Apple.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = resolve(HERE, '../store/raw');
const OUT = resolve(HERE, '../store/appstore/iphone-6.9');

const W = 1290;
const H = 2796;
const COL = {
  base: '#0B0E0C',
  deep: '#070908',
  chalk: '#F3F0E7',
  dim: '#A9B0A6',
  brass: '#F0B429',
  red: '#D23B2E',
  green: '#2FA86B',
  sisal: '#D9C08A',
  dark: '#171A18',
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
    out += `<path d="${ring(R * 0.858, R, a - 9, a + 9)}" fill="${dark ? COL.red : COL.green}"/>`;
    out += `<path d="${ring(R * 0.643, R * 0.858, a - 9, a + 9)}" fill="${dark ? COL.dark : COL.sisal}"/>`;
    out += `<path d="${ring(R * 0.5, R * 0.643, a - 9, a + 9)}" fill="${dark ? COL.red : COL.green}"/>`;
    out += `<path d="${ring(R * 0.155, R * 0.5, a - 9, a + 9)}" fill="${dark ? COL.dark : COL.sisal}"/>`;
  });
  out += `<circle r="${f(R * 0.155)}" fill="${COL.green}"/><circle r="${f(R * 0.072)}" fill="${COL.red}"/>`;
  return out;
}

/** Fond : dégradé sombre + cible en filigrane en haut à droite. */
function background() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#121813"/>
        <stop offset="55%" stop-color="${COL.base}"/>
        <stop offset="100%" stop-color="${COL.deep}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <g transform="translate(1180 180)" opacity="0.13">${boardSvg(330)}</g>
    <g opacity="0.1"><rect x="0" y="470" width="${W}" height="1" fill="${COL.chalk}"/></g>
  </svg>`);
}

async function text(str, { font, color, width, align = 'left', spacing = 0 }) {
  const markup = `<span foreground="${color}" letter_spacing="${spacing}">${str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')}</span>`;
  return sharp({
    text: { text: markup, font, rgba: true, width, align, wrap: 'word' },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

/** Capture d'écran : coins arrondis, filet clair, ombre portée. */
async function device(file, width) {
  const src = sharp(resolve(RAW, file));
  const meta = await src.metadata();
  const height = Math.round((meta.height / meta.width) * width);
  const r = Math.round(width * 0.075);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  );
  const frame = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${r}" ry="${r}" fill="none" stroke="rgba(243,240,231,0.22)" stroke-width="2.5"/></svg>`
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
    raw: '01-home.png',
    out: '01-modes.png',
    title: 'TOUS LES JEUX\nDE FLÉCHETTES',
    sub: '13 formats prêts à lancer : 501, cricket, tour de cadran, killer, golf…',
  },
  {
    raw: '02-x01.png',
    out: '02-x01.png',
    title: 'LE RESTE, TOUJOURS\nSOUS LES YEUX',
    sub: 'Et la sortie conseillée, calculée à chaque fléchette.',
  },
  {
    raw: '04-board.png',
    out: '03-cible.png',
    title: 'SAISIS SUR\nLA VRAIE CIBLE',
    sub: 'Appuie là où la fléchette est plantée. Le reste s’éteint.',
  },
  {
    raw: '03-cricket.png',
    out: '04-cricket.png',
    title: 'LE PAVÉ SAIT\nCE QU’IL TE FAUT',
    sub: 'Au cricket, seules les cibles utiles restent allumées.',
  },
  {
    raw: '05-summary.png',
    out: '05-stats.png',
    title: 'LES STATS\nQUI COMPTENT',
    sub: 'Moyenne, 180, meilleure manche, plus haute sortie.',
  },
  {
    raw: '07-sorties.png',
    out: '06-sorties.png',
    title: 'LA TABLE\nDES SORTIES',
    sub: 'De 170 à 2, le chemin conseillé en sortie double.',
  },
  {
    raw: '06-modes.png',
    out: '07-regles.png',
    title: 'LES RÈGLES\nDANS LA POCHE',
    sub: 'Dix modes expliqués, plus le lexique des fléchettes.',
  },
];

await mkdir(OUT, { recursive: true });
console.log('Composition des captures App Store');

const DEV_W = 1040;
const DEV_X = Math.round((W - DEV_W) / 2);
const DEV_Y = 520;

for (const shot of SHOTS) {
  const bg = background();
  const dev = await device(shot.raw, DEV_W);

  const title = await text(shot.title, {
    font: 'Bahnschrift SemiBold Condensed 78',
    color: COL.chalk,
    width: W - 160,
    spacing: 1200,
  });
  const sub = await text(shot.sub, {
    font: 'Segoe UI 34',
    color: COL.dim,
    width: W - 220,
  });

  // Ombre portée : la capture floutée et assombrie, légèrement décalée.
  const shadow = await sharp(dev.body)
    .resize(dev.width, dev.height)
    .modulate({ brightness: 0.01 })
    .blur(34)
    .png()
    .toBuffer();

  const titleTop = 150;
  const subTop = titleTop + title.info.height + 26;

  await sharp(bg)
    .composite([
      { input: shadow, left: DEV_X, top: DEV_Y + 26 },
      { input: dev.body, left: DEV_X, top: DEV_Y },
      { input: title.data, left: 80, top: titleTop },
      { input: sub.data, left: 84, top: subTop },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="8"><rect width="110" height="8" rx="4" fill="${COL.brass}"/></svg>`
        ),
        left: 84,
        top: titleTop - 46,
      },
    ])
    .flatten({ background: COL.base })
    .png({ compressionLevel: 9 })
    .toFile(resolve(OUT, shot.out));
  console.log(`  ${shot.out}`);
}

console.log(`Terminé : ${SHOTS.length} captures dans store/appstore/iphone-6.9`);

// App Store Connect ne demande plus qu'une famille d'écrans iPhone (6,1"/6,3") :
// on décline le même rendu en 1206 × 2622, la taille attendue au chargement.
const OUT_61 = resolve(HERE, '../store/appstore/iphone-6.3');
await mkdir(OUT_61, { recursive: true });
for (const shot of SHOTS) {
  await sharp(resolve(OUT, shot.out))
    .resize(1206, 2622, { fit: 'fill', kernel: 'lanczos3' })
    .flatten({ background: COL.base })
    .png({ compressionLevel: 9 })
    .toFile(resolve(OUT_61, shot.out));
}
console.log(`Terminé : ${SHOTS.length} captures 1206 × 2622 dans store/appstore/iphone-6.3`);
