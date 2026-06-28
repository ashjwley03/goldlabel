import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { supabase } from '../utils/supabase';
import { GeminiResponse } from '../types';
import {
  TIME_OPTIONS,
  HOW_TO_TAKE_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  DURATION_OPTIONS,
  DOSAGE_OPTIONS,
  PRECAUTIONS_OPTIONS,
  PictogramOption,
} from '../components/PictogramData';
import { getFriendlyLabel } from '../components/PictogramGrid';

interface Field {
  key: string;
  label: string;
  placeholder: string;
  options: PictogramOption[];
}

const FIELDS: Field[] = [
  { key: 'time_of_day', label: 'Time of Day', placeholder: 'Select time...', options: TIME_OPTIONS },
  { key: 'dosage', label: 'Dosage', placeholder: 'Select dosage...', options: DOSAGE_OPTIONS },
  { key: 'how_to_take', label: 'How to Take', placeholder: 'Select taking method...', options: HOW_TO_TAKE_OPTIONS },
  { key: 'side_effects', label: 'Side Effects', placeholder: 'Select side effects...', options: SIDE_EFFECT_OPTIONS },
  { key: 'duration', label: 'Duration', placeholder: 'Select duration...', options: DURATION_OPTIONS },
  { key: 'precautions', label: 'Precautions', placeholder: 'Select precautions...', options: PRECAUTIONS_OPTIONS },
];

function buildDefaults(medicationData?: GeminiResponse): Record<string, string> {
  if (!medicationData) {
    return Object.fromEntries(FIELDS.map((f) => [f.key, '']));
  }
  const cats = medicationData.pictogram_categories ?? {};
  return {
    time_of_day: cats.time_of_day || '',
    dosage: cats.dosage || '',
    how_to_take: cats.how_to_take || '',
    side_effects: cats.side_effects || '',
    duration: cats.duration || '',
    precautions: cats.precautions || '',
  };
}

function buildIncludeDefaults(medicationData?: GeminiResponse): Record<string, boolean> {
  if (!medicationData) {
    return Object.fromEntries(FIELDS.map((f) => [f.key, false]));
  }
  const cats = medicationData.pictogram_categories ?? {};
  return Object.fromEntries(
    FIELDS.map((f) => [f.key, cats[f.key as keyof typeof cats] !== null])
  );
}

function ArrowLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="m19 12H5M5 12l7 7M5 12l7-7" stroke="#1B3022" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PencilIcon({ color = '#1B3022' }: { color?: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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

export default function ConfirmInformationScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { medicationData, imageUri, imageBase64 } = route.params || {};

  const [formData, setFormData] = useState<Record<string, string>>(buildDefaults(medicationData));
  const [includeOnLabel, setIncludeOnLabel] = useState<Record<string, boolean>>(buildIncludeDefaults(medicationData));
  const [activePickerField, setActivePickerField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    setSaving(true);
    try {
      let savedId = 'local';

      // Build the final pictogram_categories mapping
      const finalCategories: Record<string, string | null> = {};
      FIELDS.forEach((f) => {
        finalCategories[f.key] = includeOnLabel[f.key] && formData[f.key] ? formData[f.key] : null;
      });

      if (medicationData) {
        // Construct the row in the finalized schema format for Labels table
        const labelRow = {
          raw_ocr_reference: medicationData.raw_ocr_reference || '',
          medication_name: medicationData.medication_name || '',
          language: medicationData.language || 'en',
          pictogram_categories: {
            language: medicationData.language || 'en',
            ...finalCategories
          }
        };

        const { data, error } = await supabase
          .from('Labels')
          .insert([labelRow])
          .select('id')
          .single();

        if (error) throw error;
        savedId = String(data.id);
      }

      navigation.navigate('LanguageSelection', {
        formData,
        includeOnLabel,
        labelId: savedId,
        imageUri,
        imageBase64,
        rawOcrText: medicationData?.raw_ocr_reference || ''
      });
    } catch (err: any) {
      console.error('Supabase save error:', err);
      const detail = err?.message || JSON.stringify(err);
      Alert.alert('Save Failed', detail || 'Could not save to database.', [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('LanguageSelection', {
            formData,
            includeOnLabel,
            labelId: 'local',
            imageUri,
            imageBase64,
            rawOcrText: medicationData?.raw_ocr_reference || ''
          }),
        },
        { text: 'Cancel' },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const getActiveFieldOptions = (): PictogramOption[] => {
    if (!activePickerField) return [];
    const field = FIELDS.find((f) => f.key === activePickerField);
    return field ? field.options : [];
  };

  const getActiveFieldLabel = (): string => {
    if (!activePickerField) return '';
    const field = FIELDS.find((f) => f.key === activePickerField);
    return field ? field.label : '';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeftIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Confirm Information</Text>
        </View>
        {medicationData && (
          <Text style={styles.medName}>{medicationData.medication_name}</Text>
        )}
        <Text style={styles.subtitle}>
          OCR has read your label — tap <Text style={styles.subtitleBold}>Edit</Text> on any field to correct a mistake
        </Text>
      </View>

      {/* Scrollable form */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {FIELDS.map((field) => {
          const included = includeOnLabel[field.key];
          const value = formData[field.key];
          const isEmpty = !value || value.trim().length === 0;

          return (
            <View key={field.key} style={[styles.fieldCard, !included && styles.fieldCardDimmed]}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TouchableOpacity
                  onPress={() => included && setActivePickerField(field.key)}
                  disabled={!included}
                  style={[styles.editBtn, !included && styles.editBtnDisabled]}
                  activeOpacity={0.7}
                >
                  <PencilIcon color={included ? 'rgba(27,48,34,0.7)' : 'rgba(27,48,34,0.3)'} />
                  <Text style={[styles.editBtnText, !included && { opacity: 0.4 }]}>Edit</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => included && setActivePickerField(field.key)}
                disabled={!included}
                activeOpacity={0.7}
                style={[styles.displayBox, isEmpty && styles.displayBoxEmpty]}
              >
                {isEmpty ? (
                  <Text style={styles.placeholderText}>{field.placeholder}</Text>
                ) : (
                  <Text style={styles.displayText}>{getFriendlyLabel(value)}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>
                  {included ? 'Included on label' : 'Excluded from label'}
                </Text>
                <Switch
                  value={included}
                  onValueChange={() => setIncludeOnLabel((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                  trackColor={{ false: 'rgba(27,48,34,0.2)', true: '#1B3022' }}
                  thumbColor="white"
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
        <TouchableOpacity onPress={handleNext} disabled={saving} style={[styles.ctaBtn, saving && styles.ctaBtnDisabled]} activeOpacity={0.85}>
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.ctaText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Picker Modal */}
      <Modal visible={activePickerField !== null} transparent animationType="slide" onRequestClose={() => setActivePickerField(null)}>
        <TouchableOpacity style={styles.backdrop} onPress={() => setActivePickerField(null)} activeOpacity={1} />
        <View style={[styles.sheet, { paddingBottom: 32 + insets.bottom }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{getActiveFieldLabel()}</Text>
            <TouchableOpacity onPress={() => setActivePickerField(null)} style={styles.sheetClose} activeOpacity={0.7}>
              <XIcon />
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetHint}>Choose the correct action</Text>
          <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
            {getActiveFieldOptions().map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, [activePickerField!]: opt.id }));
                  setActivePickerField(null);
                }}
                style={[
                  styles.pickerOptionBtn,
                  formData[activePickerField!] === opt.id && styles.pickerOptionBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    formData[activePickerField!] === opt.id && styles.pickerOptionTextActive,
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
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', flex: 1 },
  medName: { fontSize: 20, fontWeight: '700', color: '#D37B5C', marginLeft: 60, marginBottom: 2 },
  subtitle: { fontSize: 15, color: 'rgba(27,48,34,0.55)', marginLeft: 60 },
  subtitleBold: { fontWeight: '600', color: 'rgba(27,48,34,0.7)' },
  scroll: { flex: 1, paddingHorizontal: 24 },
  fieldCard: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 18, padding: 20, marginBottom: 16 },
  fieldCardDimmed: { opacity: 0.55 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  fieldLabel: { fontSize: 18, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', flex: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(27,48,34,0.1)' },
  editBtnDisabled: { opacity: 0.4 },
  editBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(27,48,34,0.7)' },
  displayBox: { backgroundColor: '#F5F2ED', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 54, justifyContent: 'center' },
  displayBoxEmpty: { backgroundColor: 'rgba(27,48,34,0.05)' },
  placeholderText: { fontSize: 17, color: 'rgba(27,48,34,0.35)', fontStyle: 'italic' },
  displayText: { fontSize: 20, fontWeight: '600', color: '#1B3022' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(27,48,34,0.1)' },
  toggleLabel: { fontSize: 12, color: 'rgba(27,48,34,0.55)', fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16 },
  ctaBtn: { backgroundColor: '#1B3022', borderRadius: 999, paddingVertical: 20, alignItems: 'center', minHeight: 64 },
  ctaBtnDisabled: { backgroundColor: 'rgba(27,48,34,0.5)' },
  ctaText: { color: 'white', fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
  // Sheet styles
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: '#F5F2ED', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 20, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia' },
  sheetClose: { width: 36, height: 36, backgroundColor: 'rgba(27,48,34,0.1)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetHint: { fontSize: 13, color: 'rgba(27,48,34,0.5)', marginBottom: 16 },
  pickerScroll: { marginVertical: 12 },
  pickerOptionBtn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, backgroundColor: 'white', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(27,48,34,0.08)' },
  pickerOptionBtnActive: { backgroundColor: '#1B3022', borderColor: '#1B3022' },
  pickerOptionText: { fontSize: 16, fontWeight: '600', color: '#1B3022' },
  pickerOptionTextActive: { color: 'white' },
});
