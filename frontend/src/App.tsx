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
  const [boards, setBoards] = useState<Board[]>([]);
  const [name, setName] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Load all boards
  // -----------------------------
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

  // -----------------------------
  // Add board
  // -----------------------------
  const addBoard = async () => {
    if (!name.trim()) {
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

      setBoards((prev) => [...prev, newBoard]);
      setName("");
    } catch (error) {
      console.error("Error creating board:", error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Open board
  // -----------------------------
  const openBoard = async (board: Board) => {
    try {
      setSelectedBoard(board);

      // Load columns
      const columnsResponse = await fetch(
        `${API}/columns/board/${board.id}`
      );

      if (!columnsResponse.ok) {
        throw new Error("Failed to load columns");
      }

      const columnsData = await columnsResponse.json();
      setColumns(columnsData);

      // Load tasks
      const tasksResponse = await fetch(`${API}/tasks/board/${board.id}`);

      if (!tasksResponse.ok) {
        throw new Error("Failed to load tasks");
      }

      const tasksData = await tasksResponse.json();
      setTasks(tasksData);
    } catch (error) {
      console.error("Error opening board:", error);

      setColumns([]);
      setTasks([]);
    }
  };

  // -----------------------------
  // Back to boards
  // -----------------------------
  const backToBoards = () => {
    setSelectedBoard(null);
    setColumns([]);
    setTasks([]);
  };

  // -----------------------------
  // Board page
  // -----------------------------
  if (selectedBoard) {
    return (
      <div className="app">
        <header>
          <h1>TaskFlow</h1>
          <p>Manage your boards and tasks</p>
        </header>

        <main>
          <button onClick={backToBoards}>← Back to Boards</button>

          <section>
            <h2>{selectedBoard.name}</h2>
            <p>Board #{selectedBoard.id}</p>

            <h3>Tasks</h3>

            {columns.length === 0 ? (
              <p>No columns yet.</p>
            ) : (
              <div className="columns">
                {columns.map((column) => {
                  const columnTasks = tasks.filter(
                    (task) => task.column_id === column.id
                  );

                  return (
                    <div className="column" key={column.id}>
                      <h3>{column.name}</h3>

                      {columnTasks.length === 0 ? (
                        <p>No tasks yet.</p>
                      ) : (
                        columnTasks.map((task) => (
                          <div className="task-card" key={task.id}>
                            <h4>{task.title}</h4>

                            {task.description && (
                              <p>{task.description}</p>
                            )}

                            <span>
                              Priority: {task.priority}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  // -----------------------------
  // Boards page
  // -----------------------------
  return (
    <div className="app">
      <header>
        <h1>TaskFlow</h1>
        <p>Manage your boards and tasks</p>
      </header>

      <main>
        <section className="create-board">
          <input
            type="text"
            placeholder="Enter board name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button onClick={addBoard} disabled={loading}>
            {loading ? "Adding..." : "Add Board"}
          </button>
        </section>

        <section>
          <h2>Your Boards</h2>

          <div className="boards">
            {boards.map((board) => (
              <div
                className="board-card"
                key={board.id}
                onClick={() => openBoard(board)}
                style={{ cursor: "pointer" }}
              >
                <h3>{board.name}</h3>
                <span>Board #{board.id}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;