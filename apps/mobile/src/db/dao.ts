import { getDb } from './database';

export const dao = {
  saveAbonado(data: {
    clientId: string;
    cedula: string;
    nombre: string;
    direccion: string;
    sector: string;
    telefono?: string;
  }) {
    const db = getDb();
    db.runSync(
      `INSERT OR REPLACE INTO abonados (client_id, cedula, nombre, direccion, sector, telefono, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [data.clientId, data.cedula, data.nombre, data.direccion, data.sector, data.telefono ?? null],
    );
  },

  saveMedidor(data: {
    clientId: string;
    abonadoClientId: string;
    numeroSerie: string;
    marca: string;
    ubicacion?: string;
  }) {
    const db = getDb();
    db.runSync(
      `INSERT OR REPLACE INTO medidores (client_id, abonado_client_id, numero_serie, marca, ubicacion, synced)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [data.clientId, data.abonadoClientId, data.numeroSerie, data.marca, data.ubicacion ?? null],
    );
  },

  saveVisita(data: {
    clientId: string;
    abonadoClientId?: string;
    medidorClientId?: string;
    lat: number;
    lng: number;
    observaciones?: string;
  }) {
    const db = getDb();
    db.runSync(
      `INSERT OR REPLACE INTO visitas (client_id, abonado_client_id, medidor_client_id, lat, lng, observaciones, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        data.clientId,
        data.abonadoClientId ?? null,
        data.medidorClientId ?? null,
        data.lat,
        data.lng,
        data.observaciones ?? null,
      ],
    );
  },

  saveLectura(data: {
    clientId: string;
    medidorClientId: string;
    visitaClientId?: string;
    valor: number;
    fecha: string;
    fotoLocalId?: string;
  }) {
    const db = getDb();
    db.runSync(
      `INSERT OR REPLACE INTO lecturas (client_id, medidor_client_id, visita_client_id, valor, fecha, foto_local_id, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        data.clientId,
        data.medidorClientId,
        data.visitaClientId ?? null,
        data.valor,
        data.fecha,
        data.fotoLocalId ?? null,
      ],
    );
  },

  saveFoto(data: { localPhotoId: string; visitaClientId: string; uri: string; tipo: string }) {
    const db = getDb();
    db.runSync(
      `INSERT OR REPLACE INTO fotos_local (local_photo_id, visita_client_id, uri, tipo, uploaded)
       VALUES (?, ?, ?, ?, 0)`,
      [data.localPhotoId, data.visitaClientId, data.uri, data.tipo],
    );
  },

  enqueueOp(op: {
    opId: string;
    entity: string;
    opType: string;
    clientEntityId: string;
    payload: object;
  }) {
    const db = getDb();
    db.runSync(
      `INSERT OR IGNORE INTO sync_queue (op_id, entity, op_type, client_entity_id, payload)
       VALUES (?, ?, ?, ?, ?)`,
      [op.opId, op.entity, op.opType, op.clientEntityId, JSON.stringify(op.payload)],
    );
  },

  getPendingVisitas() {
    const db = getDb();
    return db.getAllSync<{
      client_id: string;
      lat: number;
      lng: number;
      observaciones: string | null;
      synced: number;
    }>(`SELECT * FROM visitas ORDER BY created_at DESC`);
  },

  getSyncQueue() {
    const db = getDb();
    return db.getAllSync<{
      op_id: string;
      entity: string;
      op_type: string;
      client_entity_id: string;
      payload: string;
    }>(`SELECT * FROM sync_queue ORDER BY id ASC`);
  },

  getPendingPhotos() {
    const db = getDb();
    return db.getAllSync<{
      local_photo_id: string;
      visita_client_id: string;
      uri: string;
      tipo: string;
    }>(`SELECT * FROM fotos_local WHERE uploaded = 0`);
  },

  markPhotoUploaded(localPhotoId: string) {
    const db = getDb();
    db.runSync(`UPDATE fotos_local SET uploaded = 1 WHERE local_photo_id = ?`, [localPhotoId]);
  },

  clearSyncQueue() {
    const db = getDb();
    db.runSync(`DELETE FROM sync_queue`);
  },

  markAllSynced() {
    const db = getDb();
    db.runSync(`UPDATE visitas SET synced = 1`);
    db.runSync(`UPDATE abonados SET synced = 1`);
    db.runSync(`UPDATE medidores SET synced = 1`);
    db.runSync(`UPDATE lecturas SET synced = 1`);
  },

  getSetting(key: string) {
    const db = getDb();
    const row = db.getFirstSync<{ value: string }>(`SELECT value FROM settings WHERE key = ?`, [
      key,
    ]);
    return row?.value ?? null;
  },

  setSetting(key: string, value: string) {
    const db = getDb();
    db.runSync(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
  },
};
