import express from "express";
import cors from "cors";

import boardRoutes from "./routes/boardRoutes";
import taskRoutes from "./routes/taskRoutes";

const app = express();

const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({
    message: "TaskFlow API is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`TaskFlow API running on http://localhost:${PORT}`);
  console.log("BOARD ROUTES LOADED");
  console.log("TASK ROUTES LOADED");
});