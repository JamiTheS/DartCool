/**
 * Compose les « ressources créatives » de la page produit App Store :
 *
 *   - En-tête              3840 × 1646  (21:9)
 *   - Résultats de recherche 3840 × 2560 (3:2)
 *
 *   npm run store:creative
 *
 * Même charte que les captures (porcelaine, cible en filigrane, rose et pêche) :
 * les deux générateurs doivent rester cohérents, c'est la même page produit.
 *
 * Le nom et l'icône de l'app sont superposés par le système par-dessus l'en-tête :
 * on garde donc le centre bas dégagé et on ne redessine pas le logotype.
 *
 * Sortie en JPEG qualité 92 : Apple accepte JPEG/JPG/PNG, et le JPEG évite des
 * fichiers de plusieurs dizaines de mégaoctets à ces dimensions.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = resolve(HERE, '../store/raw');
const OUT = resolve(HERE, '../store/appstore/creative');

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

/** Fond paysage : dégradé porcelaine, halo rose, cible en filigrane. */
function background(W, H, board) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stop-color="${COL.bgTop}"/>
        <stop offset="45%" stop-color="${COL.bg}"/>
        <stop offset="100%" stop-color="#E9E7EE"/>
      </linearGradient>
      <radialGradient id="halo" cx="50%" cy="50%" r="50%">
        <stop offset="35%" stop-color="${COL.pink}" stop-opacity="0.26"/>
        <stop offset="100%" stop-color="${COL.pink}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="halo2" cx="50%" cy="50%" r="50%">
        <stop offset="35%" stop-color="${COL.peach}" stop-opacity="0.20"/>
        <stop offset="100%" stop-color="${COL.peach}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <circle cx="${board.x}" cy="${board.y}" r="${board.r * 1.9}" fill="url(#halo)"/>
    <circle cx="${W * 0.92}" cy="${H * 0.88}" r="${H * 0.45}" fill="url(#halo2)"/>
    <g transform="translate(${board.x} ${board.y})" opacity="${board.opacity}">${boardSvg(board.r)}</g>
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

/** Capture d'écran : coins arrondis, filet clair. */
async function device(file, width) {
  const src = sharp(resolve(RAW, file));
  const meta = await src.metadata();
  const height = Math.round((meta.height / meta.width) * width);
  const r = Math.round(width * 0.085);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  );
  const frame = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="${r}" ry="${r}" fill="none" stroke="rgba(22,22,28,0.10)" stroke-width="4"/></svg>`
  );
  const body = await src
    .resize(width, height)
    .composite([
      { input: mask, blend: 'dest-in' },
      { input: frame, blend: 'over' },
    ])
    .png()
    .toBuffer();
  return { body, width, height, r };
}

async function shadowFor(dev, blur, alpha) {
  const pad = Math.round(blur * 3);
  return {
    pad,
    buf: await sharp(
      Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${dev.width + pad * 2}" height="${dev.height + pad * 2}"><rect x="${pad}" y="${pad}" width="${dev.width}" height="${dev.height}" rx="${dev.r}" fill="rgba(22,22,28,${alpha})"/></svg>`
      )
    )
      .blur(blur)
      .png()
      .toBuffer(),
  };
}

/**
 * Recadre un calque sur les bords du canevas. `sharp` refuse de composer une
 * image qui dépasse : sans cela, impossible de faire déborder volontairement
 * une capture sous la bordure basse.
 */
async function clamp(buf, w, h, left, top, W, H) {
  let sx = 0;
  let sy = 0;
  let sw = w;
  let sh = h;
  let L = left;
  let T = top;
  if (L < 0) {
    sx = -L;
    sw -= sx;
    L = 0;
  }
  if (T < 0) {
    sy = -T;
    sh -= sy;
    T = 0;
  }
  if (L + sw > W) sw = W - L;
  if (T + sh > H) sh = H - T;
  if (sw <= 0 || sh <= 0) return null;
  const cropped =
    sx || sy || sw !== w || sh !== h
      ? await sharp(buf).extract({ left: sx, top: sy, width: sw, height: sh }).png().toBuffer()
      : buf;
  return { input: cropped, left: L, top: T };
}

/** Une composition : fond, rangée de téléphones, bloc de texte. */
async function compose({
  W,
  H,
  out,
  board,
  phones,
  devWidth,
  devTop,
  gap,
  title,
  sub,
  kicker,
  textLeft,
  textTop,
  titleSize,
  subSize,
  kickSize,
}) {
  const bg = background(W, H, board);
  const layers = [];

  const devs = [];
  for (const p of phones) devs.push(await device(p, devWidth));

  const totalW = devs.length * devWidth + (devs.length - 1) * gap;
  const startX = W - totalW - Math.round(W * 0.055);

  for (let i = 0; i < devs.length; i += 1) {
    const dev = devs[i];
    // La capture du milieu est remontée : la rangée respire sans rotation.
    const lift = i === 1 ? Math.round(devWidth * 0.1) : 0;
    const top = devTop - lift;
    const left = startX + i * (devWidth + gap);
    const sh = await shadowFor(dev, Math.round(devWidth * 0.045), 0.17);
    const shLayer = await clamp(
      sh.buf,
      dev.width + sh.pad * 2,
      dev.height + sh.pad * 2,
      left - sh.pad,
      top - sh.pad + Math.round(devWidth * 0.03),
      W,
      H
    );
    if (shLayer) layers.push(shLayer);
    const devLayer = await clamp(dev.body, dev.width, dev.height, left, top, W, H);
    if (devLayer) layers.push(devLayer);
  }

  const barW = Math.round(W * 0.035);
  layers.push({
    input: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${barW}" height="${Math.round(barW * 0.09)}"><rect width="${barW}" height="${Math.round(barW * 0.09)}" rx="${Math.round(barW * 0.045)}" fill="${COL.pink}"/></svg>`
    ),
    left: textLeft,
    top: textTop,
  });

  // La colonne de texte s'arrête avant la première capture : aucun
  // chevauchement possible, quelles que soient la taille et le nombre de
  // téléphones.
  const textWidth = startX - textLeft - Math.round(W * 0.03);

  const kick = await text(kicker, {
    font: `Segoe UI Semibold ${kickSize}`,
    color: COL.pinkInk,
    width: textWidth,
    spacing: 4200,
  });
  const ttl = await text(title, {
    font: `Bahnschrift SemiBold Condensed ${titleSize}`,
    color: COL.ink,
    width: textWidth,
    spacing: 900,
  });
  const sb = await text(sub, {
    font: `Segoe UI ${subSize}`,
    color: COL.ink2,
    width: textWidth,
  });

  const kickTop = textTop + Math.round(barW * 0.09) + Math.round(H * 0.035);
  const ttlTop = kickTop + kick.info.height + Math.round(H * 0.022);
  const sbTop = ttlTop + ttl.info.height + Math.round(H * 0.028);

  layers.push({ input: kick.data, left: textLeft, top: kickTop });
  layers.push({ input: ttl.data, left: textLeft - 4, top: ttlTop });
  layers.push({ input: sb.data, left: textLeft, top: sbTop });

  const img = sharp(bg).composite(layers);
  // Le 16:9 5244 × 2950 n'est accepté qu'en PNG ; les autres tailles passent en
  // JPEG, bien plus léger à ces dimensions.
  const done = out.endsWith('.png')
    ? img.png({ compressionLevel: 9, effort: 10, palette: false })
    : img.jpeg({ quality: 92, chromaSubsampling: '4:4:4' });
  await done.toFile(resolve(OUT, out));
  console.log('  ', out, `${W} × ${H}`);
}

await mkdir(OUT, { recursive: true });
console.log('Composition des ressources créatives');

// En-tête 21:9. ATTENTION : Apple documente bien 3840 × 1646 en JPEG, mais
// App Store Connect l'a refusé le 18/10/2026 avec « les dimensions du fichier
// ne sont pas valides », y compris envoyé seul. C'est donc le PNG 16:9 plus bas
// qui sert d'en-tête. On garde cette composition : elle redeviendra utile le
// jour où la validation acceptera le format documenté.
await compose({
  W: 3840,
  H: 1646,
  out: 'header-3840x1646.jpg',
  board: { x: 430, y: 800, r: 500, opacity: 0.11 },
  phones: ['02-x01.png', '01-home.png', '05-summary.png'],
  devWidth: 700,
  // Les captures débordent franchement sous le bord bas : dans un format aussi
  // large, une rangée qui s'arrête juste avant la bordure a l'air accidentelle.
  devTop: 300,
  gap: 70,
  kicker: 'GRATUIT · HORS LIGNE · SANS PUBLICITÉ',
  title: 'TAPE SUR LA CIBLE,\nLE SCORE SUIT',
  sub: '13 formats prêts à lancer, les sorties calculées en direct, les statistiques de chaque joueur.',
  textLeft: 210,
  textTop: 430,
  titleSize: 132,
  subSize: 44,
  kickSize: 30,
});

// Résultats de recherche : 3:2.
await compose({
  W: 3840,
  H: 2560,
  out: 'search-3840x2560.jpg',
  board: { x: 560, y: 1180, r: 620, opacity: 0.11 },
  phones: ['02-x01.png', '01-home.png'],
  devWidth: 980,
  devTop: 430,
  gap: 90,
  kicker: 'GRATUIT · HORS LIGNE · SANS PUBLICITÉ',
  title: 'TAPE SUR LA CIBLE,\nLE SCORE SUIT',
  sub: '501, cricket, tour de cadran, killer, golf… 13 formats, les sorties calculées en direct et les statistiques de chaque joueur.',
  textLeft: 250,
  textTop: 880,
  titleSize: 170,
  subSize: 56,
  kickSize: 36,
});

// Format universel 16:9, PNG obligatoire. App Store Connect refuse le 21:9
// 3840 × 1646 pourtant documenté ; c'est ce fichier-ci qui sert d'en-tête.
await compose({
  W: 5244,
  H: 2950,
  out: 'universel-5244x2950.png',
  board: { x: 1040, y: 1480, r: 880, opacity: 0.11 },
  phones: ['02-x01.png', '01-home.png'],
  devWidth: 1200,
  devTop: 420,
  gap: 120,
  kicker: 'GRATUIT · HORS LIGNE · SANS PUBLICITÉ',
  title: 'TAPE SUR LA CIBLE,\nLE SCORE SUIT',
  sub: '501, cricket, tour de cadran, killer, golf… 13 formats, les sorties calculées en direct et les statistiques de chaque joueur.',
  textLeft: 320,
  textTop: 1020,
  titleSize: 200,
  subSize: 64,
  kickSize: 42,
});

console.log('Terminé →', OUT);
