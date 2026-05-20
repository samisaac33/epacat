import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb() {
  if (!db) {
    db = SQLite.openDatabaseSync('epacat.db');
    initSchema(db);
  }
  return db;
}

function initSchema(database: SQLite.SQLiteDatabase) {
  database.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS abonados (
      client_id TEXT PRIMARY KEY,
      cedula TEXT NOT NULL,
      nombre TEXT NOT NULL,
      direccion TEXT NOT NULL,
      sector TEXT NOT NULL,
      telefono TEXT,
      synced INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS medidores (
      client_id TEXT PRIMARY KEY,
      abonado_client_id TEXT NOT NULL,
      numero_serie TEXT NOT NULL,
      marca TEXT NOT NULL,
      ubicacion TEXT,
      synced INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS visitas (
      client_id TEXT PRIMARY KEY,
      abonado_client_id TEXT,
      medidor_client_id TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      observaciones TEXT,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS lecturas (
      client_id TEXT PRIMARY KEY,
      medidor_client_id TEXT NOT NULL,
      visita_client_id TEXT,
      valor REAL NOT NULL,
      fecha TEXT NOT NULL,
      foto_local_id TEXT,
      synced INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS fotos_local (
      local_photo_id TEXT PRIMARY KEY,
      visita_client_id TEXT NOT NULL,
      uri TEXT NOT NULL,
      tipo TEXT NOT NULL,
      uploaded INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      op_id TEXT UNIQUE NOT NULL,
      entity TEXT NOT NULL,
      op_type TEXT NOT NULL,
      client_entity_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
