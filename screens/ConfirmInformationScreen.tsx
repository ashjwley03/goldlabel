import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../utils/supabase';
import { GeminiResponse, ResolvedPictogram } from '../types';

// ─── Field definitions ────────────────────────────────────────────────────────
type FieldType = 'pictogram' | 'text';

interface Field {
  key: string;
  label: string;
  placeholder: string;
  type: FieldType;
  // Which pictogram_categories key does this field map to?
  categoryKey?: keyof GeminiResponse['pictogram_categories'];
  description?: string;
}

const FIELDS: Field[] = [
  { key: 'timeOfDay',   label: 'Time of Day',         placeholder: 'e.g. Morning',           type: 'pictogram', categoryKey: 'time_of_day' },
  { key: 'howLong',     label: 'How long to take for', placeholder: 'e.g. 2 weeks',           type: 'text',      categoryKey: 'duration' },
  { key: 'dosage',      label: 'Dosage',               placeholder: 'e.g. 2 tablets',         type: 'pictogram', categoryKey: 'dosage' },
  { key: 'howToTake',   label: 'How to take med',      placeholder: 'e.g. With food',         type: 'pictogram', categoryKey: 'how_to_take' },
  { key: 'sideEffects', label: 'Side effects',         placeholder: 'e.g. Drowsiness',        type: 'pictogram', categoryKey: 'side_effects' },
  { key: 'precautions', label: 'Precautions',          placeholder: 'e.g. Avoid alcohol',     type: 'pictogram', categoryKey: 'precautions' },
  { key: 'others',      label: 'Others',               placeholder: 'Any other notes…',       type: 'text',
    description: "Any extracted text that doesn't fall into the categories above but is still meaningful." },
];

const BUCKET = 'pictograms';

// ─── Pictogram lookup ─────────────────────────────────────────────────────────
// Takes the flat pictogram_categories from the backend + a language code,
// queries Supabase for the matching asset rows, and returns resolved image URLs.
async function lookupPictograms(
  categories: GeminiResponse['pictogram_categories'],
  language: string
): Promise<Record<string, ResolvedPictogram>> {
  // Collect all non-null pictogram IDs
  const ids = Object.values(categories).filter((id): id is string => id !== null);
  if (ids.length === 0) return {};

  // Single query — fetch all matching rows for this language
  const { data, error } = await supabase
    .from('pictogram_assets')
    .select('pictogram_id, category_key, asset_path, label, variant_id')
    .eq('language_code', language)
    .eq('is_default', true)
    .in('pictogram_id', ids);

  if (error || !data) {
    console.error('Pictogram lookup failed:', error);
    return {};
  }

  // Build a map of { pictogram_id → ResolvedPictogram }
  const resolved: Record<string, ResolvedPictogram> = {};
  for (const row of data) {
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(row.asset_path);
    resolved[row.pictogram_id] = {
      category: row.category_key,
      pictogram_id: row.pictogram_id,
      label: row.label,
      imageUrl: urlData?.publicUrl ?? '',
    };
  }
  return resolved;
}

// ─── Build initial text values for each field ─────────────────────────────────
function buildDefaults(
  medicationData?: GeminiResponse,
  resolved?: Record<string, ResolvedPictogram>
): Record<string, string> {
  if (!medicationData) return Object.fromEntries(FIELDS.map((f) => [f.key, '']));

  const cats = medicationData.pictogram_categories;
  const label = (id: string | null) => (id && resolved?.[id]?.label) ? resolved[id].label : '';

  return {
    timeOfDay:   label(cats.time_of_day),
    howLong:     label(cats.duration),
    dosage:      label(cats.dosage),
    howToTake:   label(cats.how_to_take),
    sideEffects: label(cats.side_effects),
    precautions: label(cats.precautions),
    others: '',
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
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

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6 9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TypeTag({ type }: { type: FieldType }) {
  if (type === 'pictogram') {
    return (
      <View style={styles.tagPictogram}>
        <Text style={styles.tagPictogramText}>Pictogram</Text>
      </View>
    );
  }
  return (
    <View style={styles.tagText}>
      <Text style={styles.tagTextText}>Text</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ConfirmInformationScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { medicationData } = (route.params as { medicationData?: GeminiResponse }) || {};

  // Resolved pictograms: pictogram_id → { label, imageUrl }
  const [resolved, setResolved] = useState<Record<string, ResolvedPictogram>>({});
  const [loadingPictograms, setLoadingPictograms] = useState(true);

  const [formData, setFormData] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, '']))
  );
  const [includeOnLabel, setIncludeOnLabel] = useState<Record<string, boolean>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, true]))
  );
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // ── Pictogram lookup on mount ─────────────────────────────────────────────
  // As soon as this screen loads, look up all pictogram images from Supabase.
  // Uses the language the backend detected from the OCR text.
  useEffect(() => {
    if (!medicationData) {
      setLoadingPictograms(false);
      return;
    }

    const language = medicationData.language || 'none';

    lookupPictograms(medicationData.pictogram_categories, language)
      .then((resolvedMap) => {
        setResolved(resolvedMap);
        // Now that we have labels, populate the form
        setFormData(buildDefaults(medicationData, resolvedMap));
      })
      .finally(() => setLoadingPictograms(false));
  }, [medicationData]);

  // ── Save to Supabase and go to next screen ────────────────────────────────
  const handleNext = async () => {
    setSaving(true);
    try {
      let savedId = 'local';

      if (medicationData) {
        const { data, error } = await supabase
          .from('Labels')
          .insert([medicationData])
          .select('id')
          .single();

        if (error) throw error;
        savedId = data.id;
      }

      navigation.navigate('LanguageSelection', { formData, includeOnLabel, labelId: savedId });
    } catch (err: any) {
      console.error('Supabase save error:', err);
      const detail = [
        err?.message && `Message: ${err.message}`,
        err?.code && `Code: ${err.code}`,
        err?.details && `Details: ${err.details}`,
        err?.hint && `Hint: ${err.hint}`,
      ].filter(Boolean).join('\n') || JSON.stringify(err);
      Alert.alert('Save Failed', detail || 'Could not save to database.', [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('LanguageSelection', { formData, includeOnLabel, labelId: 'local' }),
        },
        { text: 'Cancel' },
      ]);
    } finally {
      setSaving(false);
    }
  };

  // ── Show a loading spinner while pictograms are being fetched ─────────────
  if (loadingPictograms) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B3022" />
        <Text style={styles.loadingText}>Looking up pictograms…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          {medicationData?.requires_review && (
            <View style={styles.reviewBanner}>
              <Text style={styles.reviewBannerText}>⚠️ Low confidence — please review carefully</Text>
            </View>
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
            const isEditing = editingFields[field.key] ?? false;
            const value = formData[field.key];
            const isEmpty = !value || value.trim().length === 0;

            // For pictogram fields, find the resolved pictogram image
            const pictogramId = field.categoryKey
              ? medicationData?.pictogram_categories[field.categoryKey]
              : null;
            const pictogram = pictogramId ? resolved[pictogramId] : null;

            return (
              <View key={field.key} style={[styles.fieldCard, !included && styles.fieldCardDimmed]}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <TypeTag type={field.type} />
                  <TouchableOpacity
                    onPress={() => setEditingFields((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                    disabled={!included}
                    style={[styles.editBtn, isEditing && styles.editBtnActive, !included && styles.editBtnDisabled]}
                    activeOpacity={0.7}
                  >
                    {isEditing ? (
                      <>
                        <CheckIcon />
                        <Text style={styles.editBtnTextActive}>Done</Text>
                      </>
                    ) : (
                      <>
                        <PencilIcon color={included ? 'rgba(27,48,34,0.7)' : 'rgba(27,48,34,0.3)'} />
                        <Text style={[styles.editBtnText, !included && { opacity: 0.4 }]}>Edit</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {field.description && (
                  <Text style={styles.fieldDesc}>{field.description}</Text>
                )}

                {/* Pictogram image — shown for pictogram fields when not editing */}
                {field.type === 'pictogram' && !isEditing && pictogram && (
                  <View style={styles.pictogramRow}>
                    <Image
                      source={{ uri: pictogram.imageUrl }}
                      style={styles.pictogramImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.pictogramLabel}>{pictogram.label}</Text>
                  </View>
                )}

                {isEditing ? (
                  <TextInput
                    value={value}
                    onChangeText={(t) => setFormData((prev) => ({ ...prev, [field.key]: t }))}
                    placeholder={field.placeholder}
                    autoFocus
                    style={styles.input}
                    placeholderTextColor="rgba(27,48,34,0.35)"
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => included && setEditingFields((prev) => ({ ...prev, [field.key]: true }))}
                    disabled={!included}
                    activeOpacity={0.7}
                    style={[styles.displayBox, isEmpty && styles.displayBoxEmpty]}
                  >
                    {isEmpty ? (
                      <Text style={styles.placeholderText}>{field.placeholder}</Text>
                    ) : (
                      <Text style={styles.displayText}>{value}</Text>
                    )}
                  </TouchableOpacity>
                )}

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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  loadingContainer: { flex: 1, backgroundColor: '#F5F2ED', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 16, color: 'rgba(27,48,34,0.6)' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', flex: 1 },
  medName: { fontSize: 20, fontWeight: '700', color: '#D37B5C', marginLeft: 60, marginBottom: 2 },
  reviewBanner: { backgroundColor: '#FFF3CD', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginLeft: 60, marginBottom: 8 },
  reviewBannerText: { fontSize: 13, color: '#856404', fontWeight: '600' },
  subtitle: { fontSize: 15, color: 'rgba(27,48,34,0.55)', marginLeft: 60 },
  subtitleBold: { fontWeight: '600', color: 'rgba(27,48,34,0.7)' },
  scroll: { flex: 1, paddingHorizontal: 24 },
  fieldCard: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 18, padding: 20, marginBottom: 16 },
  fieldCardDimmed: { opacity: 0.55 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  fieldLabel: { fontSize: 18, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', flex: 1 },
  tagPictogram: { backgroundColor: '#1B3022', paddingHorizontal: 12, paddingVertical: 2, borderRadius: 999 },
  tagPictogramText: { color: 'white', fontSize: 12, fontWeight: '600' },
  tagText: { borderWidth: 2, borderColor: '#D37B5C', paddingHorizontal: 12, paddingVertical: 2, borderRadius: 999 },
  tagTextText: { color: '#D37B5C', fontSize: 12, fontWeight: '600' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(27,48,34,0.1)' },
  editBtnActive: { backgroundColor: '#1B3022' },
  editBtnDisabled: { opacity: 0.4 },
  editBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(27,48,34,0.7)' },
  editBtnTextActive: { fontSize: 13, fontWeight: '600', color: 'white' },
  pictogramRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, backgroundColor: '#F5F2ED', borderRadius: 12, padding: 12 },
  pictogramImage: { width: 64, height: 64, borderRadius: 8 },
  pictogramLabel: { fontSize: 15, fontWeight: '600', color: '#1B3022', flex: 1 },
  fieldDesc: { fontSize: 12, color: 'rgba(27,48,34,0.5)', marginBottom: 12, lineHeight: 18 },
  input: { backgroundColor: '#F5F2ED', borderWidth: 2, borderColor: '#1B3022', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 20, color: '#1B3022', minHeight: 54 },
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
});
