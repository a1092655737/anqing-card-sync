import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let pool: mysql.Pool;

function getPool(): mysql.Pool {
  if (!pool) {
    const url = new URL(env.databaseUrl);
    pool = mysql.createPool({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}

// Direct SQL pool for title-router and task-router
export { getPool };

// Drizzle ORM instance for users.ts and topic-router.ts
export function getDb(): any {
  return drizzle(getPool() as any, {
    mode: "planetscale",
    schema: fullSchema,
  });
}
