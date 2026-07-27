import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configurarCanalAndroid, garantirPermissao } from '../src/services/notificacoesService';

export default function RootLayout() {
  useEffect(() => {
    configurarCanalAndroid();
    garantirPermissao();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
