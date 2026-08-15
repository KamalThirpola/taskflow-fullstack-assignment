import express from "express";
import cors from "cors";

import boardRoutes from "./routes/boardRoutes";
import taskRoutes from "./routes/taskRoutes";

const app = express();

const PORT = 3000;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
    ],
  })
);

app.use(express.json());

/* =========================================================
   TEST ROUTE
========================================================= */

app.get("/", (_req, res) => {
  res.json({
    message: "TaskFlow API is running",
  });
});

/* =========================================================
   ROUTES
========================================================= */

app.use("/api/boards", boardRoutes);

console.log("BOARD ROUTES LOADED");

app.use("/api/tasks", taskRoutes);

console.log("TASK ROUTES LOADED");

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `TaskFlow API running on http://localhost:${PORT}`
  );
});