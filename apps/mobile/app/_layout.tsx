import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { getDb } from '../src/db/database';

export default function RootLayout() {
  useEffect(() => {
    getDb();
  }, []);

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#0369a1' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="index" options={{ title: 'EPACAT' }} />
      <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="visita/nueva" options={{ title: 'Nueva visita' }} />
    </Stack>
  );
}
