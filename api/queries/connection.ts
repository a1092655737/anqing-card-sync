import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    // Parse DATABASE_URL into connection params
    const url = new URL(env.databaseUrl);
    const connection = mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });
    instance = drizzle(connection, {
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}
