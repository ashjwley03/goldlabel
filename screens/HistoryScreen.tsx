import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { supabase } from '../utils/supabase';
import { LabelRecord } from '../types';
import { format, formatDistanceToNow } from 'date-fns';

function ArrowLeftIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path d="m19 12H5M5 12l7 7M5 12l7-7" stroke="#1B3022" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6 9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={96} height={96} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="rgba(27,48,34,0.3)" strokeWidth="2" />
      <Path d="M12 6v6l4 2" stroke="rgba(27,48,34,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LabelThumbnail() {
  return (
    <View style={styles.thumbnail}>
      <View style={styles.thumbnailGrid}>
        <View style={[styles.thumbCell, { backgroundColor: '#FFEB3B' }]} />
        <View style={[styles.thumbCell, { backgroundColor: '#D37B5C' }]} />
        <View style={[styles.thumbCell, { backgroundColor: '#6B7FD7' }]} />
        <View style={[styles.thumbCell, { backgroundColor: '#A5D6A7' }]} />
      </View>
    </View>
  );
}

export default function HistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [labels, setLabels] = useState<LabelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchLabels();
    }, [])
  );

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Labels')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLabels(data || []);
    } catch {
      setLabels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeftIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Your Timeline</Text>
        </View>
        <Text style={styles.subtitle}>
          {labels.length} scanned medication{labels.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color="#1B3022" />
          </View>
        ) : labels.length === 0 ? (
          <View style={styles.empty}>
            <ClockIcon />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptySubtitle}>Scanned medications will appear here</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            <View style={styles.timelineLine} />
            {labels.map((label) => {
              const date = new Date(label.created_at);
              return (
                <View key={label.id} style={styles.timelineItem}>
                  <View style={styles.dot}>
                    <CheckIcon />
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('PictographView', { label })}
                    style={styles.card}
                    activeOpacity={0.75}
                  >
                    <View style={styles.cardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardMedName}>{label.medication_name}</Text>
                        <Text style={styles.cardTime}>{format(date, 'h:mm a')}</Text>
                        <Text style={styles.cardDate}>{format(date, 'MMMM d, yyyy')}</Text>
                        <Text style={styles.cardRelative}>{formatDistanceToNow(date, { addSuffix: true })}</Text>
                      </View>
                      <LabelThumbnail />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Scanner')} style={styles.ctaBtn} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Scan New Medication</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: { paddingHorizontal: 32, paddingTop: 10, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 8 },
  backBtn: { width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia' },
  subtitle: { fontSize: 20, color: 'rgba(27,48,34,0.6)', marginLeft: 84 },
  content: { paddingHorizontal: 32, paddingTop: 8 },
  empty: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 32, padding: 64, alignItems: 'center' },
  emptyTitle: { fontSize: 28, fontWeight: '700', color: 'rgba(27,48,34,0.6)', fontFamily: 'Georgia', marginTop: 24, marginBottom: 16 },
  emptySubtitle: { fontSize: 20, color: 'rgba(27,48,34,0.5)', textAlign: 'center' },
  timeline: { position: 'relative', gap: 24 },
  timelineLine: { position: 'absolute', left: 23, top: 48, bottom: 48, width: 4, backgroundColor: 'rgba(27,48,34,0.2)', borderRadius: 2 },
  timelineItem: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  dot: { width: 48, height: 48, backgroundColor: '#1B3022', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 32, flexShrink: 0, zIndex: 1 },
  card: { flex: 1, backgroundColor: 'white', borderRadius: 28, padding: 32, shadowColor: '#1B3022', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  cardMedName: { fontSize: 22, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', marginBottom: 8 },
  cardTime: { fontSize: 28, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', lineHeight: 34, marginBottom: 4 },
  cardDate: { fontSize: 18, color: 'rgba(27,48,34,0.8)', marginBottom: 4 },
  cardRelative: { fontSize: 15, color: 'rgba(27,48,34,0.5)' },
  thumbnail: { width: 112, height: 112, backgroundColor: 'white', borderRadius: 16, borderWidth: 3, borderColor: 'rgba(27,48,34,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  thumbnailGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 6, width: 88, height: 88 },
  thumbCell: { width: 36, height: 36, borderRadius: 8, marginRight: 4, marginBottom: 4 },
  footer: { paddingHorizontal: 32, paddingTop: 16 },
  ctaBtn: { backgroundColor: '#1B3022', borderRadius: 28, paddingVertical: 28, alignItems: 'center', minHeight: 80, shadowColor: '#1B3022', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  ctaText: { color: 'white', fontSize: 28, fontWeight: '700', fontFamily: 'Georgia' },
});
