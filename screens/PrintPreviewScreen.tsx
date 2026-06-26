import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import PictogramGrid from '../components/PictogramGrid';

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
    time_of_day = '',
    dosage = '',
    how_to_take = '',
    side_effects = '',
    duration = '',
    precautions = '',
    includeOnLabel = {},
    labelFormat = 'square',
    language = 'en',
    labelId = 'local',
    imageUri,
    imageBase64,
    rawOcrText,
  } = route.params || {};

  const getGridItems = () => {
    const items: string[] = [];
    const inc = (key: string) => includeOnLabel?.[key] !== false;

    if (inc('time_of_day') && time_of_day) items.push(time_of_day);
    if (inc('dosage') && dosage) items.push(dosage);
    if (inc('how_to_take') && how_to_take) items.push(how_to_take);
    if (inc('side_effects') && side_effects) items.push(side_effects);
    if (inc('duration') && duration) items.push(duration);
    if (inc('precautions') && precautions) items.push(precautions);

    return items;
  };

  const handlePrint = () => {
    navigation.navigate('ResultScreen', {
      labelId,
      imageUri,
      imageBase64,
      rawOcrText,
      language,
      labelFormat,
      pictograms: getGridItems()
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
          <Text style={styles.title}>Print Preview</Text>
        </View>
        <Text style={styles.subtitle}>Your confirmed label combination</Text>
      </View>

      {/* Main */}
      <ScrollView contentContainerStyle={[styles.main, { paddingBottom: 120 + insets.bottom }]}>
        <Text style={styles.sectionHint}>Physical Sticker Label</Text>

        {/* Label card */}
        <View style={styles.labelCard}>
          <PictogramGrid
            pictograms={getGridItems()}
            language={language}
            layout={labelFormat}
            maxSlots={4}
          />
        </View>

        <Text style={styles.caption}>
          This sticker will be printed and attached to your medicine bottle.
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(27,48,34,0.12)',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#1B3022',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: { fontSize: 13, color: 'rgba(27,48,34,0.4)', textAlign: 'center', marginTop: 24, lineHeight: 20, paddingHorizontal: 32 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16 },
  printBtn: { backgroundColor: '#1B3022', borderRadius: 999, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 64 },
  printText: { color: 'white', fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
});
