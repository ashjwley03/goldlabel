import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { GeminiResponse } from '../types';

const VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY || '';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const MEDICATION_SCHEMA = {
  type: 'object',
  required: ['raw_text', 'medication_name', 'pictogram_categories'],
  properties: {
    raw_text: { type: 'string' },
    medication_name: { type: 'string' },
    pictogram_categories: {
      type: 'object',
      required: ['time_of_day', 'dosage', 'special_instructions'],
      properties: {
        time_of_day: {
          type: 'object',
          required: ['suggested_options', 'selected_pictogram_id'],
          properties: {
            suggested_options: { type: 'array', items: { type: 'object', required: ['pictogram_id', 'label'], properties: { pictogram_id: { type: 'string' }, label: { type: 'string' } } } },
            selected_pictogram_id: { type: ['string', 'null'] },
          },
        },
        dosage: {
          type: 'object',
          required: ['suggested_options', 'selected_pictogram_id'],
          properties: {
            suggested_options: { type: 'array', items: { type: 'object', required: ['pictogram_id', 'label'], properties: { pictogram_id: { type: 'string' }, label: { type: 'string' } } } },
            selected_pictogram_id: { type: ['string', 'null'] },
          },
        },
        special_instructions: {
          type: 'object',
          required: ['suggested_options', 'selected_pictogram_id'],
          properties: {
            suggested_options: { type: 'array', items: { type: 'object', required: ['pictogram_id', 'label'], properties: { pictogram_id: { type: 'string' }, label: { type: 'string' } } } },
            selected_pictogram_id: { type: ['string', 'null'] },
          },
        },
      },
    },
  },
};

function SparklesIcon() {
  return (
    <Text style={{ fontSize: 56, textAlign: 'center' }}>✨</Text>
  );
}

export default function ProcessingScreen({ navigation, route }: any) {
  const { imageUri, imageBase64 } = route.params || {};

  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const innerScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const dot0 = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(1)).current;
  const dot2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(innerScale, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
          Animated.timing(innerScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(textOpacity, { toValue: 0.75, duration: 1000, useNativeDriver: true }),
          Animated.timing(textOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();

    const makeDotAnim = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim, { toValue: 1.6, duration: 667, useNativeDriver: true }),
              Animated.timing(anim, { toValue: 1, duration: 667, useNativeDriver: true }),
            ]),
          ]),
        ])
      );

    const dotAnims = Animated.parallel([
      makeDotAnim(dot0, 0),
      makeDotAnim(dot1, 300),
      makeDotAnim(dot2, 600),
    ]);
    dotAnims.start();

    processImage();

    return () => {
      pulse.stop();
      dotAnims.stop();
    };
  }, []);

  const processImage = async () => {
    try {
      if (!imageBase64) throw new Error('No image provided');

      // 1. Call Google Vision API for OCR
      const visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: imageBase64 },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            }],
          }),
        }
      );

      const visionJson = await visionResponse.json();
      if (!visionResponse.ok || visionJson.error) {
        throw new Error(visionJson.error?.message || 'Vision API request failed.');
      }

      const extractedText: string = visionJson.responses?.[0]?.fullTextAnnotation?.text || '';
      if (!extractedText) throw new Error('Could not detect any text in the image.');

      // 3. Call Gemini API to parse text into structured data
      const prompt = `Extract medication information from the following OCR text.
Return the data strictly following this JSON schema: ${JSON.stringify(MEDICATION_SCHEMA)}

Instructions:
1. The 'raw_text' field MUST be the exact text provided below.
2. For 'suggested_options', provide 2-3 logical options based on the text.
3. Set 'selected_pictogram_id' to the best match from the suggested options.
4. Ensure 'pictogram_id' is a slug-style string (e.g., 'morning-1', '2-pills').

OCR Text: "${extractedText}"`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      const geminiJson = await geminiResponse.json();
      if (!geminiResponse.ok || geminiJson.error) {
        throw new Error(geminiJson.error?.message || 'Gemini API request failed.');
      }

      const textContent = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) throw new Error('No response from Gemini API.');

      const data: GeminiResponse = JSON.parse(textContent);
      navigation.replace('ConfirmInformation', { medicationData: data });
    } catch (err: any) {
      Alert.alert(
        'Processing Failed',
        err.message || 'Could not read the label. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerCircle,
          { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
        ]}
      >
        <Animated.View style={[styles.innerCircle, { transform: [{ scale: innerScale }] }]}>
          <SparklesIcon />
        </Animated.View>
      </Animated.View>

      <Animated.Text style={[styles.heading, { opacity: textOpacity }]}>Scanning…</Animated.Text>
      <Text style={styles.subtext}>Reading your medicine label</Text>
      <Text style={styles.subtext2}>Take a moment to relax</Text>

      <View style={styles.dots}>
        {[dot0, dot1, dot2].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ scale: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2ED',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  outerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(27,48,34,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  innerCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#1B3022',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heading: {
    fontSize: 44,
    fontWeight: '700',
    color: '#1B3022',
    fontFamily: 'Georgia',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 20,
    color: 'rgba(27,48,34,0.7)',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext2: {
    fontSize: 18,
    color: 'rgba(27,48,34,0.5)',
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 48,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1B3022',
    opacity: 0.4,
  },
});
