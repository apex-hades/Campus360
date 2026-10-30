const { default: EmbeddedPostgres } = require('embedded-postgres');
const path = require('path');
const os = require('os');
const fs = require('fs');

const PORT = parseInt(process.env.DB_PORT || '5433', 10);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_NAME = process.env.DB_NAME || 'campus360';

// Use a safe path without spaces to ensure postgres initdb succeeds on Windows
const defaultDataDir = path.join(os.homedir(), '.campus360-postgres').replace(/\\/g, '/');
// If home dir contains spaces, fallback to C:/temp/campus360-pg
const DATA_DIR = defaultDataDir.includes(' ') ? 'C:/temp/campus360-pg' : defaultDataDir;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log(`[Campus360 DB Server] Using Data Dir: ${DATA_DIR}`);
console.log(`[Campus360 DB Server] Port: ${PORT}`);

const pg = new EmbeddedPostgres({
  port: PORT,
  databaseDir: DATA_DIR,
  user: DB_USER,
  password: DB_PASSWORD,
  persistent: true,
});

async function startServer() {
  try {
    console.log('[Campus360 DB Server] Initializing PostgreSQL cluster...');
    await pg.initialise();
  } catch (err) {
    console.log('[Campus360 DB Server] Cluster already initialized or resuming:', err.message);
  }

  try {
    console.log('[Campus360 DB Server] Starting PostgreSQL...');
    await pg.start();
    console.log(`[Campus360 DB Server] PostgreSQL running at port ${PORT}`);

    try {
      await pg.createDatabase(DB_NAME);
      console.log(`[Campus360 DB Server] Created database '${DB_NAME}'`);
    } catch (e) {
      // Database might already exist
      console.log(`[Campus360 DB Server] Database '${DB_NAME}' is ready.`);
    }

    const connStr = `postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${PORT}/${DB_NAME}?schema=public`;
    console.log(`\n======================================================`);
    console.log(`Campus360 PostgreSQL is active!`);
    console.log(`DATABASE_URL="${connStr}"`);
    console.log(`======================================================\n`);

    // Keep process alive
    process.stdin.resume();
  } catch (err) {
    console.error('[Campus360 DB Server] Error starting DB server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
const cleanExit = async () => {
  console.log('\n[Campus360 DB Server] Shutting down PostgreSQL...');
  try {
    await pg.stop();
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

startServer();

