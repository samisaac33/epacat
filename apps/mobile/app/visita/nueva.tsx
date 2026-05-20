import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {
  abonadoInputSchema,
  medidorInputSchema,
  visitaCampoInputSchema,
  lecturaInputSchema,
} from '@epacat/shared';
import { dao } from '../../src/db/dao';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function NuevaVisitaScreen() {
  const abonadoClientId = useState(() => uuid())[0];
  const medidorClientId = useState(() => uuid())[0];
  const visitaClientId = useState(() => uuid())[0];
  const lecturaClientId = useState(() => uuid())[0];
  const fotoLocalId = useState(() => uuid())[0];

  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [sector, setSector] = useState('Tarqui');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [marca, setMarca] = useState('Sensus');
  const [valorLectura, setValorLectura] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function captureGps() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita GPS para registrar la visita');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLat(loc.coords.latitude);
    setLng(loc.coords.longitude);
    Alert.alert('GPS capturado', `${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
  }

  async function takePhoto() {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
    }
  }

  async function saveVisita() {
    if (lat === null || lng === null) {
      Alert.alert('GPS requerido', 'Capture la ubicación antes de guardar');
      return;
    }
    setLoading(true);
    try {
      const abonado = abonadoInputSchema.parse({
        clientId: abonadoClientId,
        cedula,
        nombre,
        direccion,
        sector,
      });
      const medidor = medidorInputSchema.parse({
        clientId: medidorClientId,
        abonadoClientId,
        numeroSerie,
        marca,
      });
      const visita = visitaCampoInputSchema.parse({
        clientId: visitaClientId,
        abonadoClientId,
        medidorClientId,
        lat,
        lng,
        observaciones: observaciones || undefined,
      });
      const lectura = lecturaInputSchema.parse({
        clientId: lecturaClientId,
        medidorClientId,
        valor: parseFloat(valorLectura),
        fecha: new Date().toISOString(),
        fotoLocalId: fotoUri ? fotoLocalId : undefined,
      });

      dao.saveAbonado({ ...abonado, telefono: undefined });
      dao.saveMedidor(medidor);
      dao.saveVisita(visita);
      dao.saveLectura({ ...lectura, visitaClientId });

      if (fotoUri) {
        dao.saveFoto({
          localPhotoId: fotoLocalId,
          visitaClientId,
          uri: fotoUri,
          tipo: 'MEDIDOR',
        });
      }

      dao.enqueueOp({
        opId: uuid(),
        entity: 'ABONADO',
        opType: 'CREATE',
        clientEntityId: abonadoClientId,
        payload: abonado,
      });
      dao.enqueueOp({
        opId: uuid(),
        entity: 'MEDIDOR',
        opType: 'CREATE',
        clientEntityId: medidorClientId,
        payload: medidor,
      });
      dao.enqueueOp({
        opId: uuid(),
        entity: 'VISITA',
        opType: 'CREATE',
        clientEntityId: visitaClientId,
        payload: visita,
      });
      dao.enqueueOp({
        opId: uuid(),
        entity: 'LECTURA',
        opType: 'CREATE',
        clientEntityId: lecturaClientId,
        payload: lectura,
      });

      Alert.alert('Guardado', 'Visita guardada localmente. Sincronice cuando tenga conexión.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error de validación', err instanceof Error ? err.message : 'Datos inválidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.section}>Abonado</Text>
      <TextInput style={styles.input} placeholder="Cédula" value={cedula} onChangeText={setCedula} />
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />
      <TextInput style={styles.input} placeholder="Sector" value={sector} onChangeText={setSector} />

      <Text style={styles.section}>Medidor</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de serie"
        value={numeroSerie}
        onChangeText={setNumeroSerie}
      />
      <TextInput style={styles.input} placeholder="Marca" value={marca} onChangeText={setMarca} />

      <Text style={styles.section}>Lectura</Text>
      <TextInput
        style={styles.input}
        placeholder="Valor lectura"
        value={valorLectura}
        onChangeText={setValorLectura}
        keyboardType="decimal-pad"
      />

      <Text style={styles.section}>Ubicación y evidencia</Text>
      <TouchableOpacity style={styles.btnSecondary} onPress={captureGps}>
        <Text style={styles.btnSecondaryText}>
          {lat !== null ? `GPS: ${lat.toFixed(5)}, ${lng?.toFixed(5)}` : 'Capturar GPS'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={takePhoto}>
        <Text style={styles.btnSecondaryText}>{fotoUri ? 'Foto capturada ✓' : 'Tomar foto medidor'}</Text>
      </TouchableOpacity>
      {fotoUri && <Image source={{ uri: fotoUri }} style={styles.preview} />}

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Observaciones"
        value={observaciones}
        onChangeText={setObservaciones}
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={saveVisita} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Guardando...' : 'Guardar visita (offline)'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  section: { fontWeight: '700', color: '#0369a1', marginTop: 12, marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  btn: { backgroundColor: '#0369a1', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
  btnSecondary: {
    backgroundColor: '#e0f2fe',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnSecondaryText: { color: '#0369a1', fontWeight: '500' },
  preview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
});
