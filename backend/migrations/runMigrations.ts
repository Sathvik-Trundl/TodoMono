import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { pgPool } from "../dbPool";

const migrationsDir = path.resolve(__dirname, "../..", "migrations");

export async function ensureMigrationsTable() {
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS migrations_history (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function resetMigrations() {
  await pgPool.query("DROP SCHEMA public CASCADE;");
  await pgPool.query("CREATE SCHEMA public;");
}

export async function runMigrations(options: { reset?: boolean } = {}) {
  if (options.reset) {
    await resetMigrations();
  }
  await ensureMigrationsTable();
  const applied = await pgPool.query<{ name: string }>("SELECT name FROM migrations_history");
  const appliedNames = new Set(applied.rows.map((row: { name: string }) => row.name));

  const files = await readdir(migrationsDir);
  const sqlFiles = files.filter((file) => file.endsWith(".sql")).sort();

  for (const file of sqlFiles) {
    if (appliedNames.has(file)) continue;

    const sql = await readFile(path.join(migrationsDir, file), "utf-8");
    await pgPool.query(sql);
    await pgPool.query("INSERT INTO migrations_history (name) VALUES ($1)", [file]);
  }
}

if (require.main === module) {
  const shouldReset = process.argv.includes("--reset");
  runMigrations({ reset: shouldReset }).catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
}
