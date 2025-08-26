import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Todo.module.css";

function Todos() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const hasRun = useRef(false);

  // טוען auth מה־localStorage
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  // טוען todos מהשרת
  useEffect(() => {
    if (!user || !token) return;
    if (hasRun.current) return;
    hasRun.current = true;

    const load = async () => {
      try {
        const res = await fetch(`http://localhost:5000/todos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to load todos (${res.status})`);
        const data = await res.json();
        setTodos(data);
        setLoaded(true);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load todos");
        setLoaded(true);
      }
    };
    load();
  }, [user, token]);

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;
    setIsAddingTodo(true);
    try {
      const res = await fetch(`http://localhost:5000/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTodoTitle.trim(), completed: false }),
      });
      if (!res.ok) throw new Error(`Failed to create todo (${res.status})`);
      const created = await res.json();
      setTodos((prev) => [...prev, created]);
      setNewTodoTitle("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to add todo");
    } finally {
      setIsAddingTodo(false);
    }
  };

  if (!user) return <div className={styles.noUser}>יש להתחבר כדי לראות משימות.</div>;

  return (
    <div className={styles.todoContainer}>
      <h1>Todos</h1>
      <input
        type="text"
        value={newTodoTitle}
        onChange={(e) => setNewTodoTitle(e.target.value)}
        placeholder="Add todo"
      />
      <button onClick={handleAddTodo} disabled={isAddingTodo}>
        Add
      </button>

      {error && <div>{error}</div>}

      <ul>
        {todos.map((t) => (
          <li key={t.id}>{t.title} - {t.completed ? "✔️" : "❌"}</li>
        ))}
      </ul>
    </div>
  );
}

export default Todos;
