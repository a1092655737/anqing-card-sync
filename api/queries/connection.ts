import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const connection = createConnection({
      uri: env.databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
    instance = drizzle(connection, {
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}
