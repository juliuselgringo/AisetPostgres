import { Pool } from 'pg';
import { config } from 'dotenv';
// Charger le .env le plus tôt possible (sans casser le démarrage si absent)
config();

const required = ['PGUSER','PGHOST','PGDATABASE','PGPASSWORD'];
const missing = required.filter(v => !process.env[v]);

// On n'arrête plus l'appli si variables manquantes : on fonctionnera en mode "degradé"
if (missing.length) {
  console.warn('[DB][WARN] Variables manquantes (mode dégradé, DB inactive):', missing);
}

let pool = null;
if (!missing.length) {
  try {
    pool = new Pool({
      user: process.env.PGUSER || process.env.PG || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'postgres',
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  } catch(e) {
    console.error('[DB][INIT][ERROR]', e.message);
  }
} else {
  console.log('[DB] Pool non initialisé (configuration incomplète)');
}

if (pool) {
  pool.on('error', (err) => {
    console.error('[DB][POOL][ERROR]', err.message, err.stack);
  });
}

export const testDbConnection = async () => {
  if (!pool) {
    console.warn('[DB][TEST] Ignoré: pool indisponible (variables manquantes)');
    return { ok: false, skipped: true };
  }
  try {
    const r = await pool.query('SELECT 1 AS ok');
    console.log('[DB] Connexion OK', r.rows[0]);
    return { ok: true };
  } catch (e) {
    console.error('[DB][ERROR] Échec de connexion:', e.message);
    return { ok: false, error: e.message };
  }
};

export default pool;