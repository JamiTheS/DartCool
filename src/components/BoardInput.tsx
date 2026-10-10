/**
 * Saisie sur une vraie cible. On appuie là où la fléchette est plantée :
 * secteur, anneau de double, anneau de triple, 25, bull, hors cible.
 * C'est la saisie la plus rapide quand on a la cible sous les yeux — et la
 * seule qui ne demande aucune traduction mentale.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { Dart, SECTORS } from '../engine';
import { alpha, C, FONT, T } from '../theme/tokens';
import { tapLight } from '../utils/feedback';

/** Rayons, dans un repère de 100 = bord extérieur du double. */
const R_OUT = 84;
const R_DBL_IN = 69;
const R_TRP_OUT = 57;
const R_TRP_IN = 41;
const R_BULL_OUT = 13;
const R_BULL_IN = 6;
const R_NUM = 93;
const VIEW = 100;

const deg = (d: number) => (d * Math.PI) / 180;
const pt = (r: number, a: number) => [r * Math.cos(deg(a)), r * Math.sin(deg(a))];

/** Portion d'anneau entre deux rayons et deux angles. */
function ring(r1: number, r2: number, a1: number, a2: number): string {
  const [x1, y1] = pt(r2, a1);
  const [x2, y2] = pt(r2, a2);
  const [x3, y3] = pt(r1, a2);
  const [x4, y4] = pt(r1, a1);
  return [
    `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    `A ${r2} ${r2} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
    `A ${r1} ${r1} 0 0 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
    'Z',
  ].join(' ');
}

type Props = {
  onDart: (d: Dart) => void;
  focus?: number[];
  focusMult?: 1 | 2 | 3;
  disabled?: boolean;
  size: number;
};

export function BoardInput({ onDart, focus, focusMult, disabled, size }: Props) {
  const send = (seg: number, mult: 1 | 2 | 3) => {
    if (disabled) return;
    tapLight();
    onDart({ seg, mult });
  };

  const hot = (n: number) => !focus || focus.length === 0 || focus.includes(n);
  const dim = (n: number) => (hot(n) ? 1 : 0.28);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}>
        {/* Hors cible : tout le fond est cliquable. */}
        <Circle cx={0} cy={0} r={VIEW} fill={C.base} onPress={() => send(0, 1)} />
        <Circle cx={0} cy={0} r={R_OUT + 7} fill="#060807" stroke={C.line} strokeWidth={1} onPress={() => send(0, 1)} />

        {SECTORS.map((n, i) => {
          const a = -90 + i * 18;
          const a1 = a - 9;
          const a2 = a + 9;
          const dark = i % 2 === 0;
          const single = dark ? '#171A18' : C.sisal;
          const ringCol = dark ? C.red : C.green;
          const o = dim(n);
          return (
            <G key={n} opacity={o}>
              {/* De l'extérieur vers le centre : double, simple, triple, simple. */}
              <Path d={ring(R_DBL_IN, R_OUT, a1, a2)} fill={ringCol} onPress={() => send(n, 2)} />
              <Path d={ring(R_TRP_OUT, R_DBL_IN, a1, a2)} fill={single} onPress={() => send(n, 1)} />
              <Path d={ring(R_TRP_IN, R_TRP_OUT, a1, a2)} fill={ringCol} onPress={() => send(n, 3)} />
              <Path d={ring(R_BULL_OUT, R_TRP_IN, a1, a2)} fill={single} onPress={() => send(n, 1)} />
            </G>
          );
        })}

        {/* Fils de séparation, pour la lecture. */}
        {SECTORS.map((n, i) => {
          const a = -90 + i * 18 - 9;
          const [x1, y1] = pt(R_BULL_OUT, a);
          const [x2, y2] = pt(R_OUT, a);
          return (
            <Path
              key={`w${n}`}
              d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`}
              stroke="rgba(0,0,0,0.45)"
              strokeWidth={0.8}
            />
          );
        })}

        <Circle
          cx={0}
          cy={0}
          r={R_BULL_OUT}
          fill={C.green}
          opacity={dim(25)}
          onPress={() => send(25, 1)}
        />
        <Circle
          cx={0}
          cy={0}
          r={R_BULL_IN}
          fill={C.red}
          opacity={dim(25)}
          onPress={() => send(25, 2)}
        />

        {/* Couronne de numéros. */}
        {SECTORS.map((n, i) => {
          const a = -90 + i * 18;
          const [x, y] = pt(R_NUM, a);
          return (
            <SvgText
              key={`n${n}`}
              x={x}
              y={y + 4}
              fill={hot(n) ? C.chalk : C.chalkFaint}
              fontSize={13}
              fontFamily={FONT.display}
              textAnchor="middle">
              {n}
            </SvgText>
          );
        })}
      </Svg>
      <Text style={[T.label, s.hint]}>
        {focusMult === 2
          ? 'Appuie sur l’anneau extérieur pour un double'
          : 'Appuie exactement là où la fléchette est plantée'}
      </Text>
      <View style={s.missRow}>
        <Text style={[T.small, { color: C.chalkFaint }]}>
          Hors cible : appuie sur le fond noir
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hint: { marginTop: 10, textAlign: 'center' },
  missRow: { marginTop: 2, alignItems: 'center' },
});

/** Petite cible décorative, non interactive (en-têtes, écrans vides). */
export function BoardMark({ size = 72, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="-100 -100 200 200" opacity={opacity}>
      {SECTORS.map((n, i) => {
        const a = -90 + i * 18;
        const dark = i % 2 === 0;
        return (
          <G key={n}>
            <Path d={ring(R_DBL_IN, R_OUT, a - 9, a + 9)} fill={dark ? C.red : C.green} />
            <Path d={ring(R_TRP_OUT, R_DBL_IN, a - 9, a + 9)} fill={dark ? '#171A18' : C.sisal} />
            <Path d={ring(R_TRP_IN, R_TRP_OUT, a - 9, a + 9)} fill={dark ? C.red : C.green} />
            <Path d={ring(R_BULL_OUT, R_TRP_IN, a - 9, a + 9)} fill={dark ? '#171A18' : C.sisal} />
          </G>
        );
      })}
      <Circle cx={0} cy={0} r={R_BULL_OUT} fill={C.green} />
      <Circle cx={0} cy={0} r={R_BULL_IN} fill={C.red} />
      <Circle cx={0} cy={0} r={R_OUT + 6} fill="none" stroke={alpha(C.chalk, 0.12)} strokeWidth={2} />
    </Svg>
  );
}
