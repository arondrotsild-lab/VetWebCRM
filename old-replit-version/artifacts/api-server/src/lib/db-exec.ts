import { pool } from "@workspace/db";

export type Row = Record<string, unknown>;

export async function query(sql: string, params: unknown[] = []): Promise<Row[]> {
  const result = await pool.query(sql, params);
  return result.rows as Row[];
}

export async function queryOne(sql: string, params: unknown[] = []): Promise<Row | undefined> {
  const rows = await query(sql, params);
  return rows[0];
}
