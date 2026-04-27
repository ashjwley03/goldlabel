import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Line } from 'react-native-svg';

function XIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6 6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

function ZapIcon({ active }: { active: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" stroke={active ? '#D37B5C' : 'rgba(255,255,255,0.8)'} fill={active ? '#D37B5C' : 'none'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ScannerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(-80)).current;
  const scanLineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanning) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scanLineOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
          Animated.delay(480),
          Animated.timing(scanLineOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
        ]),
        Animated.timing(scanLineAnim, { toValue: 80, duration: 800, useNativeDriver: true }),
      ]).start();
    } else {
      scanLineAnim.setValue(-80);
      scanLineOpacity.setValue(0);
    }
  }, [scanning]);

  const handleCapture = async () => {
    setScanning(true);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to scan labels.');
      setScanning(false);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    setScanning(false);
    if (!result.canceled && result.assets[0]) {
      navigation.navigate('Processing', { imageUri: result.assets[0].uri });
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery access is needed to pick a label image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      navigation.navigate('Processing', { imageUri: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      {/* Simulated camera background */}
      <View style={styles.cameraBg} />

      {/* Top controls */}
      <View style={[styles.topControls, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} activeOpacity={0.7}>
          <XIcon />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFlashEnabled(!flashEnabled)} style={styles.iconBtn} activeOpacity={0.7}>
          <ZapIcon active={flashEnabled} />
        </TouchableOpacity>
      </View>

      {/* Viewfinder */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.viewfinder}>
          {/* Dim overlays */}
          <View style={[styles.dimOverlay, styles.dimTop]} />
          <View style={[styles.dimOverlay, styles.dimBottom]} />
          <View style={[styles.dimOverlay, styles.dimLeft]} />
          <View style={[styles.dimOverlay, styles.dimRight]} />

          {/* Frame border */}
          <View style={styles.frameBorder}>
            {/* Corner accents */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          {/* Scan line */}
          {scanning && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineAnim }],
                  opacity: scanLineOpacity,
                },
              ]}
            />
          )}
        </View>

        <Text style={styles.instruction}>Align medicine label within frame</Text>
      </View>

      {/* Shutter button */}
      <View style={[styles.shutterContainer, { paddingBottom: 40 + insets.bottom }]}>
        <TouchableOpacity
          onPress={handleCapture}
          disabled={scanning}
          style={[styles.shutterOuter, scanning && styles.shutterDisabled]}
          activeOpacity={0.85}
        >
          <View style={[styles.shutterInner, { backgroundColor: scanning ? '#D37B5C' : '#1B3022' }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePickFromGallery} style={styles.galleryBtn} activeOpacity={0.7}>
          <Text style={styles.galleryBtnText}>Pick from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FRAME_W = 320;
const FRAME_H = 180;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  cameraBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0f0a',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  iconBtn: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: FRAME_W,
    height: FRAME_H,
    position: 'relative',
  },
  dimOverlay: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)' },
  dimTop: { left: -2000, right: -2000, top: -2000, bottom: FRAME_H },
  dimBottom: { left: -2000, right: -2000, top: FRAME_H, bottom: -2000 },
  dimLeft: { right: FRAME_W, left: -2000, top: 0, bottom: 0 },
  dimRight: { left: FRAME_W, right: -2000, top: 0, bottom: 0 },
  frameBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#D37B5C',
  },
  cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: '50%',
    height: 2,
    backgroundColor: 'rgba(211,123,92,0.8)',
    borderRadius: 1,
  },
  instruction: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    marginTop: 24,
    textAlign: 'center',
  },
  shutterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D37B5C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 6,
  },
  shutterDisabled: { opacity: 0.6 },
  shutterInner: { width: 56, height: 56, borderRadius: 28 },
  galleryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  galleryBtnText: {
    color: 'white',
    fontSize: 15,
  },
});
