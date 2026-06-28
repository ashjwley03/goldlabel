import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import DashboardScreen from './screens/DashboardScreen';
import ScannerScreen from './screens/ScannerScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import ConfirmInformationScreen from './screens/ConfirmInformationScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import ConfigureLabelScreen from './screens/ConfigureLabelScreen';
import PrintPreviewScreen from './screens/PrintPreviewScreen';
import PictographViewScreen from './screens/PictographViewScreen';
import HistoryScreen from './screens/HistoryScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import ResultScreen from './screens/ResultScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Processing" component={ProcessingScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="ConfirmInformation" component={ConfirmInformationScreen} />
          <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
          <Stack.Screen name="ConfigureLabel" component={ConfigureLabelScreen} />
          <Stack.Screen name="PrintPreview" component={PrintPreviewScreen} />
          <Stack.Screen name="PictographView" component={PictographViewScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />
          <Stack.Screen name="ResultScreen" component={ResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
