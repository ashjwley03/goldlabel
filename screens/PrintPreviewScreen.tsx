import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { format, addDays } from 'date-fns';
import {
  TIME_OPTIONS,
  HOW_TO_TAKE_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  getIcon,
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

function ArrowLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="m19 12H5M5 12l7 7M5 12l7-7" stroke="#1B3022" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PrinterIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9V2h12v7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 14h12v8H6z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function PrintPreviewScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const {
    timeSelections = { morning: 'v0' } as Record<string, string>,
    pillCount = 1,
    howToTakeSelections = { crush: 'v0' } as Record<string, string>,
    sideEffectSelections = { drowsiness: 'v0' } as Record<string, string>,
    howLong = '',
    others = '',
    includeOnLabel = {},
    labelFormat = 'box',
  } = route.params || {};

  const isZiplock = labelFormat === 'ziplock';
  const isBottle = labelFormat === 'bottle';

  const inc = (key: string) => includeOnLabel?.[key] !== false;
  const showDuration = inc('howLong') && howLong?.trim().length > 0;
  const showOthers = inc('others') && others?.trim().length > 0;

  const durationDays = showDuration ? parseDurationToDays(howLong) : null;
  const today = new Date();
  const durationDisplay = durationDays != null
    ? `${format(today, 'd MMM')} – ${format(addDays(today, durationDays), 'd MMM yyyy')}`
    : howLong?.trim();

  const sections: { key: string; label: string; content: React.ReactElement | null }[] = [];

  if (inc('timeOfDay') && Object.keys(timeSelections).length > 0) {
    const iconSize = Object.keys(timeSelections).length > 2 ? 26 : Object.keys(timeSelections).length > 1 ? 32 : 40;
    sections.push({
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
    const pillSize = pillCount > 5 ? 16 : pillCount > 3 ? 20 : 26;
    sections.push({
      key: 'dosage',
      label: 'Dosage',
      content: (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {Array.from({ length: pillCount }).map((_, i) => <PillIcon key={i} size={pillSize} />)}
        </View>
      ),
    });
  }

  if (inc('howToTake') && Object.keys(howToTakeSelections).length > 0) {
    const iconSize = Object.keys(howToTakeSelections).length > 2 ? 22 : Object.keys(howToTakeSelections).length > 1 ? 30 : 40;
    sections.push({
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
    const iconSize = Object.keys(sideEffectSelections).length > 2 ? 22 : Object.keys(sideEffectSelections).length > 1 ? 30 : 40;
    sections.push({
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

  const handlePrint = () => {
    navigation.navigate('Feedback');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeftIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Print Preview</Text>
        </View>
        <Text style={styles.subtitle}>Your confirmed label combination</Text>
      </View>

      {/* Main */}
      <ScrollView contentContainerStyle={[styles.main, { paddingBottom: 120 + insets.bottom }]}>
        <Text style={styles.sectionHint}>Physical sticker label</Text>

        {/* Label card */}
        <View style={styles.labelCard}>
          {sections.length > 0 && (
            <View style={isZiplock ? {} : isBottle ? { flexDirection: 'row' } : { flexDirection: 'row', flexWrap: 'wrap' }}>
              {sections.map((sec, i) => (
                <View
                  key={sec.key}
                  style={[
                    styles.section,
                    isBottle && i > 0 && styles.sectionBorderLeft,
                    !isZiplock && !isBottle && i % 2 === 1 && styles.sectionBorderLeft,
                    !isZiplock && !isBottle && i >= 2 && styles.sectionBorderTop,
                    isZiplock && i > 0 && styles.sectionBorderTop,
                    { width: isZiplock ? '100%' : isBottle ? `${100 / sections.length}%` : '50%', minHeight: isZiplock ? 52 : 72 },
                  ]}
                >
                  <View style={styles.sectionContent}>{sec.content}</View>
                  <Text style={styles.sectionLabel}>{sec.label}</Text>
                </View>
              ))}
            </View>
          )}
          {(showDuration || showOthers) && (
            <View style={styles.textRow}>
              <Text style={styles.textRowText}>
                {showDuration ? durationDisplay : ''}{showDuration && showOthers ? '  ·  ' : ''}{showOthers ? others : ''}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.caption}>
          This sticker will be printed and attached to your medicine bottle
        </Text>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
        <TouchableOpacity onPress={handlePrint} style={styles.printBtn} activeOpacity={0.85}>
          <PrinterIcon />
          <Text style={styles.printText}>Print Label</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', flex: 1 },
  subtitle: { fontSize: 15, color: 'rgba(27,48,34,0.55)', marginLeft: 60 },
  main: { paddingHorizontal: 24, alignItems: 'center', paddingTop: 8 },
  sectionHint: { fontSize: 13, fontWeight: '600', color: 'rgba(27,48,34,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 },
  labelCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,48,34,0.12)',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#1B3022',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  section: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 8, gap: 8 },
  sectionBorderLeft: { borderLeftWidth: 1, borderLeftColor: 'rgba(27,48,34,0.1)' },
  sectionBorderTop: { borderTopWidth: 1, borderTopColor: 'rgba(27,48,34,0.1)' },
  sectionContent: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 8, fontWeight: '700', color: '#1B3022', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  textRow: { borderTopWidth: 1, borderTopColor: 'rgba(27,48,34,0.1)', marginHorizontal: 16, paddingVertical: 12 },
  textRowText: { fontSize: 11, color: 'rgba(27,48,34,0.8)', textAlign: 'center', fontWeight: '500', lineHeight: 16 },
  caption: { fontSize: 13, color: 'rgba(27,48,34,0.4)', textAlign: 'center', marginTop: 24, lineHeight: 20, paddingHorizontal: 32 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16 },
  printBtn: { backgroundColor: '#1B3022', borderRadius: 999, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 64 },
  printText: { color: 'white', fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
});
