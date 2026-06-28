import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../utils/supabase';
import PictogramGrid, { getFriendlyLabel } from '../components/PictogramGrid';

const LANG_MAP: Record<string, string> = {
  none: 'No Text (Pictogram only)',
  en: 'English',
  bn: 'Bengali (বাংলা)',
  hi: 'Hindi (हिन्दी)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  te: 'Telugu (తెలుగు)',
  my: 'Burmese (မြန်မာဘာသာ)',
  th: 'Thai (ภาษาไทย)',
  vi: 'Vietnamese (Tiếng Việt)',
  zh: 'Chinese (中文)',
  ms: 'Malay (Bahasa Melayu)',
  ta: 'Tamil (தமிழ்)',
};

function ArrowLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="m19 12H5M5 12l7 7M5 12l7-7" stroke="#1B3022" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ResultScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const {
    labelId = 'local',
    imageUri,
    rawOcrText = '',
    language = 'en',
    labelFormat = 'square',
    pictograms = [] as string[],
  } = route.params || {};

  const [loadingStatus, setLoadingStatus] = useState<'verified' | 'rejected' | 'needs_review' | null>(null);
  const [showOcr, setShowOcr] = useState(false);

  const handleVerifyAction = async (status: 'verified' | 'rejected' | 'needs_review') => {
    setLoadingStatus(status);
    try {
      if (labelId && labelId !== 'local') {
        // Fetch the current record first to preserve fields
        const { data: currentRecord, error: getError } = await supabase
          .from('Labels')
          .select('*')
          .eq('id', labelId)
          .single();

        if (getError) throw getError;

        const currentCats = currentRecord.pictogram_categories || {};
        const updatedCats = {
          ...currentCats,
          verification_status: status,
        };

        const { error: updateError } = await supabase
          .from('Labels')
          .update({ pictogram_categories: updatedCats })
          .eq('id', labelId);

        if (updateError) throw updateError;
      }

      Alert.alert(
        'Submission Saved',
        `Sticker successfully marked as: ${status.toUpperCase().replace('_', ' ')}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
      );
    } catch (err: any) {
      console.error('Error saving verification status:', err);
      Alert.alert('Verification Failed', err.message || 'Could not update status.', [
        { text: 'Continue Anyway', onPress: () => navigation.navigate('Dashboard') },
        { text: 'Cancel' },
      ]);
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeftIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Result Verification</Text>
        </View>
        <Text style={styles.subtitle}>Verify whether the AI-generated pictograms match your medicine label</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 160 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Scanned Image Preview */}
        <View style={styles.imageCard}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.scannedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 44, marginBottom: 8 }}>📸</Text>
              <Text style={styles.imagePlaceholderText}>No label photo available</Text>
            </View>
          )}
        </View>

        {/* Selected Language */}
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Label Language</Text>
          <Text style={styles.metaValue}>{LANG_MAP[language] || language}</Text>
        </View>

        {/* Pictogram Grid Output */}
        <View style={styles.gridCard}>
          <Text style={styles.gridCardTitle}>CONFIRMED STICKER GRAPHIC</Text>
          <PictogramGrid
            pictograms={pictograms}
            language={language}
            layout={labelFormat}
            maxSlots={4}
            showLabels={false}
          />
        </View>

        {/* Simplified instructions list */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>STICKER DETAILS</Text>
          {pictograms.map((pic: string, index: number) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionDot}>•</Text>
              <Text style={styles.instructionText}>{getFriendlyLabel(pic)}</Text>
            </View>
          ))}
        </View>

        {/* Raw OCR Collapsible */}
        <View style={styles.collapsibleCard}>
          <TouchableOpacity
            onPress={() => setShowOcr(!showOcr)}
            style={styles.collapsibleHeader}
            activeOpacity={0.7}
          >
            <Text style={styles.collapsibleTitle}>RAW OCR EXTRACTED TEXT</Text>
            <Text style={styles.collapsibleChevron}>{showOcr ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showOcr && (
            <Text style={styles.ocrText}>{rawOcrText || 'No OCR text detected.'}</Text>
          )}
        </View>
      </ScrollView>

      {/* Verification CTAs */}
      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={() => handleVerifyAction('rejected')}
            disabled={loadingStatus !== null}
            style={[styles.actionBtn, styles.btnReject, loadingStatus !== null && styles.btnDisabled]}
            activeOpacity={0.8}
          >
            {loadingStatus === 'rejected' ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Reject</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleVerifyAction('needs_review')}
            disabled={loadingStatus !== null}
            style={[styles.actionBtn, styles.btnNeedsReview, loadingStatus !== null && styles.btnDisabled]}
            activeOpacity={0.8}
          >
            {loadingStatus === 'needs_review' ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Review</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => handleVerifyAction('verified')}
          disabled={loadingStatus !== null}
          style={[styles.verifyBtn, loadingStatus !== null && styles.btnDisabled]}
          activeOpacity={0.85}
        >
          {loadingStatus === 'verified' ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify & Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', flex: 1 },
  subtitle: { fontSize: 13, color: 'rgba(27,48,34,0.55)', marginLeft: 60 },
  scroll: { flex: 1, paddingHorizontal: 24 },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 48, 34, 0.08)',
  },
  scannedImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(27, 48, 34, 0.03)',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: 'rgba(27,48,34,0.4)',
    fontWeight: '600',
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(27, 48, 34, 0.08)',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(27,48,34,0.45)',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B3022',
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
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
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 48, 34, 0.04)',
  },
  instructionsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(27,48,34,0.4)',
    letterSpacing: 2,
    marginBottom: 10,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  instructionDot: {
    fontSize: 16,
    color: '#D37B5C',
    marginRight: 8,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B3022',
  },
  collapsibleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 48, 34, 0.04)',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(27,48,34,0.4)',
    letterSpacing: 2,
  },
  collapsibleChevron: {
    fontSize: 10,
    color: 'rgba(27,48,34,0.5)',
  },
  ocrText: {
    fontSize: 13,
    color: 'rgba(27,48,34,0.7)',
    marginTop: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 8,
    backgroundColor: '#F5F2ED',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnReject: {
    backgroundColor: '#D32F2F',
  },
  btnNeedsReview: {
    backgroundColor: '#FFA000',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  verifyBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  verifyBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  btnDisabled: {
    opacity: 0.55,
  },
});
