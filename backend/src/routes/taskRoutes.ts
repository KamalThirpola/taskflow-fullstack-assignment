import { Router } from "express";
import db from "../db/database";

const router = Router();

console.log("TASK ROUTES FILE LOADED");

router.get("/test", (_req, res) => {
  res.json({
    message: "Task routes are working",
  });
});

// Get all columns for a board
router.get("/columns/:boardId", (req, res) => {
  const boardId = Number(req.params.boardId);

  if (!Number.isInteger(boardId)) {
    return res.status(400).json({
      error: "Invalid board id",
    });
  }

  const columns = db
    .prepare(`
      SELECT id, board_id, name, position
      FROM columns
      WHERE board_id = ?
      ORDER BY position
    `)
    .all(boardId);

  return res.json(columns);
});


router.get("/board/:boardId", (req, res) => {
  const boardId = Number(req.params.boardId);

  if (!Number.isInteger(boardId)) {
    return res.status(400).json({
      error: "Invalid board id",
    });
  }

  const tasks = db
    .prepare(`
      SELECT
        tasks.id,
        tasks.column_id,
        tasks.title,
        tasks.description,
        tasks.priority,
        tasks.created_at,
        columns.name AS column_name
      FROM tasks
      JOIN columns ON tasks.column_id = columns.id
      WHERE columns.board_id = ?
      ORDER BY tasks.id
    `)
    .all(boardId);

  return res.json(tasks);
});

// Create a task
router.post("/", (req, res) => {
  const { column_id, title, description, priority } = req.body;

  if (!Number.isInteger(Number(column_id))) {
    return res.status(400).json({
      error: "Valid column_id is required",
    });
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required",
    });
  }

  const taskPriority =
    priority === "Low" ||
    priority === "Medium" ||
    priority === "High"
      ? priority
      : "Medium";

  const result = db
    .prepare(`
      INSERT INTO tasks
        (column_id, title, description, priority)
      VALUES
        (?, ?, ?, ?)
    `)
    .run(
      Number(column_id),
      title.trim(),
      description?.trim() || "",
      taskPriority
    );

  const task = db
    .prepare(`
      SELECT
        id,
        column_id,
        title,
        description,
        priority,
        created_at
      FROM tasks
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);

  return res.status(201).json(task);
});

export default router;