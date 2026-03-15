import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "orders.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initDb(db);
  }
  return db;
}

function initDb(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      items TEXT NOT NULL,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      stripe_payment_intent TEXT,
      created_at INTEGER NOT NULL
    );
  `);
}

export interface Order {
  id: string;
  email: string;
  items: string; // JSON string
  total: number; // cents
  status: string;
  stripe_payment_intent: string | null;
  created_at: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number; // cents
  quantity: number;
}
