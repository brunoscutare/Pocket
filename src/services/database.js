import * as SQLite from 'expo-sqlite';

// Conexão única, compartilhada por todos os serviços do app (pendências, renda, etc.).
// Tudo local, sem servidor — o app funciona 100% offline.
const DB_NAME = 'pocket.db';

let dbPromise = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS pendencias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          preco REAL,
          preco_fixo INTEGER NOT NULL DEFAULT 0,
          concluido INTEGER NOT NULL DEFAULT 0,
          tipo TEXT,
          dia_vencimento INTEGER,
          notif_aviso_id TEXT,
          notif_dia_id TEXT
        );

        CREATE TABLE IF NOT EXISTS renda (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          total REAL NOT NULL DEFAULT 0,
          historico_saldo REAL NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS movimentacoes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          descricao TEXT NOT NULL,
          valor REAL NOT NULL,
          criado_em TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      await db.runAsync('INSERT OR IGNORE INTO renda (id, total) VALUES (1, 0);');

      // Instalações antigas (de antes desses campos existirem) não têm essas colunas —
      // adiciona por fora do CREATE TABLE IF NOT EXISTS, que não altera tabelas já criadas.
      try {
        await db.execAsync('ALTER TABLE pendencias ADD COLUMN tipo TEXT;');
      } catch (_e) {
        // Coluna já existe — ignora.
      }
      try {
        await db.execAsync('ALTER TABLE renda ADD COLUMN historico_saldo REAL NOT NULL DEFAULT 0;');
      } catch (_e) {
        // Coluna já existe — ignora.
      }
      try {
        await db.execAsync('ALTER TABLE pendencias ADD COLUMN dia_vencimento INTEGER;');
      } catch (_e) {
        // Coluna já existe — ignora.
      }
      try {
        await db.execAsync('ALTER TABLE pendencias ADD COLUMN notif_aviso_id TEXT;');
      } catch (_e) {
        // Coluna já existe — ignora.
      }
      try {
        await db.execAsync('ALTER TABLE pendencias ADD COLUMN notif_dia_id TEXT;');
      } catch (_e) {
        // Coluna já existe — ignora.
      }
      try {
        // Campo não usado em lugar nenhum do app — remove de instalações antigas.
        await db.execAsync('ALTER TABLE pendencias DROP COLUMN criado_em;');
      } catch (_e) {
        // Coluna já não existe (instalação nova) ou SQLite antigo sem suporte a DROP COLUMN — ignora.
      }

      return db;
    });
  }
  return dbPromise;
}
