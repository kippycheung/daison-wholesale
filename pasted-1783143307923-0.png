// Neon Postgres connection (serverless driver).
// Uses the pooled connection string in DATABASE_URL.
import { neon } from "@neondatabase/serverless";

let _sql = null;

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}
