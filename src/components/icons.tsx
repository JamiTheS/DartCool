/**
 * Jeu d'icônes maison, en SVG, trait uniforme de 2.
 * Dessinées à la main plutôt qu'importées : poids nul, style homogène.
 */
import React from 'react';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

import { C } from '../theme/tokens';

type P = { size?: number; color?: string };

const S = ({ size = 22, children }: { size?: number; children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children}
  </Svg>
);

const stroke = (color?: string) => ({
  stroke: color ?? C.ink,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const ChevronLeft = ({ size, color }: P) => (
  <S size={size}>
    <Polyline points="15 5 8 12 15 19" {...stroke(color)} />
  </S>
);

export const ChevronRight = ({ size, color }: P) => (
  <S size={size}>
    <Polyline points="9 5 16 12 9 19" {...stroke(color)} />
  </S>
);

export const Undo = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M4 9h11a5 5 0 0 1 0 10H9" {...stroke(color)} />
    <Polyline points="8 4 3.5 9 8 14" {...stroke(color)} />
  </S>
);

export const Plus = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M12 5v14M5 12h14" {...stroke(color)} />
  </S>
);

export const Close = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M6 6l12 12M18 6L6 18" {...stroke(color)} />
  </S>
);

export const Check = ({ size, color }: P) => (
  <S size={size}>
    <Polyline points="4 13 9.5 18 20 6" {...stroke(color)} />
  </S>
);

export const Gear = ({ size, color }: P) => (
  <S size={size}>
    <Circle cx="12" cy="12" r="3.2" {...stroke(color)} />
    <Path
      d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1"
      {...stroke(color)}
    />
  </S>
);

export const Chart = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M4 20h16" {...stroke(color)} />
    <Path d="M7 20V12M12 20V5M17 20v-6" {...stroke(color)} />
  </S>
);

export const Book = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" {...stroke(color)} />
    <Path d="M8 8h6M8 12h6" {...stroke(color)} />
  </S>
);

export const Users = ({ size, color }: P) => (
  <S size={size}>
    <Circle cx="9" cy="8" r="3.2" {...stroke(color)} />
    <Path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" {...stroke(color)} />
    <Path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 20c0-2.2-.8-4-2-5" {...stroke(color)} />
  </S>
);

export const Trash = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" {...stroke(color)} />
  </S>
);

export const Shuffle = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M4 6h4l8 12h4M4 18h4l2.5-3.7M15.5 9.2L16 6h4" {...stroke(color)} />
    <Polyline points="17 3 20 6 17 9" {...stroke(color)} />
    <Polyline points="17 15 20 18 17 21" {...stroke(color)} />
  </S>
);

export const Dots = ({ size, color }: P) => (
  <S size={size}>
    <Circle cx="5" cy="12" r="1.6" fill={color ?? C.ink} />
    <Circle cx="12" cy="12" r="1.6" fill={color ?? C.ink} />
    <Circle cx="19" cy="12" r="1.6" fill={color ?? C.ink} />
  </S>
);

export const Target = ({ size, color }: P) => (
  <S size={size}>
    <Circle cx="12" cy="12" r="8.5" {...stroke(color)} />
    <Circle cx="12" cy="12" r="4.5" {...stroke(color)} />
    <Circle cx="12" cy="12" r="1" fill={color ?? C.ink} />
  </S>
);

export const Grid = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" {...stroke(color)} />
  </S>
);

export const Keyboard = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M3 7h18v10H3z" {...stroke(color)} />
    <Path d="M7 11h.01M11 11h.01M15 11h.01M8 14h8" {...stroke(color)} />
  </S>
);

export const Trophy = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" {...stroke(color)} />
    <Path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" {...stroke(color)} />
    <Path d="M12 13v4M9 20h6" {...stroke(color)} />
  </S>
);

export const Flag = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M6 3v18M6 4h11l-2 4 2 4H6" {...stroke(color)} />
  </S>
);
