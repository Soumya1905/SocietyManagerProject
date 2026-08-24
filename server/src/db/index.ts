import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

export const pool = new pg.Pool({ connectionString: env.databaseUrl });

export const db = drizzle(pool, { schema });
