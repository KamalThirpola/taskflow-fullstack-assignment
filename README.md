# TaskFlow - Full Stack Assignment

TaskFlow is a full-stack task management application built with React, TypeScript, Node.js, Express, and SQLite.

## Project Structure

```text
taskflow-fullstack-assignment/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts
│   │   │   └── schema.sql
│   │   ├── routes/
│   │   │   ├── boardRoutes.ts
│   │   │   └── taskRoutes.ts
│   │   └── server.ts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── App.css
    │   ├── main.tsx
    │   └── index.css
    └── package.json

## Assignment Notes

### Decisions and Assumptions
- I used SQLite for persistent local data storage.
- Each board contains columns such as To Do, In Progress, and Done.
- Tasks have a title, description, priority, and column.
- Task movement is handled by changing the task's column.
- The frontend communicates with the backend through REST API endpoints.

### What I Would Improve
If I had more time, I would improve the UI, add drag-and-drop task movement, add better error messages, and add more automated tests.

### Time Spent
Approximately [14] hours were spent designing, implementing, testing, and debugging the application.

### What I Learned
I learned more about connecting a React frontend to an Express/TypeScript backend and making sure changes persist correctly in the SQLite database.

Thank you
