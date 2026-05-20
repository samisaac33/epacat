import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { getToken } from '../src/services/api';

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then((token) => {
      router.replace(token ? '/(tabs)/visitas' : '/login');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0369a1" />
        <Text style={styles.title}>EPACAT</Text>
        <Text style={styles.sub}>Catastro de campo — Manabí</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f9ff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0369a1', marginTop: 16 },
  sub: { color: '#64748b', marginTop: 4 },
});
