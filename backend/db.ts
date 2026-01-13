import { drizzle } from "drizzle-orm/node-postgres";
import { pgPool } from "./dbPool";

export const db = drizzle(pgPool);
