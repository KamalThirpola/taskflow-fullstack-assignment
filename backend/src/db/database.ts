import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const databasePath = path.join(dataDirectory, "taskflow.db");

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");

db.exec(schema);

// --------------------------------------------------
// Seed default columns for existing boards
// --------------------------------------------------

const insertColumn = db.prepare(`
  INSERT INTO columns (board_id, name, position)
  VALUES (?, ?, ?)
`);

const addDefaultColumns = db.transaction(() => {
  const boards = db
    .prepare("SELECT id FROM boards ORDER BY id")
    .all() as { id: number }[];

  for (const board of boards) {
    const existingColumns = db
      .prepare("SELECT COUNT(*) AS count FROM columns WHERE board_id = ?")
      .get(board.id) as { count: number };

    if (existingColumns.count === 0) {
      insertColumn.run(board.id, "To Do", 1);
      insertColumn.run(board.id, "In Progress", 2);
      insertColumn.run(board.id, "Done", 3);
    }
  }
});

addDefaultColumns();

export default db;