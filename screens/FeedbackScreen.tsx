import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

type EmojiRating = 'bad' | 'neutral' | 'good' | null;
type PictoAnswer = 'yes' | 'no' | 'some' | null;

const EMOJI_OPTIONS: { id: EmojiRating; emoji: string; label: string }[] = [
  { id: 'bad', emoji: '😞', label: 'Not helpful' },
  { id: 'neutral', emoji: '😐', label: 'Okay' },
  { id: 'good', emoji: '😊', label: 'Helpful!' },
];

const PICTO_OPTIONS: { id: PictoAnswer; label: string }[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'some', label: 'Some of them' },
  { id: 'no', label: 'No' },
];

function ArrowLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="m19 12H5M5 12l7 7M5 12l7-7" stroke="#1B3022" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function FeedbackScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [emojiRating, setEmojiRating] = useState<EmojiRating>(null);
  const [pictoAnswer, setPictoAnswer] = useState<PictoAnswer>(null);
  const [pictoComment, setPictoComment] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigation.navigate('Dashboard'), 1500);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', gap: 16 }]}>
        <Text style={{ fontSize: 64 }}>🙏</Text>
        <Text style={styles.thankYouTitle}>Thank you!</Text>
        <Text style={styles.thankYouSub}>Your feedback helps us improve labels for everyone.</Text>
      </View>
    );
  }

  const showPictoText = pictoAnswer === 'no' || pictoAnswer === 'some';
  const canSubmit = emojiRating !== null && pictoAnswer !== null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeftIcon />
            </TouchableOpacity>
            <Text style={styles.title}>Was this helpful?</Text>
          </View>
          <Text style={styles.subtitle}>Your feedback improves labels for all users</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 160 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Label satisfaction</Text>
            <Text style={styles.sectionSub}>How useful was the printed label?</Text>
            <View style={styles.emojiRow}>
              {EMOJI_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setEmojiRating(opt.id)}
                  style={[styles.emojiBtn, emojiRating === opt.id && styles.emojiBtnActive]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emoji}>{opt.emoji}</Text>
                  <Text style={[styles.emojiLabel, emojiRating === opt.id && styles.emojiLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pictogram feedback */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pictogram feedback</Text>
            <Text style={styles.sectionSub}>Were the pictograms appropriate?</Text>
            <View style={styles.pictoRow}>
              {PICTO_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setPictoAnswer(opt.id)}
                  style={[styles.pictoBtn, pictoAnswer === opt.id && styles.pictoBtnActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pictoBtnText, pictoAnswer === opt.id && styles.pictoBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {showPictoText && (
              <TextInput
                value={pictoComment}
                onChangeText={setPictoComment}
                placeholder="Which pictograms were off? (optional)"
                placeholderTextColor="rgba(27,48,34,0.35)"
                multiline
                numberOfLines={3}
                style={styles.textarea}
              />
            )}
          </View>

          {/* General comments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General comments</Text>
            <Text style={styles.sectionSub}>Anything else you'd like us to know? (optional)</Text>
            <TextInput
              value={generalComment}
              onChangeText={setGeneralComment}
              placeholder="Your thoughts…"
              placeholderTextColor="rgba(27,48,34,0.35)"
              multiline
              numberOfLines={4}
              style={styles.textarea}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
          <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]} activeOpacity={canSubmit ? 0.85 : 1} disabled={!canSubmit}>
            <Text style={styles.submitText}>Submit Feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', flex: 1 },
  subtitle: { fontSize: 15, color: 'rgba(27,48,34,0.55)', marginLeft: 60 },
  scroll: { flex: 1, paddingHorizontal: 24 },
  section: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 18, padding: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: 'rgba(27,48,34,0.5)', marginBottom: 16 },
  emojiRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  emojiBtn: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 8, borderRadius: 16, backgroundColor: '#F5F2ED' },
  emojiBtnActive: { backgroundColor: '#1B3022' },
  emoji: { fontSize: 36 },
  emojiLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(27,48,34,0.55)', textAlign: 'center', lineHeight: 14 },
  emojiLabelActive: { color: 'white' },
  pictoRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  pictoBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F5F2ED', alignItems: 'center' },
  pictoBtnActive: { backgroundColor: '#1B3022' },
  pictoBtnText: { fontSize: 14, fontWeight: '600', color: 'rgba(27,48,34,0.7)' },
  pictoBtnTextActive: { color: 'white' },
  textarea: {
    backgroundColor: '#F5F2ED',
    borderWidth: 2,
    borderColor: 'rgba(27,48,34,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1B3022',
    textAlignVertical: 'top',
    marginTop: 8,
  },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 12, gap: 12 },
  submitBtn: { backgroundColor: '#1B3022', borderRadius: 999, paddingVertical: 20, alignItems: 'center', minHeight: 64 },
  submitBtnDisabled: { backgroundColor: 'rgba(27,48,34,0.3)' },
  submitText: { color: 'white', fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipText: { fontSize: 15, color: 'rgba(27,48,34,0.5)', fontWeight: '500' },
  thankYouTitle: { fontSize: 32, fontWeight: '700', color: '#1B3022', fontFamily: 'Georgia', textAlign: 'center' },
  thankYouSub: { fontSize: 18, color: 'rgba(27,48,34,0.55)', textAlign: 'center', paddingHorizontal: 24 },
});
