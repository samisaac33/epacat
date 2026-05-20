import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { dao } from '../../src/db/dao';

export default function VisitasScreen() {
  const [visitas, setVisitas] = useState<
    Array<{ client_id: string; lat: number; lng: number; synced: number; observaciones: string | null }>
  >([]);

  useFocusEffect(
    useCallback(() => {
      setVisitas(dao.getPendingVisitas());
    }, []),
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/visita/nueva')}>
        <Text style={styles.fabText}>+ Nueva visita</Text>
      </TouchableOpacity>
      <FlatList
        data={visitas}
        keyExtractor={(item) => item.client_id}
        ListEmptyComponent={<Text style={styles.empty}>No hay visitas registradas</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.synced ? '✓ Sincronizada' : '○ Pendiente sync'}
            </Text>
            <Text>
              GPS: {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
            </Text>
            {item.observaciones && <Text style={styles.obs}>{item.observaciones}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  fab: {
    backgroundColor: '#0369a1',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  fabText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: { fontWeight: '600', marginBottom: 4 },
  obs: { color: '#64748b', marginTop: 4, fontSize: 13 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
});
