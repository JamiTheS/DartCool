/**
 * Briques d'interface communes. Tout ce qui est réutilisé vit ici :
 * écran, barre de titre, carte, bouton, segments, pas-à-pas, interrupteur,
 * feuille modale. Les composants ne décident jamais d'une couleur eux-mêmes.
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

import { alpha, C, HIT, R, SP, T } from '../theme/tokens';
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
        { flex: 1, backgroundColor: C.base, paddingTop: top ? insets.top : 0, paddingBottom: bottom ? insets.bottom : 0 },
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
          hitSlop={12}
          style={s.topIcon}
          accessibilityRole="button"
          accessibilityLabel="Retour">
          <ChevronLeft color={C.chalkDim} />
        </Pressable>
      ) : (
        <View style={s.topIcon} />
      )}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text numberOfLines={1} style={T.subtitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[T.label, { marginTop: 1 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[s.topIcon, { alignItems: 'flex-end' }]}>{right}</View>
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
    <View
      style={[
        s.card,
        tone ? { borderColor: alpha(tone, 0.35), backgroundColor: alpha(tone, 0.06) } : null,
        style,
      ]}>
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
    variant === 'primary' ? C.brass : variant === 'danger' ? C.redSoft : variant === 'quiet' ? C.panelHigh : 'transparent';
  const fg =
    variant === 'primary' ? C.onBrass : variant === 'danger' ? C.red : variant === 'ghost' ? C.chalkDim : C.chalk;
  const border = variant === 'ghost' ? C.line : variant === 'danger' ? alpha(C.red, 0.4) : 'transparent';

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
        {
          backgroundColor: bg,
          borderColor: border,
          minHeight: big ? 62 : HIT,
          opacity: disabled ? 0.38 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
        },
        style,
      ]}>
      {icon}
      <Text
        style={[
          big ? T.subtitle : T.bodyStrong,
          {
            color: fg,
            letterSpacing: big ? 1.2 : 0.6,
            textTransform: big ? 'uppercase' : 'none',
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
              { paddingVertical: compact ? 7 : 11 },
              active ? { backgroundColor: C.brass } : null,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}>
            <Text
              style={[
                compact ? T.small : T.bodyStrong,
                { color: active ? C.onBrass : C.chalkDim, fontWeight: '700' },
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
        <Text style={[T.subtitle, { color: C.chalkDim }]}>−</Text>
      </Pressable>
      <Text style={[T.num, { minWidth: 46, textAlign: 'center' }]}>
        {value}
        {suffix ?? ''}
      </Text>
      <Pressable onPress={() => go(1)} style={s.stepBtn} accessibilityLabel="Augmenter">
        <Text style={[T.subtitle, { color: C.chalkDim }]}>+</Text>
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
        {hint ? <Text style={[T.small, { marginTop: 2 }]}>{hint}</Text> : null}
      </View>
      <View style={[s.track, value ? { backgroundColor: alpha(C.brass, 0.4) } : null]}>
        <View
          style={[
            s.knob,
            value ? { backgroundColor: C.brass, alignSelf: 'flex-end' } : null,
          ]}
        />
      </View>
    </Pressable>
  );
}

export function Chip({ label, tone, strong }: { label: string; tone?: string; strong?: boolean }) {
  const col = tone ?? C.chalkFaint;
  return (
    <View
      style={[
        s.chip,
        { borderColor: alpha(col, 0.45), backgroundColor: strong ? alpha(col, 0.16) : 'transparent' },
      ]}>
      <Text style={[T.small, { color: strong ? col : C.chalkDim, fontWeight: '700' }]}>{label}</Text>
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
        <View style={[s.sheet, { paddingBottom: insets.bottom + SP.lg }]}>
          <View style={s.sheetHead}>
            <Text style={T.subtitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Fermer">
              <Close color={C.chalkDim} />
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
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ paddingVertical: SP.xl, alignItems: 'center' }}>
      <Text style={[T.subtitle, { color: C.chalkDim }]}>{title}</Text>
      <Text style={[T.small, { textAlign: 'center', marginTop: 6, maxWidth: 280 }]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.sm,
    height: 48,
  },
  topIcon: { width: 44, justifyContent: 'center' },
  card: {
    backgroundColor: C.panel,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    padding: SP.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.md,
    borderWidth: 1,
    paddingHorizontal: SP.lg,
  },
  segWrap: {
    flexDirection: 'row',
    backgroundColor: C.panelHigh,
    borderRadius: R.sm,
    padding: 3,
    gap: 3,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.xs + 2,
    paddingHorizontal: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.panelHigh,
    borderRadius: R.sm,
  },
  stepBtn: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SP.md },
  track: {
    width: 48,
    height: 28,
    borderRadius: R.pill,
    backgroundColor: C.panelHigher,
    padding: 3,
    justifyContent: 'center',
  },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.chalkFaint },
  chip: {
    borderWidth: 1,
    borderRadius: R.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sheetBack: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: C.panel,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    borderTopWidth: 1,
    borderColor: C.line,
    paddingHorizontal: SP.lg,
    paddingTop: SP.md,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SP.sm,
  },
});
