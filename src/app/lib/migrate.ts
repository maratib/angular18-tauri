import { OnInit } from "@angular/core";
import Database from "@tauri-apps/plugin-sql";

export async function Migrate(db: Database, fresh = false) {
  if (fresh) {
    db.execute(`
    -- DROP TABLE IF EXISTS cats;
    DROP TABLE IF EXISTS art;
    `);
  }
  db.execute(
    `
    CREATE TABLE IF NOT EXISTS cats (title TEXT NOT NULL UNIQUE);
    CREATE TABLE IF NOT EXISTS art (
      cat INTEGER NOT NULL,
      aid TEXT NOT NULL UNIQUE,
      title TEXT,
      description TEXT,
      activities TEXT,
      features TEXT,
      fetched INTEGER default 0,
      seen INTEGER default 0,
      dated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `
  );
}

export async function listTables(db: Database) {
  const tables: [] = await db.select(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );
  console.log(JSON.stringify(tables));
  console.log("listTables");
}

export const initDb = async (db: Database) => {
  console.log("initDb");
  // await Migrate(db, true); //Create new db
  await Migrate(db);
  // await listTables(db);
};
