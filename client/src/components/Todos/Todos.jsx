import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Todo.module.css";

// --- Weather placeholder (UI מוכן ל־API חיצוני) ---
function WeatherPanel({ location, onChangeLocation, activity, onChangeActivity, weather, loading }) {
  return (
    <div className={styles.weatherCard}>
      <div className={styles.weatherHeader}>
        <div className={styles.weatherTitle}>Weather helper (preview)</div>
        <div className={styles.weatherBadge}>API pending</div>
      </div>

      <div className={styles.weatherControls}>
        <input
          className={styles.weatherInput}
          type="text"
          placeholder="City / location (e.g., Jerusalem)"
          value={location}
          onChange={(e) => onChangeLocation(e.target.value)}
        />
        <select
          className={styles.weatherSelect}
          value={activity}
          onChange={(e) => onChangeActivity(e.target.value)}
        >
          <option value="run">🏃‍♀️ Run</option>
          <option value="walk">🚶‍♂️ Walk</option>
          <option value="bike">🚴 Bike</option>
          <option value="outdoor">🌤️ Outdoor Workout</option>
        </select>
        <button className={styles.weatherButton} disabled>
          Connect API
        </button>
      </div>

      <div className={styles.weatherBody}>
        <div className={styles.weatherRow}>
          <span className={styles.weatherLabel}>Status</span>
          <span className={styles.weatherValueMuted}>
            Not connected — wire to your weather API when ready
          </span>
        </div>
        <div className={styles.weatherRow}>
          <span className={styles.weatherLabel}>Tip</span>
          <span className={styles.weatherValueMuted}>
            After connecting, show temp, wind, humidity, rain chance, and a
            “Is it good for {activity}?“ verdict.
          </span>
        </div>
      </div>
    </div>
  );
}

function Todos() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState({
    text: "",
    completed: "all", // "all" | "true" | "false"
    type: "all", // "all" | "personal" | "challenge"
  });
  const [sortBy, setSortBy] = useState("title");

  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editedTodoTitle, setEditedTodoTitle] = useState("");
  const [isSavingTodo, setIsSavingTodo] = useState(false);

  const [weatherLoc, setWeatherLoc] = useState("Jerusalem");
  const [weatherActivity, setWeatherActivity] = useState("run");
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading] = useState(false);

  const hasRun = useRef(false);

  // --- קריאה נכונה מה־auth ---
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  // --- טעינת todos ---
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

  // שאר הפונקציות (delete, toggle, edit, save) לא השתנו

  const filteredTodos = useMemo(() => {
    let arr = [...todos];
    if (filter.text.trim()) {
      const q = filter.text.toLowerCase();
      arr = arr.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          String(t.id).toLowerCase().includes(q)
      );
    }
    if (filter.completed !== "all") {
      const want = filter.completed === "true";
      arr = arr.filter((t) => !!t.completed === want);
    }
    if (filter.type === "personal") arr = arr.filter((t) => !t.challengeId);
    if (filter.type === "challenge") arr = arr.filter((t) => !!t.challengeId);

    if (sortBy === "title") arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    if (sortBy === "status") arr.sort((a, b) => Number(a.completed) - Number(b.completed));
    if (sortBy === "id") arr.sort((a, b) => String(a.id).localeCompare(String(b.id)));

    return arr;
  }, [todos, filter, sortBy]);

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const completionPercentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  if (!user) return <div className={styles.noUser}>יש להתחבר כדי לראות משימות.</div>;

  return (
    <div className={styles.todoContainer}>
      {/* ...שאר ה־UI נשאר זהה */}
    </div>
  );
}

export default Todos;
