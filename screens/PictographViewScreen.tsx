import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function PictographViewScreen({ navigation, route }: any) {
  const { label } = route.params || {};

  useEffect(() => {
    if (label) {
      const cats = label.pictogram_categories || {};
      const { language = 'en', verification_status, ...restCats } = cats;

      // Extract active pictogram list
      const pictograms = Object.values(restCats).filter((v) => typeof v === 'string') as string[];

      navigation.replace('ResultScreen', {
        labelId: String(label.id),
        rawOcrText: label.raw_text,
        language,
        labelFormat: 'square', // default view format
        pictograms,
      });
    } else {
      navigation.replace('Dashboard');
    }
  }, [label]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F2ED' }}>
      <ActivityIndicator size="large" color="#1B3022" />
    </View>
  );
}
