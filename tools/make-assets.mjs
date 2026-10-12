/**
 * Génère les visuels de l'app à partir d'un seul dessin vectoriel :
 * icône App Store, icône Android (3 couches), image de splash, favicon.
 *
 *   npm run assets
 *
 * Aucun fichier binaire n'est édité à la main : tout se régénère d'ici.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../assets/images');

const COL = {
  base: '#F5F4F7',
  deep: '#ECEAF0',
  chalk: '#FFFFFF',
  pink: '#FF9EC4',
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

/** La cible, dessinée dans un repère centré, rayon extérieur `R`. */
function board(R, { wire = true } = {}) {
  const rOut = R;
  const rDblIn = R * 0.858;
  const rTrpOut = R * 0.643;
  const rTrpIn = R * 0.5;
  const rBullOut = R * 0.155;
  const rBullIn = R * 0.072;
  let out = '';
  SECTORS.forEach((n, i) => {
    const a = -90 + i * 18;
    const a1 = a - 9;
    const a2 = a + 9;
    const dark = i % 2 === 0;
    const single = dark ? COL.dark : COL.light;
    const ringCol = dark ? COL.pink : COL.peach;
    out += `<path d="${ring(rDblIn, rOut, a1, a2)}" fill="${ringCol}"/>`;
    out += `<path d="${ring(rTrpOut, rDblIn, a1, a2)}" fill="${single}"/>`;
    out += `<path d="${ring(rTrpIn, rTrpOut, a1, a2)}" fill="${ringCol}"/>`;
    out += `<path d="${ring(rBullOut, rTrpIn, a1, a2)}" fill="${single}"/>`;
  });
  if (wire) {
    SECTORS.forEach((n, i) => {
      const a = -90 + i * 18 - 9;
      const [x1, y1] = pt(rBullOut, a);
      const [x2, y2] = pt(rOut, a);
      out += `<path d="M ${f(x1)} ${f(y1)} L ${f(x2)} ${f(y2)}" stroke="rgba(0,0,0,0.5)" stroke-width="${R * 0.008}"/>`;
    });
  }
  out += `<circle r="${f(rBullOut)}" fill="${COL.peach}"/>`;
  out += `<circle r="${f(rBullIn)}" fill="${COL.pink}"/>`;
  out += `<circle r="${f(rOut + R * 0.045)}" fill="none" stroke="${COL.rim}" stroke-width="${R * 0.09}"/>`;
  out += `<circle r="${f(rOut + R * 0.105)}" fill="none" stroke="url(#bezel)" stroke-width="${R * 0.03}"/>`;
  return out;
}

/** Une fléchette plantée dans le triple 20, vue de trois quarts. */
function dartMark(R) {
  // Pointe dans l'anneau de triple du 20 (en haut), fût vers le coin haut droit.
  const tip = pt(R * 0.57, -90);
  const dir = -38; // direction du fût, en degrés
  const len = R * 0.92;
  const shaftEnd = [tip[0] + len * Math.cos(rad(dir)), tip[1] + len * Math.sin(rad(dir))];
  const barrelEnd = [tip[0] + len * 0.44 * Math.cos(rad(dir)), tip[1] + len * 0.44 * Math.sin(rad(dir))];
  const w = R * 0.085;
  const nx = Math.cos(rad(dir + 90));
  const ny = Math.sin(rad(dir + 90));

  const quad = (p1, p2, w1, w2) =>
    `M ${f(p1[0] + nx * w1)} ${f(p1[1] + ny * w1)} L ${f(p2[0] + nx * w2)} ${f(p2[1] + ny * w2)} L ${f(p2[0] - nx * w2)} ${f(p2[1] - ny * w2)} L ${f(p1[0] - nx * w1)} ${f(p1[1] - ny * w1)} Z`;

  // Ailette : deux triangles crème autour du bout du fût.
  const tailA = [shaftEnd[0] + nx * w * 2.6, shaftEnd[1] + ny * w * 2.6];
  const tailB = [shaftEnd[0] - nx * w * 2.6, shaftEnd[1] - ny * w * 2.6];
  const mid = barrelEnd;

  return [
    `<g>`,
    `<path d="${quad(tip, barrelEnd, w * 0.18, w)}" fill="#C9CCC8"/>`,
    `<path d="${quad(barrelEnd, shaftEnd, w, w * 0.6)}" fill="${COL.brass}"/>`,
    `<path d="M ${f(mid[0])} ${f(mid[1])} L ${f(tailA[0])} ${f(tailA[1])} L ${f(shaftEnd[0])} ${f(shaftEnd[1])} Z" fill="${COL.chalk}" opacity="0.95"/>`,
    `<path d="M ${f(mid[0])} ${f(mid[1])} L ${f(tailB[0])} ${f(tailB[1])} L ${f(shaftEnd[0])} ${f(shaftEnd[1])} Z" fill="${COL.sisal}"/>`,
    `</g>`,
  ].join('');
}

function svgIcon(size, { bg = true, scale = 1, dart = true, margin = 0.70 } = {}) {
  const half = size / 2;
  const R = half * margin * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="g" cx="50%" cy="34%" r="78%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="62%" stop-color="${COL.base}"/>
      <stop offset="100%" stop-color="${COL.deep}"/>
    </radialGradient>
    <linearGradient id="bezel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EAF1FF"/>
      <stop offset="30%" stop-color="#FFFFFF"/>
      <stop offset="52%" stop-color="#FFE3C2"/>
      <stop offset="74%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#DBE8FF"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="#FF9EC4" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#FF9EC4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${bg ? `<rect width="${size}" height="${size}" fill="url(#g)"/>` : ''}
  ${bg ? `<circle cx="${half}" cy="${half}" r="${f(R * 1.55)}" fill="url(#halo)"/>` : ''}
  <g transform="translate(${half} ${half})">
    ${board(R)}
    ${dart ? dartMark(R) : ''}
  </g>
</svg>`;
}

function svgMono(size) {
  const half = size / 2;
  const R = half * 0.78;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <g transform="translate(${half} ${half})">
    <circle r="${f(R)}" fill="#fff"/>
    <circle r="${f(R * 0.64)}" fill="#000"/>
    <circle r="${f(R * 0.44)}" fill="#fff"/>
    <circle r="${f(R * 0.16)}" fill="#000"/>
  </g>
</svg>`;
}

async function png(svg, file, size, { alpha = true } = {}) {
  let img = sharp(Buffer.from(svg), { density: 384 }).resize(size, size);
  if (!alpha) img = img.flatten({ background: COL.base });
  await img.png({ compressionLevel: 9 }).toFile(resolve(OUT, file));
  console.log(`  ${file}  ${size}×${size}`);
}

await mkdir(OUT, { recursive: true });
console.log('Génération des visuels DartCool');

// Icône App Store / iOS : 1024, sans transparence, sans coins arrondis.
await png(svgIcon(1024, { dart: false, margin: 0.74 }), 'icon.png', 1024, { alpha: false });

// Android : premier plan dans la zone sûre (66 %), fond uni, monochrome.
await png(svgIcon(432, { bg: false, scale: 0.66, dart: false }), 'android-icon-foreground.png', 432);
await png(
  `<svg xmlns="http://www.w3.org/2000/svg" width="432" height="432"><rect width="432" height="432" fill="${COL.base}"/></svg>`,
  'android-icon-background.png',
  432
);
await png(svgMono(432), 'android-icon-monochrome.png', 432);

// Splash : la cible seule, sur fond transparent.
await png(svgIcon(512, { bg: false, dart: false, scale: 0.92 }), 'splash-icon.png', 512);

// Favicon web.
await png(svgIcon(64, { dart: false }), 'favicon.png', 64, { alpha: false });

console.log('Terminé.');
