import { Router } from "express";
import db from "../db/database";

const router = Router();

console.log("BOARD ROUTES LOADED");

// GET /api/boards
// Get all boards
router.get("/", (req, res) => {
  console.log("GET /api/boards HIT");

  const boards = db
    .prepare("SELECT id, name FROM boards ORDER BY id")
    .all();

  return res.json(boards);
});

// PUT /api/boards/:id
// Update a board name
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      error: "Invalid board id",
    });
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      error: "Board name is required",
    });
  }

  const result = db
    .prepare("UPDATE boards SET name = ? WHERE id = ?")
    .run(name.trim(), id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Board not found",
    });
  }

  const board = db
    .prepare("SELECT id, name FROM boards WHERE id = ?")
    .get(id);

  return res.json(board);
});

// POST /api/boards
// Create a new board and its default columns
router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      error: "Board name is required",
    });
  }

  const result = db
    .prepare("INSERT INTO boards (name) VALUES (?)")
    .run(name.trim());

  const boardId = Number(result.lastInsertRowid);

  // Create default columns for the new board
  const insertColumn = db.prepare(
    "INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)"
  );

  insertColumn.run(boardId, "To Do", 1);
  insertColumn.run(boardId, "In Progress", 2);
  insertColumn.run(boardId, "Done", 3);

  const board = db
    .prepare("SELECT id, name FROM boards WHERE id = ?")
    .get(boardId);

  return res.status(201).json(board);
});

export default router;