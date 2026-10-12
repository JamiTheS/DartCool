/**
 * La cible : la saisie principale de l'app.
 *
 * On appuie exactement là où la fléchette est plantée — secteur, anneau de
 * double (rose), anneau de triple (pêche), 25, bull, ou hors cible. Chaque
 * appui laisse une marque rouge à l'endroit touché ; les trois marques
 * disparaissent quand la main passe au joueur suivant.
 *
 * La détection se fait en coordonnées polaires sur le point touché, pas avec
 * quatre-vingts zones cliquables : c'est plus précis, et c'est ce qui permet
 * de savoir où poser la marque.
 */
import React, { useState } from 'react';
import { GestureResponderEvent, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { Dart, SECTORS } from '../engine';
import { C, FONT, SP, T } from '../theme/tokens';
import { tapError, tapLight } from '../utils/feedback';

/** Repère du dessin : un carré de 264 unités, centre en (0,0). */
const VIEW = 132;
/**
 * Rayons. Les anneaux de double et de triple sont volontairement plus épais
 * que sur une vraie cible : à l'échelle réelle ils feraient 13 px à l'écran,
 * ce qui est intapable au pouce.
 */
const R_BEZEL_OUT = 130;
const R_BEZEL_IN = 115;
const R_RIM_IN = 99;
const R_DBL_IN = 82;
const R_TRP_OUT = 60;
const R_TRP_IN = 43;
const R_BULL_OUT = 13;
const R_BULL = 6.5;
const R_NUM = 107;

const deg = (d: number) => (d * Math.PI) / 180;
const pt = (r: number, a: number) => [r * Math.cos(deg(a)), r * Math.sin(deg(a))];
const f = (n: number) => n.toFixed(2);

/** Portion d'anneau entre deux rayons et deux angles. */
function ring(r1: number, r2: number, a1: number, a2: number): string {
  const [x1, y1] = pt(r2, a1);
  const [x2, y2] = pt(r2, a2);
  const [x3, y3] = pt(r1, a2);
  const [x4, y4] = pt(r1, a1);
  return [
    `M ${f(x1)} ${f(y1)}`,
    `A ${r2} ${r2} 0 0 1 ${f(x2)} ${f(y2)}`,
    `L ${f(x3)} ${f(y3)}`,
    `A ${r1} ${r1} 0 0 0 ${f(x4)} ${f(y4)}`,
    'Z',
  ].join(' ');
}

type Mark = { x: number; y: number };

type Props = {
  onDart: (d: Dart) => void;
  /** Secteurs mis en avant par le mode en cours (vide = tout compte). */
  focus?: number[];
  focusMult?: 1 | 2 | 3;
  disabled?: boolean;
  size: number;
  /** Nombre de fléchettes déjà posées dans la volée : sert à retirer les marques. */
  turnCount: number;
};

export function BoardInput({ onDart, focus, focusMult, disabled, size, turnCount }: Props) {
  const [marks, setMarks] = useState<Mark[]>([]);

  // Les marques suivent la volée : annulation et changement de joueur les retirent.
  // Ajustement pendant le rendu, donc pas d'effet ni de rendu supplémentaire.
  if (marks.length > turnCount) setMarks(marks.slice(0, turnCount));

  const hot = (n: number) => !focus || focus.length === 0 || focus.includes(n);

  const handle = (e: GestureResponderEvent) => {
    if (disabled) return;
    const { locationX, locationY } = e.nativeEvent;
    const k = (VIEW * 2) / size;
    const x = locationX * k - VIEW;
    const y = locationY * k - VIEW;
    const d = Math.sqrt(x * x + y * y);

    // La zone tactile est plus large que la zone peinte : la couronne des
    // numéros compte comme le double, et les anneaux gagnent deux unités de
    // part et d'autre. On vise avec un pouce, pas avec une fléchette.
    let seg = 0;
    let mult: 1 | 2 | 3 = 1;
    let mx = x;
    let my = y;
    if (d <= R_BULL + 2) {
      seg = 25;
      mult = 2;
    } else if (d <= R_BULL_OUT + 2) {
      seg = 25;
      mult = 1;
    } else if (d <= R_BEZEL_IN) {
      let ang = (Math.atan2(y, x) * 180) / Math.PI + 99;
      if (ang < 0) ang += 360;
      seg = SECTORS[Math.floor((ang % 360) / 18)];
      if (d >= R_DBL_IN) mult = 2;
      else if (d >= R_TRP_IN - 2 && d <= R_TRP_OUT + 2) mult = 3;
      // Un appui sur la couronne des numéros se replace sur l'anneau de double.
      if (d > R_RIM_IN) {
        const k = (R_DBL_IN + R_RIM_IN) / 2 / d;
        mx = x * k;
        my = y * k;
      }
    }

    if (seg === 0) tapError();
    else {
      tapLight();
      setMarks((prev) => [...prev, { x: mx, y: my }]);
    }
    onDart({ seg, mult });
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{ width: size, height: size }}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handle}
        accessibilityRole="adjustable"
        accessibilityLabel="Cible de fléchettes : appuyez là où la fléchette est plantée">
        <Svg width={size} height={size} viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}>
          <Defs>
            <LinearGradient id="bezel" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#EAF1FF" />
              <Stop offset="22%" stopColor="#FFFFFF" />
              <Stop offset="45%" stopColor="#FFE3C2" />
              <Stop offset="62%" stopColor="#FFFFFF" />
              <Stop offset="80%" stopColor="#DBE8FF" />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </LinearGradient>
            <RadialGradient id="gloss" cx="38%" cy="26%" r="72%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <Stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Jante irisée, puis fond sombre translucide. */}
          <Circle r={R_BEZEL_OUT} fill="url(#bezel)" opacity={0.92} />
          <Circle r={R_BEZEL_IN + 1} fill={C.boardRim} opacity={0.94} />

          {SECTORS.map((n, i) => {
            const a = -90 + i * 18;
            const a1 = a - 9;
            const a2 = a + 9;
            const dark = i % 2 === 0;
            const body = dark ? C.boardDark : C.boardLight;
            const ringCol = dark ? C.pink : C.peach;
            return (
              <G key={n} opacity={hot(n) ? 1 : 0.3}>
                <Path d={ring(R_DBL_IN, R_RIM_IN, a1, a2)} fill={ringCol} />
                <Path d={ring(R_TRP_OUT, R_DBL_IN, a1, a2)} fill={body} />
                <Path d={ring(R_TRP_IN, R_TRP_OUT, a1, a2)} fill={ringCol} />
                <Path d={ring(R_BULL_OUT, R_TRP_IN, a1, a2)} fill={body} />
              </G>
            );
          })}

          {/* Fils de séparation. */}
          {SECTORS.map((n, i) => {
            const a = -90 + i * 18 - 9;
            const [x1, y1] = pt(R_BULL_OUT, a);
            const [x2, y2] = pt(R_RIM_IN, a);
            return (
              <Path
                key={`w${n}`}
                d={`M ${f(x1)} ${f(y1)} L ${f(x2)} ${f(y2)}`}
                stroke={C.boardWire}
                strokeWidth={0.7}
              />
            );
          })}

          <Circle r={R_BULL_OUT} fill={C.peach} opacity={hot(25) ? 1 : 0.3} />
          <Circle r={R_BULL} fill={C.pink} opacity={hot(25) ? 1 : 0.3} />

          {/* Couronne de numéros, sur la jante. */}
          {SECTORS.map((n, i) => {
            const a = -90 + i * 18;
            const [x, y] = pt(R_NUM, a);
            const on = hot(n);
            return (
              <SvgText
                key={`n${n}`}
                x={x}
                y={y + 5}
                fill={on ? '#FFFFFF' : 'rgba(255,255,255,0.35)'}
                fontSize={15}
                fontFamily={FONT.display}
                fontWeight="600"
                textAnchor="middle">
                {n}
              </SvgText>
            );
          })}

          {/* Reflet de verre, par-dessus tout. */}
          <Circle r={R_BEZEL_OUT - 1} fill="url(#gloss)" />

          {/* Marques des fléchettes de la volée. */}
          {marks.map((m, i) => (
            <G key={i}>
              <Circle cx={m.x} cy={m.y} r={7} fill="#FFFFFF" opacity={0.35} />
              <Circle cx={m.x} cy={m.y} r={4.2} fill={C.mark} />
              <Circle cx={m.x - 1.1} cy={m.y - 1.1} r={1.2} fill="#FFFFFF" opacity={0.6} />
            </G>
          ))}
        </Svg>
      </View>

      <View style={s.legend}>
        <View style={s.lg}>
          <View style={[s.dot, { backgroundColor: C.pink }]} />
          <Text style={s.lgTxt}>Double</Text>
        </View>
        <View style={s.lg}>
          <View style={[s.dot, { backgroundColor: C.peach }]} />
          <Text style={s.lgTxt}>Triple</Text>
        </View>
        <View style={s.lg}>
          <View style={[s.dot, { backgroundColor: C.cardHi2 }]} />
          <Text style={s.lgTxt}>Hors cible : à côté</Text>
        </View>
      </View>
      {focusMult === 2 ? (
        <Text style={[T.label, { marginTop: 4 }]}>Seuls les doubles comptent</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  legend: { flexDirection: 'row', gap: SP.md, marginTop: SP.sm, alignItems: 'center' },
  lg: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 9, height: 9, borderRadius: 3 },
  lgTxt: { fontFamily: FONT.body, fontSize: 11.5, color: C.ink3, fontWeight: '500' },
});

/** Petite cible décorative, non interactive (en-têtes, écrans vides). */
export function BoardMark({ size = 72, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
      opacity={opacity}>
      <Circle r={R_BEZEL_IN + 1} fill={C.boardRim} opacity={0.94} />
      {SECTORS.map((n, i) => {
        const a = -90 + i * 18;
        const dark = i % 2 === 0;
        const body = dark ? C.boardDark : C.boardLight;
        const ringCol = dark ? C.pink : C.peach;
        return (
          <G key={n}>
            <Path d={ring(R_DBL_IN, R_RIM_IN, a - 9, a + 9)} fill={ringCol} />
            <Path d={ring(R_TRP_OUT, R_DBL_IN, a - 9, a + 9)} fill={body} />
            <Path d={ring(R_TRP_IN, R_TRP_OUT, a - 9, a + 9)} fill={ringCol} />
            <Path d={ring(R_BULL_OUT, R_TRP_IN, a - 9, a + 9)} fill={body} />
          </G>
        );
      })}
      <Circle r={R_BULL_OUT} fill={C.peach} />
      <Circle r={R_BULL} fill={C.pink} />
    </Svg>
  );
}
