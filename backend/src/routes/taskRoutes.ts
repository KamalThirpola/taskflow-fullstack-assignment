import { Router } from "express";
import db from "../db/database";

const router = Router();

/* =========================================================
   GET COLUMNS FOR A BOARD
   GET /api/tasks/columns/:boardId
========================================================= */

router.get("/columns/:boardId", (req, res) => {
  const boardId = Number(req.params.boardId);

  if (!Number.isInteger(boardId)) {
    return res.status(400).json({
      error: "Invalid board id",
    });
  }

  const columns = db
    .prepare(`
      SELECT
        id,
        board_id,
        name,
        position
      FROM columns
      WHERE board_id = ?
      ORDER BY position ASC
    `)
    .all(boardId);

  return res.json(columns);
});

/* =========================================================
   GET ALL TASKS FOR A BOARD
   GET /api/tasks/board/:boardId
========================================================= */

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
      INNER JOIN columns
        ON tasks.column_id = columns.id
      WHERE columns.board_id = ?
      ORDER BY tasks.id ASC
    `)
    .all(boardId);

  return res.json(tasks);
});

/* =========================================================
   CREATE TASK
   POST /api/tasks
========================================================= */

router.post("/", (req, res) => {
  try {
    const {
      column_id,
      title,
      description,
      priority,
    } = req.body;

    const columnId = Number(column_id);

    if (!Number.isInteger(columnId)) {
      return res.status(400).json({
        error: "Valid column_id is required",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        error: "Task title is required",
      });
    }

    const validPriority =
      priority === "Low" ||
      priority === "Medium" ||
      priority === "High"
        ? priority
        : "Medium";

    const column = db
      .prepare(`
        SELECT id
        FROM columns
        WHERE id = ?
      `)
      .get(columnId);

    if (!column) {
      return res.status(404).json({
        error: "Column not found",
      });
    }

    const result = db
      .prepare(`
        INSERT INTO tasks
          (column_id, title, description, priority)
        VALUES
          (?, ?, ?, ?)
      `)
      .run(
        columnId,
        title.trim(),
        typeof description === "string"
          ? description.trim()
          : "",
        validPriority
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
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return res.status(500).json({
      error: "Failed to create task",
    });
  }
});

/* =========================================================
   UPDATE TASK
   PUT /api/tasks/:id
========================================================= */

router.put("/:id", (req, res) => {
  try {
    const taskId = Number(req.params.id);

    console.log("PUT TASK:", taskId);
    console.log("BODY:", req.body);

    if (!Number.isInteger(taskId)) {
      return res.status(400).json({
        error: "Invalid task id",
      });
    }

    const existingTask = db
      .prepare(`
        SELECT
          id,
          column_id,
          title,
          description,
          priority
        FROM tasks
        WHERE id = ?
      `)
      .get(taskId) as
      | {
          id: number;
          column_id: number;
          title: string;
          description: string;
          priority: "Low" | "Medium" | "High";
        }
      | undefined;

    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const title =
      typeof req.body.title === "string"
        ? req.body.title.trim()
        : existingTask.title;

    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : existingTask.description;

    const priority =
      req.body.priority === "Low" ||
      req.body.priority === "Medium" ||
      req.body.priority === "High"
        ? req.body.priority
        : existingTask.priority;

    const columnId =
      req.body.column_id !== undefined
        ? Number(req.body.column_id)
        : existingTask.column_id;

    if (!title) {
      return res.status(400).json({
        error: "Task title is required",
      });
    }

    if (!Number.isInteger(columnId)) {
      return res.status(400).json({
        error: "Valid column_id is required",
      });
    }

    const column = db
      .prepare(`
        SELECT id
        FROM columns
        WHERE id = ?
      `)
      .get(columnId);

    if (!column) {
      return res.status(404).json({
        error: "Column not found",
      });
    }

    db.prepare(`
      UPDATE tasks
      SET
        column_id = ?,
        title = ?,
        description = ?,
        priority = ?
      WHERE id = ?
    `).run(
      columnId,
      title,
      description,
      priority,
      taskId
    );

    const updatedTask = db
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
      .get(taskId);

    console.log("UPDATED TASK:", updatedTask);

    return res.json(updatedTask);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    return res.status(500).json({
      error: "Failed to update task",
    });
  }
});

/* =========================================================
   DELETE TASK
   DELETE /api/tasks/:id
========================================================= */

router.delete("/:id", (req, res) => {
  try {
    const taskId = Number(req.params.id);

    console.log("DELETE TASK:", taskId);

    if (!Number.isInteger(taskId)) {
      return res.status(400).json({
        error: "Invalid task id",
      });
    }

    const existingTask = db
      .prepare(`
        SELECT id
        FROM tasks
        WHERE id = ?
      `)
      .get(taskId);

    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    db.prepare(`
      DELETE FROM tasks
      WHERE id = ?
    `).run(taskId);

    console.log(
      "TASK DELETED:",
      taskId
    );

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    return res.status(500).json({
      error: "Failed to delete task",
    });
  }
});

export default router;