import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { GeminiResponse } from '../types';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:4000';

function SparklesIcon() {
  return (
    <Text style={{ fontSize: 56, textAlign: 'center' }}>✨</Text>
  );
}

export default function ProcessingScreen({ navigation, route }: any) {
  const { imageUri } = route.params || {};

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
      if (!imageUri) throw new Error('No image provided');

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${BACKEND_URL}/api/ocr/extract`, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Backend processing failed');
      }

      const data: GeminiResponse = await response.json();
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
