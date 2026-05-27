import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import { format as formatDate, addDays } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  TIME_OPTIONS,
  HOW_TO_TAKE_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  getIcon,
  PictogramOption,
} from '../components/PictogramData';
import { PillIcon } from '../components/CustomIcons';

function parseDurationToDays(text: string): number | null {
  const t = text.trim().toLowerCase();
  const match = t.match(/^(\d+)\s*(day|days|week|weeks|month|months)$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  if (match[2].startsWith('week')) return n * 7;
  if (match[2].startsWith('month')) return n * 30;
  return n;
}

type LabelFormat = 'box' | 'bottle' | 'ziplock';
const FORMAT_OPTIONS: { id: LabelFormat; label: string; emoji: string; desc: string }[] = [
  { id: 'box', label: 'Box', emoji: '📦', desc: 'Square grid' },
  { id: 'bottle', label: 'Bottle', emoji: '🧴', desc: 'Wide strip' },
  { id: 'ziplock', label: 'Ziplock', emoji: '🫙', desc: 'Narrow strip' },
];

function ArrowLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="m19 12H5M5 12l7 7M5 12l7-7" stroke="#1B3022" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6 6 18M6 6l12 12" stroke="#1B3022" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon({ size = 10, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6 9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Bottom Sheet for time/howToTake/sideEffects
function PickerSheet({
  visible,
  title,
  options,
  multiSelect,
  multiSelections,
  currentOptionId,
  currentVariantId,
  onSelect,
  onMultiToggle,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: PictogramOption[];
  multiSelect?: boolean;
  multiSelections?: Record<string, string>;
  currentOptionId?: string;
  currentVariantId?: string;
  onSelect?: (optionId: string, variantId: string) => void;
  onMultiToggle?: (optionId: string, variantId: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={[styles.sheet, { paddingBottom: 32 + insets.bottom }]}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose} activeOpacity={0.7}>
            <XIcon />
          </TouchableOpacity>
        </View>
        <Text style={styles.sheetHint}>
          {multiSelect ? 'Select all that apply' : 'Tap to select'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
          {options.map((opt) => {
            const isSelected = multiSelect
              ? !!(multiSelections && opt.id in multiSelections)
              : currentOptionId === opt.id;
            const varId = multiSelect
              ? (multiSelections?.[opt.id] ?? 'v0')
              : isSelected ? (currentVariantId ?? 'v0') : 'v0';
            const icon = getIcon(options, opt.id, varId, 52);

            return (
              <View key={opt.id} style={{ width: 96 }}>
                <TouchableOpacity
                  onPress={() => {
                    if (multiSelect) {
                      onMultiToggle?.(opt.id, varId);
                    } else {
                      if (isSelected) {
                        setExpandedId(expandedId === opt.id ? null : opt.id);
                      } else {
                        onSelect?.(opt.id, 'v0');
                        setExpandedId(opt.id);
                      }
                    }
                  }}
                  style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIconWrap}>{icon}</View>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  {isSelected && (
                    <View style={styles.optionCheck}>
                      <CheckIcon />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Variant strip */}
                {isSelected && opt.variants.length > 1 && (
                  <View style={styles.variantStrip}>
                    {opt.variants.map((v) => {
                      const varActive = multiSelect
                        ? multiSelections?.[opt.id] === v.id
                        : currentVariantId === v.id || (!currentVariantId && v.id === 'v0');
                      return (
                        <TouchableOpacity
                          key={v.id}
                          onPress={() => {
                            if (multiSelect) onMultiToggle?.(opt.id, v.id);
                            else onSelect?.(opt.id, v.id);
                          }}
                          style={[styles.variantBtn, varActive && styles.variantBtnActive]}
                          activeOpacity={0.7}
                        >
                          <View style={{ transform: [{ scale: 0.5 }] }}>
                            {getIcon(options, opt.id, v.id, 28)}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

// Dosage sheet
function DosageSheet({
  visible,
  pillCount,
  onChange,
  onClose,
}: {
  visible: boolean;
  pillCount: number;
  onChange: (n: number) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={[styles.sheet, { paddingBottom: 32 + insets.bottom }]}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Dosage</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose} activeOpacity={0.7}><XIcon /></TouchableOpacity>
        </View>
        <Text style={styles.sheetHint}>Pills per dose</Text>
        <View style={styles.pillGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => onChange(n)}
              style={[styles.pillNumBtn, pillCount === n && styles.pillNumBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillNumText, pillCount === n && styles.pillNumTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.pillPreview}>
          {Array.from({ length: pillCount }).map((_, i) => (
            <PillIcon key={i} size={pillCount > 6 ? 20 : pillCount > 4 ? 26 : 32} />
          ))}
        </View>
      </View>
    </Modal>
  );
}

// Live label preview
function LiveLabel({
  format,
  timeSelections,
  pillCount,
  howToTakeSelections,
  sideEffectSelections,
  howLong,
  others,
  includeOnLabel,
  onTapCategory,
}: {
  format: LabelFormat;
  timeSelections: Record<string, string>;
  pillCount: number;
  howToTakeSelections: Record<string, string>;
  sideEffectSelections: Record<string, string>;
  howLong: string;
  others: string;
  includeOnLabel: Record<string, boolean>;
  onTapCategory: (cat: string) => void;
}) {
  const inc = (key: string) => includeOnLabel?.[key] !== false;
  const showDuration = inc('howLong') && howLong?.trim().length > 0;
  const showOthers = inc('others') && others?.trim().length > 0;

  const durationDays = showDuration ? parseDurationToDays(howLong) : null;
  const today = new Date();
  const durationDisplay = durationDays != null
    ? `${formatDate(today, 'd MMM')} – ${formatDate(addDays(today, durationDays), 'd MMM yyyy')}`
    : howLong?.trim();

  const cats: { key: string; label: string; content: React.ReactElement | null }[] = [];

  if (inc('timeOfDay') && Object.keys(timeSelections).length > 0) {
    const iconSize = Object.keys(timeSelections).length > 2 ? 22 : Object.keys(timeSelections).length > 1 ? 28 : 36;
    cats.push({
      key: 'time',
      label: 'Time',
      content: (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {TIME_OPTIONS.filter((o) => o.id in timeSelections).map((o, i) => (
            <View key={i}>{getIcon(TIME_OPTIONS, o.id, timeSelections[o.id], iconSize)}</View>
          ))}
        </View>
      ),
    });
  }
  if (inc('dosage')) {
    const sz = pillCount > 5 ? 14 : pillCount > 3 ? 18 : 24;
    cats.push({
      key: 'dosage',
      label: 'Dosage',
      content: (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {Array.from({ length: pillCount }).map((_, i) => <PillIcon key={i} size={sz} />)}
        </View>
      ),
    });
  }
  if (inc('howToTake') && Object.keys(howToTakeSelections).length > 0) {
    const iconSize = Object.keys(howToTakeSelections).length > 2 ? 20 : Object.keys(howToTakeSelections).length > 1 ? 24 : (format === 'ziplock' ? 28 : 36);
    cats.push({
      key: 'howToTake',
      label: 'How to take',
      content: (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {HOW_TO_TAKE_OPTIONS.filter((o) => o.id in howToTakeSelections).map((o, i) => (
            <View key={i}>{getIcon(HOW_TO_TAKE_OPTIONS, o.id, howToTakeSelections[o.id], iconSize)}</View>
          ))}
        </View>
      ),
    });
  }
  if (inc('sideEffects') && Object.keys(sideEffectSelections).length > 0) {
    const iconSize = Object.keys(sideEffectSelections).length > 2 ? 20 : Object.keys(sideEffectSelections).length > 1 ? 24 : (format === 'ziplock' ? 28 : 36);
    cats.push({
      key: 'sideEffects',
      label: 'Side effects',
      content: (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {SIDE_EFFECT_OPTIONS.filter((o) => o.id in sideEffectSelections).map((o, i) => (
            <View key={i}>{getIcon(SIDE_EFFECT_OPTIONS, o.id, sideEffectSelections[o.id], iconSize)}</View>
          ))}
        </View>
      ),
    });
  }

  const isZiplock = format === 'ziplock';
  const isBottle = format === 'bottle';
  const labelWidth = isZiplock ? 200 : isBottle ? 340 : 300;

  return (
    <View style={[styles.liveLabel, { width: labelWidth }]}>
      <View style={isZiplock ? {} : isBottle ? { flexDirection: 'row' } : { flexDirection: 'row', flexWrap: 'wrap' }}>
        {cats.map((cat, i) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onTapCategory(cat.key)}
            style={[
              styles.catCell,
              isBottle && i > 0 && styles.catCellBorderLeft,
              !isZiplock && !isBottle && i % 2 === 1 && styles.catCellBorderLeft,
              !isZiplock && !isBottle && i >= 2 && styles.catCellBorderTop,
              isZiplock && i > 0 && styles.catCellBorderTop,
              { width: isZiplock ? '100%' : isBottle ? `${100 / cats.length}%` : '50%', minHeight: isZiplock ? 52 : 72 },
            ]}
            activeOpacity={0.7}
          >
            <View style={{ minHeight: isZiplock ? 28 : 40, alignItems: 'center', justifyContent: 'center' }}>
              {cat.content}
            </View>
            <Text style={styles.catLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {(showDuration || showOthers) && (
        <View style={styles.textRow}>
          <Text style={styles.textRowContent}>
            {showDuration ? durationDisplay : ''}{showDuration && showOthers ? '  ·  ' : ''}{showOthers ? others : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ConfigureLabelScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const {
    language = 'en',
    dosage: ocrDosage = '1',
    howLong = '',
    others = '',
    includeOnLabel = {},
    id = '1',
  } = route.params || {};

  const parseCount = (text: string) => {
    const match = String(text).match(/\d+/);
    const n = match ? parseInt(match[0], 10) : 1;
    return Math.min(Math.max(1, n), 10);
  };

  const [timeSelections, setTimeSelections] = useState<Record<string, string>>({ morning: 'v0' });
  const [howToTakeSelections, setHowToTakeSelections] = useState<Record<string, string>>({ crush: 'v0' });
  const [sideEffectSelections, setSideEffectSelections] = useState<Record<string, string>>({ drowsiness: 'v0' });
  const [pillCount, setPillCount] = useState(parseCount(ocrDosage));
  const [labelFormat, setLabelFormat] = useState<LabelFormat>('box');
  const [openSheet, setOpenSheet] = useState<string | null>(null);

  const handleAssemble = () => {
    navigation.navigate('PrintPreview', {
      timeSelections,
      pillCount,
      howToTakeSelections,
      sideEffectSelections,
      language,
      howLong,
      others,
      includeOnLabel,
      labelFormat,
      medicationId: id,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeftIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Preview & Alternatives</Text>
        </View>
        <Text style={styles.subtitle}>Tap any pictogram to swap it — or just hit Confirm</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Live label */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <LiveLabel
            format={labelFormat}
            timeSelections={timeSelections}
            pillCount={pillCount}
            howToTakeSelections={howToTakeSelections}
            sideEffectSelections={sideEffectSelections}
            howLong={howLong}
            others={others}
            includeOnLabel={includeOnLabel}
            onTapCategory={(cat) => setOpenSheet(cat)}
          />
        </View>

        <Text style={styles.hint}>Tap a pictogram cell to see alternatives</Text>

        {/* Format selector */}
        <View style={styles.formatSection}>
          <Text style={styles.formatLabel}>Label format</Text>
          <View style={styles.formatGrid}>
            {FORMAT_OPTIONS.map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setLabelFormat(f.id)}
                style={[styles.formatBtn, labelFormat === f.id && styles.formatBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={styles.formatEmoji}>{f.emoji}</Text>
                <Text style={[styles.formatName, labelFormat === f.id && styles.formatNameActive]}>{f.label}</Text>
                <Text style={[styles.formatDesc, labelFormat === f.id && styles.formatDescActive]}>{f.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
        <TouchableOpacity onPress={handleAssemble} style={styles.ctaBtn} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Confirm Label →</Text>
        </TouchableOpacity>
      </View>

      {/* Sheets */}
      <PickerSheet
        visible={openSheet === 'time'}
        title="Time of Day"
        options={TIME_OPTIONS}
        multiSelect
        multiSelections={timeSelections}
        onMultiToggle={(optionId, variantId) => {
          setTimeSelections((prev) => {
            if (optionId in prev) {
              if (prev[optionId] === variantId && Object.keys(prev).length > 1) {
                const next = { ...prev };
                delete next[optionId];
                return next;
              }
              return { ...prev, [optionId]: variantId };
            }
            return { ...prev, [optionId]: variantId };
          });
        }}
        onClose={() => setOpenSheet(null)}
      />
      <DosageSheet
        visible={openSheet === 'dosage'}
        pillCount={pillCount}
        onChange={setPillCount}
        onClose={() => setOpenSheet(null)}
      />
      <PickerSheet
        visible={openSheet === 'howToTake'}
        title="How to Take Medication"
        options={HOW_TO_TAKE_OPTIONS}
        multiSelect
        multiSelections={howToTakeSelections}
        onMultiToggle={(optionId, variantId) => {
          setHowToTakeSelections((prev) => {
            if (optionId in prev) {
              if (Object.keys(prev).length > 1) {
                const next = { ...prev };
                delete next[optionId];
                return next;
              }
              return { ...prev, [optionId]: variantId };
            }
            return { ...prev, [optionId]: variantId };
          });
        }}
        onClose={() => setOpenSheet(null)}
      />
      <PickerSheet
        visible={openSheet === 'sideEffects'}
        title="Side Effects"
        options={SIDE_EFFECT_OPTIONS}
        multiSelect
        multiSelections={sideEffectSelections}
        onMultiToggle={(optionId, variantId) => {
          setSideEffectSelections((prev) => {
            if (optionId in prev) {
              if (Object.keys(prev).length > 1) {
                const next = { ...prev };
                delete next[optionId];
                return next;
              }
              return { ...prev, [optionId]: variantId };
            }
            return { ...prev, [optionId]: variantId };
          });
        }}
        onClose={() => setOpenSheet(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', flex: 1 },
  subtitle: { fontSize: 15, color: 'rgba(27,48,34,0.55)', marginLeft: 60 },
  scroll: { flex: 1, paddingHorizontal: 24 },
  hint: { fontSize: 12, color: 'rgba(27,48,34,0.4)', textAlign: 'center', marginBottom: 24 },
  liveLabel: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,48,34,0.12)',
    overflow: 'hidden',
    shadowColor: '#1B3022',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  catCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 6,
  },
  catCellBorderLeft: { borderLeftWidth: 1, borderLeftColor: 'rgba(27,48,34,0.1)' },
  catCellBorderTop: { borderTopWidth: 1, borderTopColor: 'rgba(27,48,34,0.1)' },
  catLabel: { fontSize: 8, fontWeight: '700', color: '#1B3022', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  textRow: { borderTopWidth: 1, borderTopColor: 'rgba(27,48,34,0.1)', paddingHorizontal: 16, paddingVertical: 8 },
  textRowContent: { fontSize: 10, color: 'rgba(27,48,34,0.8)', textAlign: 'center', fontWeight: '500' },
  formatSection: { marginBottom: 16 },
  formatLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(27,48,34,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  formatGrid: { flexDirection: 'row', gap: 8 },
  formatBtn: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.7)' },
  formatBtnActive: { backgroundColor: '#1B3022' },
  formatEmoji: { fontSize: 22 },
  formatName: { fontSize: 13, fontWeight: '700', color: '#1B3022' },
  formatNameActive: { color: 'white' },
  formatDesc: { fontSize: 10, color: 'rgba(27,48,34,0.45)' },
  formatDescActive: { color: 'rgba(255,255,255,0.7)' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16 },
  ctaBtn: { backgroundColor: '#1B3022', borderRadius: 999, paddingVertical: 20, alignItems: 'center', minHeight: 64 },
  ctaText: { color: 'white', fontSize: 20, fontWeight: '700', fontFamily: 'Georgia' },
  // Sheet styles
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: '#F5F2ED', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia' },
  sheetClose: { width: 36, height: 36, backgroundColor: 'rgba(27,48,34,0.1)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetHint: { fontSize: 13, color: 'rgba(27,48,34,0.5)', marginBottom: 16 },
  optionBtn: { alignItems: 'center', borderRadius: 16, padding: 12, borderWidth: 2, borderColor: 'transparent', backgroundColor: 'rgba(255,255,255,0.8)' },
  optionBtnSelected: { borderColor: '#1B3022', backgroundColor: 'white' },
  optionIconWrap: { height: 56, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { fontSize: 11, fontWeight: '600', color: '#1B3022', textAlign: 'center', marginTop: 8, lineHeight: 14 },
  optionCheck: { width: 16, height: 16, backgroundColor: '#1B3022', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  variantStrip: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 6 },
  variantBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(27,48,34,0.2)', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  variantBtnActive: { borderColor: '#1B3022', backgroundColor: 'rgba(27,48,34,0.1)' },
  // Dosage sheet
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  pillNumBtn: { width: '18%', height: 44, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  pillNumBtnActive: { backgroundColor: '#1B3022' },
  pillNumText: { fontSize: 18, fontWeight: '700', color: '#1B3022' },
  pillNumTextActive: { color: 'white' },
  pillPreview: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 16, padding: 16, minHeight: 64, gap: 4 },
});
