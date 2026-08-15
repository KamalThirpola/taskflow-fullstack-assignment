import { useEffect, useState } from "react";
import "./App.css";

type Board = {
  id: number;
  name: string;
};

type Column = {
  id: number;
  board_id: number;
  name: string;
  position: number;
};

type Task = {
  id: number;
  column_id: number;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  created_at: string;
  column_name?: string;
};

const API = "http://127.0.0.1:3000/api";

function App() {
  // ------------------------------------------------------------------
  // Boards
  // ------------------------------------------------------------------

  const [boards, setBoards] = useState<Board[]>([]);
  const [name, setName] = useState("");

  const [selectedBoard, setSelectedBoard] =
    useState<Board | null>(null);

  // ------------------------------------------------------------------
  // Columns and Tasks
  // ------------------------------------------------------------------

  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // ------------------------------------------------------------------
  // Add task form
  // ------------------------------------------------------------------

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] =
    useState<"Low" | "Medium" | "High">("Medium");

  const [selectedColumnId, setSelectedColumnId] =
    useState<number | "">("");

  // ------------------------------------------------------------------
  // Editing
  // ------------------------------------------------------------------

  const [editingTaskId, setEditingTaskId] =
    useState<number | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] =
    useState("");

  const [editPriority, setEditPriority] =
    useState<"Low" | "Medium" | "High">("Medium");

  const [editColumnId, setEditColumnId] =
    useState<number | "">("");

  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------------------
  // Load boards
  // ------------------------------------------------------------------

  const loadBoards = async () => {
    try {
      const response = await fetch(`${API}/boards`);

      if (!response.ok) {
        throw new Error("Failed to load boards");
      }

      const data = await response.json();

      setBoards(data);
    } catch (error) {
      console.error("Error loading boards:", error);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  // ------------------------------------------------------------------
  // Add board
  // ------------------------------------------------------------------

  const addBoard = async () => {
    if (!name.trim()) {
      alert("Please enter a board name.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/boards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create board");
      }

      const newBoard = await response.json();

      setBoards((prev) => [
        ...prev,
        newBoard,
      ]);

      setName("");
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create board.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Open board
  // ------------------------------------------------------------------

  const openBoard = async (board: Board) => {
    try {
      setSelectedBoard(board);

      setColumns([]);
      setTasks([]);

      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("Medium");
      setSelectedColumnId("");

      // Load columns
      const columnsResponse = await fetch(
        `${API}/tasks/columns/${board.id}`
      );

      if (!columnsResponse.ok) {
        throw new Error("Failed to load columns");
      }

      const columnsData: Column[] =
        await columnsResponse.json();

      setColumns(columnsData);

      // Automatically select first column
      if (columnsData.length > 0) {
        setSelectedColumnId(columnsData[0].id);
      }

      // Load tasks
      const tasksResponse = await fetch(
        `${API}/tasks/board/${board.id}`
      );

      if (!tasksResponse.ok) {
        throw new Error("Failed to load tasks");
      }

      const tasksData: Task[] =
        await tasksResponse.json();

      setTasks(tasksData);
    } catch (error) {
      console.error(
        "Error opening board:",
        error
      );

      setColumns([]);
      setTasks([]);
    }
  };

  // ------------------------------------------------------------------
  // Back to boards
  // ------------------------------------------------------------------

  const backToBoards = () => {
    setSelectedBoard(null);
    setColumns([]);
    setTasks([]);

    setTaskTitle("");
    setTaskDescription("");
    setSelectedColumnId("");

    setEditingTaskId(null);
  };

  // ------------------------------------------------------------------
  // Add task
  // ------------------------------------------------------------------

  const addTask = async () => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (selectedColumnId === "") {
      alert("Please select a column.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            column_id: Number(selectedColumnId),
            title: taskTitle.trim(),
            description:
              taskDescription.trim(),
            priority: taskPriority,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.error ||
            "Failed to create task"
        );
      }

      const newTask: Task =
        await response.json();

      setTasks((prev) => [
        ...prev,
        newTask,
      ]);

      // Clear form
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("Medium");
    } catch (error) {
      console.error(
        "Error creating task:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create task."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Start editing task
  // ------------------------------------------------------------------

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);

    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditColumnId(task.column_id);
  };

  // ------------------------------------------------------------------
  // Cancel editing
  // ------------------------------------------------------------------

  const cancelEdit = () => {
    setEditingTaskId(null);

    setEditTitle("");
    setEditDescription("");
    setEditPriority("Medium");
    setEditColumnId("");
  };

  // ------------------------------------------------------------------
  // Save edited task
  // ------------------------------------------------------------------

  const saveTask = async (taskId: number) => {
    if (!editTitle.trim()) {
      alert("Task title is required.");
      return;
    }

    if (editColumnId === "") {
      alert("Please select a column.");
      return;
    }

    try {
      const response = await fetch(
        `${API}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description:
              editDescription.trim(),
            priority: editPriority,
            column_id: Number(editColumnId),
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.error ||
            "Failed to update task"
        );
      }

      const updatedTask: Task =
        await response.json();

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...updatedTask,
              }
            : task
        )
      );

      cancelEdit();
    } catch (error) {
      console.error(
        "Error updating task:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update task."
      );
    }
  };

  // ------------------------------------------------------------------
  // Delete task
  // ------------------------------------------------------------------

  const deleteTask = async (taskId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.error ||
            "Failed to delete task"
        );
      }

      setTasks((prev) =>
        prev.filter(
          (task) => task.id !== taskId
        )
      );

      if (editingTaskId === taskId) {
        cancelEdit();
      }
    } catch (error) {
      console.error(
        "Error deleting task:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete task."
      );
    }
  };

  // ------------------------------------------------------------------
  // Move task
  // ------------------------------------------------------------------

  const moveTask = async (
    task: Task,
    newColumnId: number
  ) => {
    try {
      const response = await fetch(
        `${API}/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            priority: task.priority,
            column_id: newColumnId,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.error ||
            "Failed to move task"
        );
      }

      const updatedTask: Task =
        await response.json();

      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id
            ? {
                ...item,
                ...updatedTask,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Error moving task:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to move task."
      );
    }
  };

  // ------------------------------------------------------------------
  // Board page
  // ------------------------------------------------------------------

  if (selectedBoard) {
    return (
      <div className="app">
        <header>
          <h1>TaskFlow</h1>
          <p>
            Manage your boards and tasks
          </p>
        </header>

        <main>
          <button onClick={backToBoards}>
            ← Back to Boards
          </button>

          <section>
            <h2>{selectedBoard.name}</h2>

            <p>
              Board #{selectedBoard.id}
            </p>

            {/* --------------------------------------------------
                Add Task
            -------------------------------------------------- */}

            <div className="add-task">
              <h2>Add Task</h2>

              <div className="task-form">
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) =>
                    setTaskTitle(
                      e.target.value
                    )
                  }
                />

                <textarea
                  placeholder="Task description"
                  value={taskDescription}
                  onChange={(e) =>
                    setTaskDescription(
                      e.target.value
                    )
                  }
                />

                <select
                  value={taskPriority}
                  onChange={(e) =>
                    setTaskPriority(
                      e.target.value as
                        | "Low"
                        | "Medium"
                        | "High"
                    )
                  }
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>
                </select>

                <select
                  value={selectedColumnId}
                  onChange={(e) =>
                    setSelectedColumnId(
                      e.target.value
                        ? Number(
                            e.target.value
                          )
                        : ""
                    )
                  }
                >
                  <option value="">
                    Select column
                  </option>

                  {columns.map(
                    (column) => (
                      <option
                        key={column.id}
                        value={column.id}
                      >
                        {column.name}
                      </option>
                    )
                  )}
                </select>

                <button
                  onClick={addTask}
                  disabled={
                    loading ||
                    columns.length === 0
                  }
                >
                  {loading
                    ? "Adding..."
                    : "Add Task"}
                </button>
              </div>
            </div>

            {/* --------------------------------------------------
                Tasks
            -------------------------------------------------- */}

            <section>
              <h2>Tasks</h2>

              {columns.length === 0 ? (
                <p>
                  No columns yet.
                </p>
              ) : (
                <div className="columns">
                  {columns.map(
                    (column) => {
                      const columnTasks =
                        tasks.filter(
                          (task) =>
                            task.column_id ===
                            column.id
                        );

                      return (
                        <div
                          className="column"
                          key={column.id}
                        >
                          <h3>
                            {column.name}
                          </h3>

                          {columnTasks.length ===
                          0 ? (
                            <p>
                              No tasks yet.
                            </p>
                          ) : (
                            columnTasks.map(
                              (task) => (
                                <div
                                  className="task-card"
                                  key={task.id}
                                >
                                  {editingTaskId ===
                                  task.id ? (
                                    // --------------------------------
                                    // EDIT MODE
                                    // --------------------------------
                                    <div>
                                      <input
                                        type="text"
                                        value={
                                          editTitle
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          setEditTitle(
                                            e
                                              .target
                                              .value
                                          )
                                        }
                                      />

                                      <textarea
                                        value={
                                          editDescription
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          setEditDescription(
                                            e
                                              .target
                                              .value
                                          )
                                        }
                                      />

                                      <select
                                        value={
                                          editPriority
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          setEditPriority(
                                            e
                                              .target
                                              .value as
                                              | "Low"
                                              | "Medium"
                                              | "High"
                                          )
                                        }
                                      >
                                        <option value="Low">
                                          Low
                                        </option>

                                        <option value="Medium">
                                          Medium
                                        </option>

                                        <option value="High">
                                          High
                                        </option>
                                      </select>

                                      <select
                                        value={
                                          editColumnId
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          setEditColumnId(
                                            e
                                              .target
                                              .value
                                              ? Number(
                                                  e
                                                    .target
                                                    .value
                                                )
                                              : ""
                                          )
                                        }
                                      >
                                        {columns.map(
                                          (
                                            item
                                          ) => (
                                            <option
                                              key={
                                                item.id
                                              }
                                              value={
                                                item.id
                                              }
                                            >
                                              {
                                                item.name
                                              }
                                            </option>
                                          )
                                        )}
                                      </select>

                                      <div className="task-actions">
                                        <button
                                          onClick={() =>
                                            saveTask(
                                              task.id
                                            )
                                          }
                                        >
                                          Save
                                        </button>

                                        <button
                                          onClick={
                                            cancelEdit
                                          }
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    // --------------------------------
                                    // NORMAL MODE
                                    // --------------------------------
                                    <div>
                                      <h4>
                                        {
                                          task.title
                                        }
                                      </h4>

                                      {task.description && (
                                        <p>
                                          {
                                            task.description
                                          }
                                        </p>
                                      )}

                                      <p>
                                        <strong>
                                          Priority:
                                        </strong>{" "}
                                        {
                                          task.priority
                                        }
                                      </p>

                                      {/* Move task */}
                                      <select
                                        value={
                                          task.column_id
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          moveTask(
                                            task,
                                            Number(
                                              e
                                                .target
                                                .value
                                            )
                                          )
                                        }
                                      >
                                        {columns.map(
                                          (
                                            item
                                          ) => (
                                            <option
                                              key={
                                                item.id
                                              }
                                              value={
                                                item.id
                                              }
                                            >
                                              Move to{" "}
                                              {
                                                item.name
                                              }
                                            </option>
                                          )
                                        )}
                                      </select>

                                      <div className="task-actions">
                                        <button
                                          onClick={() =>
                                            startEditTask(
                                              task
                                            )
                                          }
                                        >
                                          Edit
                                        </button>

                                        <button
                                          onClick={() =>
                                            deleteTask(
                                              task.id
                                            )
                                          }
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            )
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </section>
        </main>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Boards page
  // ------------------------------------------------------------------

  return (
    <div className="app">
      <header>
        <h1>TaskFlow</h1>

        <p>
          Manage your boards and tasks
        </p>
      </header>

      <main>
        <section className="create-board">
          <input
            type="text"
            placeholder="Enter board name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <button
            onClick={addBoard}
            disabled={loading}
          >
            {loading
              ? "Adding..."
              : "Add Board"}
          </button>
        </section>

        <section>
          <h2>Your Boards</h2>

          <div className="boards">
            {boards.map((board) => (
              <div
                className="board-card"
                key={board.id}
                onClick={() =>
                  openBoard(board)
                }
                style={{
                  cursor: "pointer",
                }}
              >
                <h3>
                  {board.name}
                </h3>

                <span>
                  Board #{board.id}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;