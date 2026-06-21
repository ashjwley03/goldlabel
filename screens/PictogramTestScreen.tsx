import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../utils/supabase';

const BUCKET = 'pictograms'; 

async function resolvePictogramUrl(pictogramId: string, lang: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('pictogram_assets')
    .select('asset_path')
    .eq('pictogram_id', pictogramId)
    .eq('language_code', lang)
    .eq('is_default', true)
    .maybeSingle();

  if (error || !data?.asset_path) return null;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.asset_path);
  return urlData?.publicUrl ?? null;
}

const TEST_PICTOGRAM_IDS: string[] = [
  'dosage.tablet_1_5',
  'time_of_day.once_daily',
  'how_to_take.with_food',
  'how_to_take.dissolve_in_water_v1',
  'duration.take_1_month',
  'side_effects.nausea',
  'precautions.consult_doctor_if_symptoms_worsen',
];

const LANGUAGES = [
  { code: 'none', name: 'No text' },
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Malay' },
  { code: 'zh', name: 'Chinese' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'my', name: 'Burmese' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'ta', name: 'Tamil' },
];

const COLORS = {
  bg: '#F5F2ED',
  dark: '#1B3022',
  accent: '#D37B5C',
};

function ArrowLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="m19 12H5M5 12l7 7M5 12l7-7" stroke={COLORS.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PictogramTile({ pictogramId, lang }: { pictogramId: string; lang: string }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setUri(null);

    resolvePictogramUrl(pictogramId, lang).then((url) => {
      if (cancelled) return;
      if (!url) {
        setStatus('error');
      } else {
        setUri(url);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pictogramId, lang]);

  return (
    <View style={styles.tile}>
      <View style={styles.imageBox}>
        {status === 'loading' && <ActivityIndicator style={StyleSheet.absoluteFill} color={COLORS.dark} />}
        {status === 'error' && (
          <View style={styles.missingBox}>
            <Text style={styles.missingText}>image{'\n'}missing</Text>
          </View>
        )}
        {uri && (
          <Image
            key={uri}
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
            onLoad={() => setStatus('ok')}
            onError={() => setStatus('error')}
          />
        )}
      </View>
      <Text style={styles.tileId} numberOfLines={2}>
        {pictogramId}
      </Text>
    </View>
  );
}

export default function PictogramTestScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState('en');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeftIcon />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Pictogram Test</Text>
          <Text style={styles.subtitle}>Hardcoded IDs · language: {lang}</Text>
        </View>
      </View>

      {/* Language picker — tap to switch and watch the images change */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.langRow}
      >
        {LANGUAGES.map((l) => {
          const selected = l.code === lang;
          return (
            <TouchableOpacity
              key={l.code}
              onPress={() => setLang(l.code)}
              style={[styles.langChip, selected && styles.langChipSelected]}
              activeOpacity={0.8}
            >
              <Text style={[styles.langChipText, selected && styles.langChipTextSelected]}>
                {l.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* The grid of pictograms */}
      <ScrollView contentContainerStyle={[styles.grid, { paddingBottom: 40 + insets.bottom }]}>
        {TEST_PICTOGRAM_IDS.map((id) => (
          <PictogramTile key={`${id}-${lang}`} pictogramId={id} lang={lang} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.dark, fontFamily: 'Georgia' },
  subtitle: { fontSize: 15, color: 'rgba(27,48,34,0.55)', marginTop: 2 },
  langRow: { paddingHorizontal: 24, paddingVertical: 8, gap: 8 },
  langChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
  },
  langChipSelected: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  langChipText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  langChipTextSelected: { color: 'white' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  tile: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    shadowColor: COLORS.dark,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  missingBox: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  missingText: { textAlign: 'center', color: 'rgba(27,48,34,0.45)', fontSize: 13, fontWeight: '700' },
  tileId: { marginTop: 10, fontSize: 12, color: COLORS.dark, textAlign: 'center' },
});
