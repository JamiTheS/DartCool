/**
 * Briques d'interface communes — version « Porcelaine ».
 * Cartes blanches posées sur le fond par une ombre à deux couches, filets
 * presque invisibles, rose réservé à l'état actif. Les composants ne décident
 * jamais d'une couleur eux-mêmes : tout vient de `theme/tokens`.
 */
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { alpha, C, HIT, R, SH, SP, T } from '../theme/tokens';
import { tapLight, tapMedium } from '../utils/feedback';
import { ChevronLeft, Close } from './icons';

export function Screen({
  children,
  style,
  top = true,
  bottom = true,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  top?: boolean;
  bottom?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: C.bg,
          paddingTop: top ? insets.top : 0,
          paddingBottom: bottom ? insets.bottom : 0,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function TopBar({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.topbar}>
      {onBack ? (
        <Pressable
          onPress={() => {
            tapLight();
            onBack();
          }}
          hitSlop={10}
          style={({ pressed }) => [s.roundBtn, pressed ? { backgroundColor: C.cardHi2 } : null]}
          accessibilityRole="button"
          accessibilityLabel="Retour">
          <ChevronLeft size={20} color={C.ink2} />
        </Pressable>
      ) : (
        <View style={{ width: 38 }} />
      )}
      <View style={{ flex: 1, paddingHorizontal: SP.sm }}>
        <Text numberOfLines={1} style={[T.bodyStrong, { fontSize: 15.5 }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[T.small, { color: C.ink3, fontSize: 12 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ minWidth: 38, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function Card({
  children,
  style,
  tone,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  tone?: string;
}) {
  return (
    <View style={[s.card, tone ? { backgroundColor: alpha(tone, 0.08) } : null, style]}>
      {children}
    </View>
  );
}

export function Label({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[T.label, style]}>{children}</Text>;
}

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: C.line }, style]} />;
}

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'quiet';

export function Btn({
  label,
  onPress,
  variant = 'primary',
  disabled,
  icon,
  style,
  big,
}: {
  label: string;
  onPress: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  big?: boolean;
}) {
  const bg =
    variant === 'primary'
      ? C.ink
      : variant === 'danger'
        ? C.dangerSoft
        : variant === 'quiet'
          ? C.card
          : 'transparent';
  const fg =
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'danger'
        ? C.danger
        : variant === 'ghost'
          ? C.ink2
          : C.ink;

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        tapMedium();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        s.btn,
        variant === 'quiet' || variant === 'primary' ? SH.sm : null,
        {
          backgroundColor: bg,
          minHeight: big ? 58 : HIT,
          opacity: disabled ? 0.4 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
        },
        style,
      ]}>
      {icon}
      <Text
        style={[
          T.bodyStrong,
          {
            color: fg,
            fontSize: big ? 16 : 15,
            letterSpacing: big ? 0.2 : 0,
            marginLeft: icon ? 8 : 0,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export type SegItem = { value: string | number | boolean; label: string };

export function Segmented({
  items,
  value,
  onChange,
  compact,
}: {
  items: SegItem[];
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
  compact?: boolean;
}) {
  return (
    <View style={s.segWrap}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <Pressable
            key={String(it.value)}
            onPress={() => {
              tapLight();
              onChange(it.value);
            }}
            style={[
              s.seg,
              { paddingVertical: compact ? 8 : 11 },
              active ? [{ backgroundColor: C.card }, SH.sm] : null,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}>
            <Text
              style={[
                compact ? T.small : T.bodyStrong,
                { color: active ? C.ink : C.ink2, fontWeight: '600' },
              ]}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const go = (d: number) => {
    const next = Math.min(max, Math.max(min, value + d * step));
    if (next !== value) {
      tapLight();
      onChange(next);
    }
  };
  return (
    <View style={s.stepper}>
      <Pressable onPress={() => go(-1)} style={s.stepBtn} accessibilityLabel="Diminuer">
        <Text style={[T.subtitle, { color: C.ink2 }]}>−</Text>
      </Pressable>
      <Text style={[T.num, { minWidth: 44, textAlign: 'center' }]}>
        {value}
        {suffix ?? ''}
      </Text>
      <Pressable onPress={() => go(1)} style={s.stepBtn} accessibilityLabel="Augmenter">
        <Text style={[T.subtitle, { color: C.ink2 }]}>+</Text>
      </Pressable>
    </View>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => {
        tapLight();
        onChange(!value);
      }}
      style={s.row}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}>
      <View style={{ flex: 1, paddingRight: SP.md }}>
        <Text style={T.bodyStrong}>{label}</Text>
        {hint ? <Text style={[T.small, { marginTop: 2, color: C.ink3 }]}>{hint}</Text> : null}
      </View>
      <View style={[s.track, value ? { backgroundColor: C.pink } : null]}>
        <View style={[s.knob, value ? { alignSelf: 'flex-end' } : null, SH.sm]} />
      </View>
    </Pressable>
  );
}

export function Chip({ label, tone, strong }: { label: string; tone?: string; strong?: boolean }) {
  const col = tone ?? C.ink3;
  return (
    <View style={[s.chip, { backgroundColor: strong ? alpha(col, 0.18) : C.cardHi2 }]}>
      <Text style={[T.small, { color: strong ? C.ink : C.ink2, fontWeight: '600', fontSize: 12 }]}>
        {label}
      </Text>
    </View>
  );
}

export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.sheetBack}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Fermer" />
        <View style={[s.sheet, { paddingBottom: insets.bottom + SP.lg }, SH.lg]}>
          <View style={s.grabber} />
          <View style={s.sheetHead}>
            <Text style={T.subtitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12} style={s.roundBtn} accessibilityLabel="Fermer">
              <Close size={18} color={C.ink2} />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ paddingBottom: SP.md }}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function PlayerDot({ color, size = 10 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ paddingVertical: SP.xl, alignItems: 'center' }}>
      <Text style={[T.subtitle, { color: C.ink2 }]}>{title}</Text>
      <Text style={[T.small, { textAlign: 'center', marginTop: 6, maxWidth: 280, color: C.ink3 }]}>
        {text}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.md,
    height: 52,
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...SH.sm,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: SP.md,
    ...SH.sm,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.md,
    paddingHorizontal: SP.lg,
  },
  segWrap: {
    flexDirection: 'row',
    backgroundColor: C.cardHi2,
    borderRadius: R.md,
    padding: 4,
    gap: 4,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
    paddingHorizontal: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardHi2,
    borderRadius: R.sm,
  },
  stepBtn: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SP.md },
  track: {
    width: 50,
    height: 30,
    borderRadius: R.pill,
    backgroundColor: C.cardHi2,
    padding: 3,
    justifyContent: 'center',
  },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.card },
  chip: {
    borderRadius: R.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sheetBack: { flex: 1, backgroundColor: C.scrim },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingHorizontal: SP.lg,
    paddingTop: SP.sm,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.cardHi2,
    alignSelf: 'center',
    marginBottom: SP.sm,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SP.sm,
  },
});
