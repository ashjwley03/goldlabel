import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './utils/supabase';

// Use your local IP for physical device testing
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.88.9:4000';

// Typescript interface matching your specific JSON schema
interface PictogramOption {
  pictogram_id: string;
  label: string;
}

interface CategoryData {
  suggested_options: PictogramOption[];
  selected_pictogram_id: string | null;
}

interface MedicationData {
  raw_text: string;
  medication_name: string;
  pictogram_categories: {
    time_of_day: CategoryData;
    dosage: CategoryData;
    special_instructions: CategoryData;
  };
}

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [medData, setMedData] = useState<MedicationData | null>(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to scan labels.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setMedData(null); // Clear previous results
      await processMedicationLabel(uri);
    }
  };

  const processMedicationLabel = async (uri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      // 1. Send to your Node.js backend
      const response = await fetch(`${BACKEND_URL}/api/ocr/extract`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const structuredJson: MedicationData = await response.json();

      if (!response.ok) {
        throw new Error('Backend processing failed');
      }

      // 2. Update local state to show info to user
      setMedData(structuredJson);

      // 3. Automatically save the structured training data to Supabase
      await saveToSupabase(structuredJson);

    } catch (err) {
      console.error('Processing failed:', err);
      Alert.alert('Error', 'Could not process the label. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveToSupabase = async (data: MedicationData) => {
    try {
      const { error } = await supabase
        .from('Labels') // Ensure your table name is correct
        .insert([data]); // Insert the exact object matching your schema

      if (error) throw error;
      console.log('Successfully saved to Supabase');
    } catch (err) {
      console.error('Supabase Error:', err);
      Alert.alert('Database Error', 'The scan was processed but could not be saved.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.title}>GoldLabel</Text>
      <Text style={styles.subtitle}>Medication Assistant for Seniors</Text>

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={takePhoto} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Processing...' : '📷 Scan Label'}</Text>
      </TouchableOpacity>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
      )}

      {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}

      {medData && !loading && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Medication Name</Text>
          <Text style={styles.medName}>{medData.medication_name}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.resultLabel}>Detected Schedule</Text>
          <Text style={styles.resultText}>
            🕒 Time: {medData.pictogram_categories.time_of_day.selected_pictogram_id || 'Not detected'}
          </Text>
          <Text style={styles.resultText}>
            💊 Dosage: {medData.pictogram_categories.dosage.selected_pictogram_id || 'Not detected'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
  },
  resultBox: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  medName: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#D1D5DB', marginVertical: 12 },
  resultText: { fontSize: 16, color: '#374151', marginBottom: 6 },
});