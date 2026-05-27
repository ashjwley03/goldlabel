import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { LabelRecord, CategoryData } from '../types';
import { MorningIcon, NoonIcon, NightIcon, PillIcon, FoodIcon, NoFoodIcon } from '../components/CustomIcons';

function XIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6 6 18M6 6l12 12" stroke="#1B3022" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

function AlertIcon() {
  return (
    <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="rgba(27,48,34,0.4)" strokeWidth="2.5" />
      <Path d="M12 8v4M12 16h.01" stroke="rgba(27,48,34,0.4)" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

function parseTimingFromCategory(category: CategoryData) {
  const slug = (category.selected_pictogram_id || '').toLowerCase();
  const label = (category.suggested_options.find(
    (o) => o.pictogram_id === category.selected_pictogram_id
  )?.label || '').toLowerCase();
  const text = slug + ' ' + label;
  return {
    morning: text.includes('morning'),
    noon: text.includes('noon') || text.includes('afternoon') || text.includes('midday'),
    night: text.includes('night') || text.includes('evening'),
  };
}

function parseDosageFromCategory(category: CategoryData): { amount: number; unit: string } {
  const slug = category.selected_pictogram_id || '';
  const match = slug.match(/(\d+)/);
  const amount = match ? parseInt(match[1], 10) : 1;
  return { amount, unit: amount === 1 ? 'tablet' : 'tablets' };
}

function parseWithFoodFromCategory(category: CategoryData): boolean | null {
  const slug = (category.selected_pictogram_id || '').toLowerCase();
  const label = (category.suggested_options.find(
    (o) => o.pictogram_id === category.selected_pictogram_id
  )?.label || '').toLowerCase();
  const text = slug + ' ' + label;
  if (text.includes('with-food') || text.includes('with food')) return true;
  if (text.includes('empty') || text.includes('without') || text.includes('no food')) return false;
  return null;
}

export default function PictographViewScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { label } = route.params as { label?: LabelRecord } || {};

  if (!label) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <AlertIcon />
        <Text style={styles.notFoundText}>Medication not found</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.goHomeBtn} activeOpacity={0.85}>
          <Text style={styles.goHomeBtnText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cats = label.pictogram_categories;

  const emptyCategory: CategoryData = { suggested_options: [], selected_pictogram_id: null };
  const timeOfDay = cats?.time_of_day ?? emptyCategory;
  const dosageCat = cats?.dosage ?? emptyCategory;
  const specialInstructions = cats?.special_instructions ?? emptyCategory;

  const timing = parseTimingFromCategory(timeOfDay);
  const dosage = parseDosageFromCategory(dosageCat);
  const withFood = parseWithFoodFromCategory(specialInstructions);

  const specialLabel = specialInstructions.suggested_options.find(
    (o) => o.pictogram_id === specialInstructions.selected_pictogram_id
  )?.label || specialInstructions.selected_pictogram_id || '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.medName}>{label.medication_name}</Text>
            <Text style={styles.headerSub}>Your Instructions</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.closeBtn} activeOpacity={0.7}>
            <XIcon />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dosage hero */}
        <View style={styles.heroCard}>
          <Text style={styles.cardSectionLabel}>How Much</Text>
          <View style={styles.heroInner}>
            <PillIcon size={140} />
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <Text style={styles.dosageNumber}>{dosage.amount}</Text>
              <Text style={styles.dosageUnit}>{dosage.unit.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Timing card */}
        <View style={styles.timingCard}>
          <Text style={styles.cardSectionLabel}>When to Take</Text>
          <View style={styles.timingGrid}>
            {[
              { key: 'morning', label: 'Morning', Icon: MorningIcon, active: timing.morning },
              { key: 'noon', label: 'Noon', Icon: NoonIcon, active: timing.noon },
              { key: 'night', label: 'Night', Icon: NightIcon, active: timing.night },
            ].map(({ key, label: timeLabel, Icon, active }) => (
              <View key={key} style={[styles.timingItem, !active && styles.timingItemDimmed]}>
                <Icon size={100} />
                <Text style={styles.timingLabel}>{timeLabel}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Food card */}
        {withFood !== null && (
          <View style={[styles.foodCard, withFood ? styles.foodCardWith : styles.foodCardWithout]}>
            <Text style={styles.cardSectionLabel}>
              {withFood ? 'Take With Food' : 'Take on Empty Stomach'}
            </Text>
            <View style={{ alignItems: 'center' }}>
              {withFood ? <FoodIcon size={120} /> : <NoFoodIcon size={120} />}
            </View>
          </View>
        )}

        {/* Special instructions */}
        {specialLabel && withFood === null && (
          <View style={styles.instructionsCard}>
            <Text style={styles.cardSectionLabel}>Special Instructions</Text>
            <Text style={styles.instructionsText}>{specialLabel}</Text>
          </View>
        )}

        {/* Raw text */}
        <View style={styles.instructionsCard}>
          <Text style={styles.cardSectionLabel}>Label Text</Text>
          <Text style={styles.instructionsText}>{label.raw_text}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate('Scanner')} style={styles.scanAnotherBtn} activeOpacity={0.85}>
            <Text style={styles.scanAnotherText}>Scan Another</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.doneBtn} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: { paddingHorizontal: 32, paddingTop: 10, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  medName: { fontSize: 36, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', lineHeight: 44, marginBottom: 4 },
  headerSub: { fontSize: 18, color: 'rgba(27,48,34,0.6)' },
  closeBtn: { width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 32, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  content: { paddingHorizontal: 32, paddingTop: 8, gap: 32 },
  heroCard: { backgroundColor: 'white', borderRadius: 32, padding: 40, shadowColor: '#1B3022', shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  cardSectionLabel: { fontSize: 18, color: 'rgba(27,48,34,0.6)', textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 },
  heroInner: { alignItems: 'center' },
  dosageNumber: { fontSize: 96, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', lineHeight: 104 },
  dosageUnit: { fontSize: 32, fontWeight: '700', color: 'rgba(27,48,34,0.8)', fontFamily: 'Georgia' },
  timingCard: { backgroundColor: 'white', borderRadius: 32, padding: 40, shadowColor: '#1B3022', shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  timingGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  timingItem: { alignItems: 'center', flex: 1 },
  timingItemDimmed: { opacity: 0.2 },
  timingLabel: { fontSize: 18, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', marginTop: 16 },
  foodCard: { borderRadius: 32, padding: 40, shadowColor: '#1B3022', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  foodCardWith: { backgroundColor: 'rgba(45,95,63,0.1)', borderWidth: 4, borderColor: 'rgba(45,95,63,0.3)' },
  foodCardWithout: { backgroundColor: 'rgba(211,123,92,0.1)', borderWidth: 4, borderColor: 'rgba(211,123,92,0.3)' },
  instructionsCard: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 32, padding: 40, shadowColor: '#1B3022', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  instructionsText: { fontSize: 20, color: '#1B3022', lineHeight: 30 },
  actions: { gap: 16 },
  scanAnotherBtn: { backgroundColor: '#1B3022', borderRadius: 28, paddingVertical: 28, alignItems: 'center', minHeight: 80, shadowColor: '#1B3022', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  scanAnotherText: { color: 'white', fontSize: 28, fontWeight: '700', fontFamily: 'Georgia' },
  doneBtn: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 28, paddingVertical: 24, alignItems: 'center', minHeight: 72 },
  doneBtnText: { color: '#1B3022', fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
  notFoundText: { fontSize: 28, color: 'rgba(27,48,34,0.7)', fontFamily: 'Georgia', marginTop: 24, marginBottom: 32 },
  goHomeBtn: { backgroundColor: '#1B3022', paddingHorizontal: 40, paddingVertical: 20, borderRadius: 28, minHeight: 64 },
  goHomeBtnText: { color: 'white', fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
});
