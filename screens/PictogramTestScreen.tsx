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

// One row from pictogram_assets, scoped to whichever language is selected.
type PictogramRow = {
  pictogram_id: string;
  variant_id: string;
  category_key: string;
  asset_path: string;
  label: string;
};

// Fetches EVERY pictogram for a given language in a single query, instead of
// one request per tile. Returns rows already grouped by category_key.
async function fetchAllPictograms(lang: string): Promise<Record<string, PictogramRow[]>> {
  const { data, error } = await supabase
    .from('pictogram_assets')
    .select('pictogram_id, variant_id, category_key, asset_path, label')
    .eq('language_code', lang)
    .eq('is_default', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return {};

  const grouped: Record<string, PictogramRow[]> = {};
  for (const row of data as PictogramRow[]) {
    if (!grouped[row.category_key]) grouped[row.category_key] = [];
    grouped[row.category_key].push(row);
  }
  return grouped;
}

function getPublicUrl(assetPath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(assetPath);
  return data?.publicUrl ?? '';
}

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

function PictogramTile({ row }: { row: PictogramRow }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const uri = getPublicUrl(row.asset_path);
  // Debug: log path and resolved URI to help diagnose runtime issues
  // (visible in Expo logs / Metro console)
  useEffect(() => {
    console.log('Pictogram asset_path ->', row.asset_path, 'publicUri ->', uri);
  }, [row.asset_path, uri]);

  return (
    <View style={styles.tile}>
      <View style={styles.imageBox}>
        {status === 'loading' && <ActivityIndicator style={StyleSheet.absoluteFill} color={COLORS.dark} />}
        {status === 'error' && (
          <View style={styles.missingBox}>
            <Text style={styles.missingText}>image{'\n'}missing</Text>
          </View>
        )}
        <Image
          key={uri}
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          onLoad={() => setStatus('ok')}
          onError={(e) => {
            console.log('Image load error for', uri, e?.nativeEvent || e);
            setStatus('error');
          }}
        />
      </View>
      <Text style={styles.tileId} numberOfLines={2}>
        {row.pictogram_id}
        {row.variant_id !== 'v0' ? ` (${row.variant_id})` : ''}
      </Text>
    </View>
  );
}

function CategorySection({ categoryKey, rows }: { categoryKey: string; rows: PictogramRow[] }) {
  const displayName = categoryKey.replace(/_/g, ' ');
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>
        {displayName} <Text style={styles.sectionCount}>({rows.length})</Text>
      </Text>
      <View style={styles.grid}>
        {rows.map((row) => (
          <PictogramTile key={`${row.pictogram_id}-${row.variant_id}`} row={row} />
        ))}
      </View>
    </View>
  );
}

export default function PictogramTestScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState('ml');
  const [grouped, setGrouped] = useState<Record<string, PictogramRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAllPictograms(lang).then((result) => {
      if (!cancelled) {
        setGrouped(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const totalCount = Object.values(grouped).reduce((sum, rows) => sum + rows.length, 0);
  const categories = Object.keys(grouped).sort();

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
          <Text style={styles.subtitle}>
            {loading ? 'Loading…' : `${totalCount} pictograms`} · language: {lang}
          </Text>
        </View>
      </View>

      {/* Language picker — tap to switch and watch the images change */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.langRowOuter}
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

      {/* Every pictogram for the selected language, grouped by category */}
      <ScrollView contentContainerStyle={[styles.scrollBody, { paddingBottom: 40 + insets.bottom }]}>
        {loading && <ActivityIndicator color={COLORS.dark} style={{ marginTop: 40 }} />}
        {!loading && totalCount === 0 && (
          <Text style={styles.emptyText}>No pictograms found for this language yet.</Text>
        )}
        {!loading &&
          categories.map((categoryKey) => (
            <CategorySection key={categoryKey} categoryKey={categoryKey} rows={grouped[categoryKey]} />
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
  langRowOuter: { flexGrow: 0, height: 60 },
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
  scrollBody: { paddingHorizontal: 24, paddingTop: 8 },
  emptyText: { textAlign: 'center', color: 'rgba(27,48,34,0.55)', marginTop: 40, fontSize: 15 },
  section: { marginTop: 20 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    fontFamily: 'Georgia',
    textTransform: 'capitalize',
    marginBottom: 12,
  },
  sectionCount: { fontWeight: '400', color: 'rgba(27,48,34,0.5)', fontSize: 14 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  tile: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
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