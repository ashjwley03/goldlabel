import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import PictogramGrid, { getFriendlyLabel } from '../components/PictogramGrid';
import {
  TIME_OPTIONS,
  HOW_TO_TAKE_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  DURATION_OPTIONS,
  DOSAGE_OPTIONS,
  PRECAUTIONS_OPTIONS,
  PictogramOption,
} from '../components/PictogramData';

type LabelFormat = 'portrait' | 'square' | 'landscape';
const FORMAT_OPTIONS: { id: LabelFormat; label: string; emoji: string; desc: string }[] = [
  { id: 'portrait', label: 'Portrait (4x1)', emoji: '📱', desc: 'Vertical strip' },
  { id: 'square', label: 'Square (2x2)', emoji: '⬛', desc: '2×2 grid' },
  { id: 'landscape', label: 'Landscape (1x4)', emoji: '📼', desc: 'Horizontal strip' },
];

const FIELDS = [
  { key: 'time_of_day', label: 'Time of Day' },
  { key: 'dosage', label: 'Dosage' },
  { key: 'how_to_take', label: 'How to Take' },
  { key: 'side_effects', label: 'Side Effects' },
  { key: 'duration', label: 'Duration' },
  { key: 'precautions', label: 'Precautions' },
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

export default function ConfigureLabelScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const {
    language = 'en',
    time_of_day = '',
    dosage = '',
    how_to_take = '',
    side_effects = '',
    duration = '',
    precautions = '',
    includeOnLabel = {},
    labelId = 'local',
    imageUri,
    imageBase64,
    rawOcrText,
  } = route.params || {};

  const [timeOfDay, setTimeOfDay] = useState(time_of_day);
  const [medDosage, setMedDosage] = useState(dosage);
  const [howToTake, setHowToTake] = useState(how_to_take);
  const [sideEffects, setSideEffects] = useState(side_effects);
  const [medDuration, setMedDuration] = useState(duration);
  const [medPrecautions, setMedPrecautions] = useState(precautions);
  const [labelFormat, setLabelFormat] = useState<LabelFormat>('square');
  const [openSheet, setOpenSheet] = useState<string | null>(null);

  const handleAssemble = () => {
    navigation.navigate('PrintPreview', {
      time_of_day: timeOfDay,
      dosage: medDosage,
      how_to_take: howToTake,
      side_effects: sideEffects,
      duration: medDuration,
      precautions: medPrecautions,
      includeOnLabel,
      labelFormat,
      language,
      labelId,
      imageUri,
      imageBase64,
      rawOcrText
    });
  };

  const getGridItems = () => {
    const items: string[] = [];
    const inc = (key: string) => includeOnLabel?.[key] !== false;

    if (inc('time_of_day') && timeOfDay) items.push(timeOfDay);
    if (inc('dosage') && medDosage) items.push(medDosage);
    if (inc('how_to_take') && howToTake) items.push(howToTake);
    if (inc('side_effects') && sideEffects) items.push(sideEffects);
    if (inc('duration') && medDuration) items.push(medDuration);
    if (inc('precautions') && medPrecautions) items.push(medPrecautions);

    return items;
  };

  const getActiveOptions = (): PictogramOption[] => {
    switch (openSheet) {
      case 'time_of_day': return TIME_OPTIONS;
      case 'dosage': return DOSAGE_OPTIONS;
      case 'how_to_take': return HOW_TO_TAKE_OPTIONS;
      case 'side_effects': return SIDE_EFFECT_OPTIONS;
      case 'duration': return DURATION_OPTIONS;
      case 'precautions': return PRECAUTIONS_OPTIONS;
      default: return [];
    }
  };

  const getActiveTitle = (): string => {
    switch (openSheet) {
      case 'time_of_day': return 'Time of Day';
      case 'dosage': return 'Dosage';
      case 'how_to_take': return 'How to Take';
      case 'side_effects': return 'Side Effects';
      case 'duration': return 'Duration';
      case 'precautions': return 'Precautions';
      default: return '';
    }
  };

  const getActiveValue = (): string => {
    switch (openSheet) {
      case 'time_of_day': return timeOfDay;
      case 'dosage': return medDosage;
      case 'how_to_take': return howToTake;
      case 'side_effects': return sideEffects;
      case 'duration': return medDuration;
      case 'precautions': return medPrecautions;
      default: return '';
    }
  };

  const updateActiveValue = (val: string) => {
    switch (openSheet) {
      case 'time_of_day': setTimeOfDay(val); break;
      case 'dosage': setMedDosage(val); break;
      case 'how_to_take': setHowToTake(val); break;
      case 'side_effects': setSideEffects(val); break;
      case 'duration': setMedDuration(val); break;
      case 'precautions': setMedPrecautions(val); break;
    }
  };

  const handleCellTap = (category: string) => {
    setOpenSheet(category);
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
        <Text style={styles.subtitle}>Configure layout size or tap options below to adjust pictograms</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Live label Grid */}
        <View style={styles.gridCard}>
          <Text style={styles.gridCardTitle}>LIVE LABEL STICKER</Text>
          <PictogramGrid
            pictograms={getGridItems()}
            language={language}
            layout={labelFormat}
            maxSlots={4}
            showLabels={false}
          />
        </View>

        {/* Categories Editor Quicklist */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionHeading}>ADJUST CATEGORIES</Text>
          {FIELDS.filter(f => includeOnLabel[f.key] !== false).map(field => {
            const val = field.key === 'time_of_day' ? timeOfDay :
                        field.key === 'dosage' ? medDosage :
                        field.key === 'how_to_take' ? howToTake :
                        field.key === 'side_effects' ? sideEffects :
                        field.key === 'duration' ? medDuration :
                        medPrecautions;

            return (
              <TouchableOpacity
                key={field.key}
                style={styles.categoryRow}
                onPress={() => handleCellTap(field.key)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryRowLabel}>{field.label}</Text>
                  <Text style={styles.categoryRowValue}>
                    {val ? getFriendlyLabel(val) : 'None selected'}
                  </Text>
                </View>
                <View style={styles.categoryRowChevron}>
                  <Text style={{ fontSize: 18, color: '#1B3022', opacity: 0.35 }}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Format selector */}
        <View style={styles.formatSection}>
          <Text style={styles.formatLabel}>Label Format / Size</Text>
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

      {/* Sheet Picker Modal */}
      <Modal visible={openSheet !== null} transparent animationType="slide" onRequestClose={() => setOpenSheet(null)}>
        <TouchableOpacity style={styles.backdrop} onPress={() => setOpenSheet(null)} activeOpacity={1} />
        <View style={[styles.sheet, { paddingBottom: 32 + insets.bottom }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{getActiveTitle()}</Text>
            <TouchableOpacity onPress={() => setOpenSheet(null)} style={styles.sheetClose} activeOpacity={0.7}>
              <XIcon />
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetHint}>Choose an alternative action</Text>
          <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
            {getActiveOptions().map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  updateActiveValue(opt.id);
                  setOpenSheet(null);
                }}
                style={[
                  styles.pickerOptionBtn,
                  getActiveValue() === opt.id && styles.pickerOptionBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    getActiveValue() === opt.id && styles.pickerOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', flex: 1 },
  subtitle: { fontSize: 14, color: 'rgba(27,48,34,0.55)', marginLeft: 60 },
  scroll: { flex: 1, paddingHorizontal: 24 },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(27, 48, 34, 0.08)',
    shadowColor: '#1B3022',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  gridCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(27,48,34,0.4)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(27,48,34,0.4)',
    letterSpacing: 2,
    marginBottom: 10,
    paddingLeft: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(27, 48, 34, 0.04)',
  },
  categoryRowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(27,48,34,0.45)',
  },
  categoryRowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B3022',
    marginTop: 2,
  },
  categoryRowChevron: {
    marginLeft: 12,
  },
  formatSection: { marginBottom: 24 },
  formatLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(27,48,34,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, paddingLeft: 4 },
  formatGrid: { flexDirection: 'row', gap: 8 },
  formatBtn: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(27, 48, 34, 0.04)' },
  formatBtnActive: { backgroundColor: '#1B3022', borderColor: '#1B3022' },
  formatEmoji: { fontSize: 20 },
  formatName: { fontSize: 13, fontWeight: '700', color: '#1B3022' },
  formatNameActive: { color: 'white' },
  formatDesc: { fontSize: 10, color: 'rgba(27,48,34,0.45)' },
  formatDescActive: { color: 'rgba(255,255,255,0.7)' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16 },
  ctaBtn: { backgroundColor: '#1B3022', borderRadius: 999, paddingVertical: 20, alignItems: 'center', minHeight: 64 },
  ctaText: { color: 'white', fontSize: 20, fontWeight: '700', fontFamily: 'Georgia' },
  // Sheet styles
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: '#F5F2ED', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 20, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia' },
  sheetClose: { width: 36, height: 36, backgroundColor: 'rgba(27,48,34,0.1)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetHint: { fontSize: 13, color: 'rgba(27,48,34,0.5)', marginBottom: 16 },
  pickerScroll: { marginVertical: 12 },
  pickerOptionBtn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, backgroundColor: 'white', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(27, 48, 34, 0.08)' },
  pickerOptionBtnActive: { backgroundColor: '#1B3022', borderColor: '#1B3022' },
  pickerOptionText: { fontSize: 16, fontWeight: '600', color: '#1B3022' },
  pickerOptionTextActive: { color: 'white' },
});
