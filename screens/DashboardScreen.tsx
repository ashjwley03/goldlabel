import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LabelRecord } from '../types';
import { supabase } from '../utils/supabase';
import { format, formatDistanceToNow, isToday, isThisWeek } from 'date-fns';
import Svg, { Circle, Path } from 'react-native-svg';

type TabId = 'today' | 'week' | 'all';
const TABS: { id: TabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'all', label: 'All' },
];

function filterLabels(labels: LabelRecord[], tab: TabId) {
  if (tab === 'today') return labels.filter((l) => isToday(new Date(l.created_at)));
  if (tab === 'week') return labels.filter((l) => isThisWeek(new Date(l.created_at), { weekStartsOn: 1 }));
  return labels;
}

function LabelThumbnail() {
  return (
    <View style={styles.thumbnail}>
      <View style={styles.thumbnailGrid}>
        <View style={[styles.thumbCell, { backgroundColor: '#FDB462' }]} />
        <View style={[styles.thumbCell, { backgroundColor: '#D37B5C' }]} />
        <View style={[styles.thumbCell, { backgroundColor: '#6B7FD7' }]} />
        <View style={[styles.thumbCell, { backgroundColor: '#A5D6A7' }]} />
      </View>
    </View>
  );
}

function CameraIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="rgba(27,48,34,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke="rgba(27,48,34,0.25)" strokeWidth="1.5" />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.28a16 16 0 0 0 5.82 5.82l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#1B3022" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MailIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#1B3022" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m22 6-10 7L2 6" stroke="#1B3022" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ScanCameraIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2.5" />
    </Svg>
  );
}

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabId>('all');
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

  const filteredLabels = filterLabels(labels, activeTab);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>GoldLabel</Text>
        <Text style={styles.subtitle}>Your scan history</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scan list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 160 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#1B3022" />
          </View>
        ) : filteredLabels.length === 0 ? (
          <View style={styles.emptyState}>
            <CameraIcon />
            <Text style={styles.emptyTitle}>
              {activeTab === 'today' ? 'No scans today' : activeTab === 'week' ? 'No scans this week' : 'No scans yet'}
            </Text>
            <Text style={styles.emptySubtitle}>Tap "Scan Label" below to get started</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredLabels.map((label) => {
              const date = new Date(label.created_at);
              return (
                <TouchableOpacity
                  key={label.id}
                  onPress={() => navigation.navigate('PictographView', { label })}
                  style={styles.card}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardRow}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardMedName}>{label.medication_name}</Text>
                      <Text style={styles.cardTime}>{format(date, 'h:mm a')}</Text>
                      <Text style={styles.cardDate}>{format(date, 'MMMM d, yyyy')}</Text>
                      <Text style={styles.cardRelative}>{formatDistanceToNow(date, { addSuffix: true })}</Text>
                    </View>
                    <LabelThumbnail />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Contact section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactHeading}>Need Help?</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:18002220222')}
            style={styles.contactRow}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, styles.contactIconWrapper]}><PhoneIcon /></View>
            <View>
              <Text style={styles.contactLabel}>Hotline</Text>
              <Text style={styles.contactValue}>1800-222-0222</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:help@goldlabel.sg')}
            style={styles.contactRow}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, styles.contactIconWrapper]}><MailIcon /></View>
            <View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>help@goldlabel.sg</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Scanner')}
          style={styles.ctaButton}
          activeOpacity={0.85}
        >
          <View style={styles.ctaIconWrapper}><ScanCameraIcon /></View>
          <Text style={styles.ctaText}>Scan Label</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 36, fontWeight: '800', color: '#1B3022', fontFamily: 'Georgia', lineHeight: 44 },
  subtitle: { fontSize: 18, color: 'rgba(27,48,34,0.6)', marginTop: 2 },
  tabBarWrapper: { paddingHorizontal: 24, paddingBottom: 16 },
  tabBar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 16, padding: 4 },
  tab: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#1B3022', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 15, fontWeight: '600', color: 'rgba(27,48,34,0.55)' },
  tabTextActive: { color: 'white' },
  scrollView: { flex: 1, paddingHorizontal: 24 },
  emptyState: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 24, padding: 48, alignItems: 'center', marginTop: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: 'rgba(27,48,34,0.5)', fontFamily: 'Georgia', marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 17, color: 'rgba(27,48,34,0.4)', textAlign: 'center' },
  list: { paddingTop: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 20, marginBottom: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  cardInfo: { flex: 1, marginRight: 16 },
  cardMedName: { fontSize: 20, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', marginBottom: 4 },
  cardTime: { fontSize: 26, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', lineHeight: 32 },
  cardDate: { fontSize: 15, color: 'rgba(27,48,34,0.75)', marginTop: 2 },
  cardRelative: { fontSize: 13, color: 'rgba(27,48,34,0.45)', marginTop: 2 },
  thumbnail: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 16, borderWidth: 3, borderColor: 'rgba(27,48,34,0.15)', alignItems: 'center', justifyContent: 'center' },
  thumbnailGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 62, height: 62 },
  thumbCell: { width: 26, height: 26, borderRadius: 6, marginRight: 3, marginBottom: 3 },
  contactSection: { marginTop: 32, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 20, padding: 20 },
  contactHeading: { fontSize: 11, fontWeight: '700', color: 'rgba(27,48,34,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contactIconWrapper: { marginRight: 12 },
  contactIcon: { width: 36, height: 36, backgroundColor: 'rgba(27,48,34,0.08)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 13, color: 'rgba(27,48,34,0.5)' },
  contactValue: { fontSize: 16, fontWeight: '600', color: '#1B3022' },
  divider: { height: 1, backgroundColor: 'rgba(27,48,34,0.08)', marginVertical: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, backgroundColor: 'transparent' },
  ctaButton: { backgroundColor: '#1B3022', borderRadius: 999, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 64 },
  ctaIconWrapper: { marginRight: 20 },
  ctaText: { color: 'white', fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
});
