import { Pool } from "pg";

const commonConfig = {
  host: process.env.PGHOST ,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER ,
  password: process.env.PGPASSWORD ,
};


export const pgPool = new Pool({
  ...commonConfig,
  database: process.env.PGDATABASE ?? "TodoDB",
});

const adminPool = new Pool({
  ...commonConfig,
  database: process.env.PGADMIN_DATABASE ?? "postgres",
});

export async function ensureDatabase() {
  const existing = await adminPool.query<{ datname: string }>(
    "SELECT datname FROM pg_database WHERE datname = 'TodoDB'"
  );
  const hasDb = existing.rows.some((row: { datname: string }) => row.datname === "TodoDB");
  if (!hasDb) {
    await adminPool.query('CREATE DATABASE "TodoDB"');
  }
}
