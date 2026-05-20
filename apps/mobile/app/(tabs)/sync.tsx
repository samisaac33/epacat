import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { dao } from '../../src/db/dao';
import { syncToServer } from '../../src/services/sync';

export default function SyncScreen() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const queue = dao.getSyncQueue();
  const photos = dao.getPendingPhotos();

  async function handleSync() {
    setLoading(true);
    try {
      const result = await syncToServer();
      setLastResult(
        `Aceptadas: ${result.accepted}, Rechazadas: ${result.rejected}, Conflictos: ${result.conflicts.length}`,
      );
      if (result.conflicts.length) {
        Alert.alert(
          'Conflictos',
          result.conflicts.map((c) => `${c.opId}: ${c.reason}`).join('\n'),
        );
      } else {
        Alert.alert('Éxito', 'Sincronización completada');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Falló la sincronización');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Estado de sincronización</Text>
      <View style={styles.stat}>
        <Text>Operaciones en cola: {queue.length}</Text>
        <Text>Fotos pendientes: {photos.length}</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={handleSync} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Sincronizando...' : 'Sincronizar ahora'}</Text>
      </TouchableOpacity>
      {lastResult && <Text style={styles.result}>{lastResult}</Text>}
      <Text style={styles.hint}>
        Las fotos se suben primero, luego el lote de operaciones. El mismo batch idempotente no
        duplica datos en el servidor.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0369a1', marginBottom: 16 },
  stat: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 16 },
  btn: { backgroundColor: '#0369a1', padding: 16, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  result: { marginTop: 16, color: '#166534', fontWeight: '500' },
  hint: { marginTop: 24, color: '#64748b', fontSize: 13, lineHeight: 20 },
});
