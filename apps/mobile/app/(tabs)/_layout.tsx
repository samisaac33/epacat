import { Tabs } from 'expo-router';
import { useNetworkAutoSync } from '../../src/hooks/useNetwork';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    return NetInfo.addEventListener((s) => setOnline(s.isConnected ?? false)).unsubscribe;
  }, []);
  if (online) return null;
  return (
    <View style={bannerStyles.bar}>
      <Text style={bannerStyles.text}>Modo offline — los datos se guardan localmente</Text>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  bar: { backgroundColor: '#f59e0b', padding: 6, alignItems: 'center' },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' },
});

export default function TabsLayout() {
  useNetworkAutoSync(true);
  return (
  <>
    <OfflineBanner />
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0369a1' }}>
      <Tabs.Screen name="visitas" options={{ title: 'Visitas' }} />
      <Tabs.Screen name="sync" options={{ title: 'Sincronizar' }} />
    </Tabs>
  </>
  );
}
