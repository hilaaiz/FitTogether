import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Todo.module.css";

// --- Weather placeholder (UI מוכן ל־API חיצוני) ---
function WeatherPanel({
  location,
  onChangeLocation,
  activity,
  onChangeActivity,
  weather,
  loading,
}) {
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
  // טעינת משתמש ו־token באותה צורה כמו Home/UserInfo:
  const [user, setUser] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  // filters + sort
  const [filter, setFilter] = useState({
    text: "",
    completed: "all",   // "all" | "true" | "false"
    type: "all",        // "all" | "personal" | "challenge"
  });
  const [sortBy, setSortBy] = useState("title"); // "title" | "status" | "id"

  // new todo
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  // edit mode
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editedTodoTitle, setEditedTodoTitle] = useState("");
  const [isSavingTodo, setIsSavingTodo] = useState(false);

  // weather placeholder state
  const [weatherLoc, setWeatherLoc] = useState("Jerusalem");
  const [weatherActivity, setWeatherActivity] = useState("run");
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading] = useState(false);

  const hasRun = useRef(false);

  // טוען user מה־localStorage באותה צורה כמו Home.jsx
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(Array.isArray(parsed) ? parsed[0] : parsed);
    }
  }, []);

  // טעינת TODOS מהשרת (ה־controller שלך משתמש ב־req.user.id, לכן הנתיב הוא /todos)
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
      // יצירת משימה אישית: השרת כבר מזהה יוזר מה־JWT ומציב challengeId = NULL
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

  const handleDelete = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    if (todo.challengeId) {
      alert("Cannot delete challenge tasks.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/todos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      setTodos((prev) => prev.filter((t) => t.id !== id));
      if (editingTodoId === id) {
        setEditingTodoId(null);
        setEditedTodoTitle("");
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to delete todo");
    }
  };

  const handleToggle = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    // משימת אתגר: מותר לעדכן רק completed
    const body = todo.challengeId
      ? { completed: !todo.completed }
      : { title: todo.title, completed: !todo.completed };

    try {
      const res = await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");

      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to update todo");
    }
  };

  const handleEditTodo = (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    if (todo.challengeId) {
      alert("Challenge tasks title cannot be edited.");
      return;
    }
    setEditingTodoId(id);
    setEditedTodoTitle(todo.title);
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditedTodoTitle("");
  };

  const handleSaveTodo = async (id) => {
    if (!editedTodoTitle.trim()) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo || todo.challengeId) return;

    setIsSavingTodo(true);
    try {
      const res = await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editedTodoTitle.trim(), completed: todo.completed }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: editedTodoTitle.trim() } : t))
      );
      setEditingTodoId(null);
      setEditedTodoTitle("");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to save");
    } finally {
      setIsSavingTodo(false);
    }
  };

  const filteredTodos = useMemo(() => {
    let arr = [...todos];

    // טקסט (כותרת/מזהה)
    if (filter.text.trim()) {
      const q = filter.text.toLowerCase();
      arr = arr.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          String(t.id).toLowerCase().includes(q)
      );
    }

    // סטטוס
    if (filter.completed !== "all") {
      const want = filter.completed === "true";
      arr = arr.filter((t) => !!t.completed === want);
    }

    // סוג: אישי/אתגר
    if (filter.type === "personal") arr = arr.filter((t) => !t.challengeId);
    if (filter.type === "challenge") arr = arr.filter((t) => !!t.challengeId);

    // מיון
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
      {/* רקע דקורטיבי */}
      <div className={styles.backgroundElements}>
        <div className={`${styles.bgElement} ${styles.bgElement1}`} />
        <div className={`${styles.bgElement} ${styles.bgElement2}`} />
        <div className={`${styles.bgElement} ${styles.bgElement3}`} />
      </div>

      <div className={styles.content}>
        {/* כותרת + סטטיסטיקות */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconWrapper}><span className={styles.sparkleIcon}>🏋️‍♀️</span></div>
            <h1 className={styles.mainTitle}>Tasks Dashboard</h1>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.stat}><div className={styles.statNumber}>{completedCount}</div><div className={styles.statLabel}>Completed</div></div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}><div className={styles.statNumber}>{totalCount - completedCount}</div><div className={styles.statLabel}>Active</div></div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}><div className={styles.statNumber}>{completionPercentage}%</div><div className={styles.statLabel}>Progress</div></div>
          </div>

          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Weather helper (UI בלבד בשלב זה) */}
        <WeatherPanel
          location={weatherLoc}
          onChangeLocation={setWeatherLoc}
          activity={weatherActivity}
          onChangeActivity={setWeatherActivity}
          weather={weatherData}
          loading={weatherLoading}
        />

        {/* הוספת משימה אישית */}
        <div className={styles.addTodoSection}>
          <div className={styles.addTodoContainer}>
            <div className={styles.addTodoGroup}>
              <input
                type="text"
                placeholder="Add a personal task (challenge tasks are auto-added when you join)"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                className={styles.addInput}
              />
              <button
                onClick={handleAddTodo}
                disabled={isAddingTodo || !newTodoTitle.trim()}
                className={styles.addButton}
                title="Add personal task"
              >
                {isAddingTodo ? <div className={styles.loadingSpinner}></div> : <span className={styles.plusIcon}>+</span>}
              </button>
            </div>
          </div>
        </div>

        {/* סינון/מיון */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <div className={styles.searchGroup}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by title or #id"
                  value={filter.text}
                  onChange={(e) => setFilter({ ...filter, text: e.target.value })}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.selectGroup}>
                <span className={styles.filterIcon}>📋</span>
                <select
                  value={filter.completed}
                  onChange={(e) => setFilter({ ...filter, completed: e.target.value })}
                  className={styles.filterSelect}
                >
                  <option value="all">All statuses</option>
                  <option value="false">Active</option>
                  <option value="true">Completed</option>
                </select>
              </div>

              <div className={styles.selectGroup}>
                <span className={styles.filterIcon}>🏷️</span>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                  className={styles.filterSelect}
                >
                  <option value="all">All tasks</option>
                  <option value="personal">Personal only</option>
                  <option value="challenge">Challenge only</option>
                </select>
              </div>

              <div className={styles.selectGroup}>
                <span className={styles.sortIcon}>📊</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="title">Sort by Title</option>
                  <option value="status">Sort by Status</option>
                  <option value="id">Sort by ID</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* שגיאות */}
        {!!error && <div className={styles.errorBanner}>⚠️ {error}</div>}

        {/* רשימת משימות */}
        {loaded && filteredTodos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📅</div>
            <p className={styles.emptyTitle}>No tasks to show</p>
            <p className={styles.emptySubtitle}>
              Add a personal task, or join a challenge to see it here.
            </p>
          </div>
        ) : (
          <div className={styles.todoList}>
            {filteredTodos.map((todo, idx) => {
              const isChallenge = !!todo.challengeId;
              const isEditing = editingTodoId === todo.id;
              return (
                <div
                  key={todo.id}
                  className={`${styles.todoItem} ${todo.completed ? styles.completed : ""} ${isEditing ? styles.editing : ""}`}
                  style={{ animationDelay: `${idx * 90}ms` }}
                >
                  <div className={styles.todoContent}>
                    <div className={styles.todoLeft}>
                      <span className={styles.todoId}>#{String(todo.id).slice(0, 8)}</span>
                      <button
                        onClick={() => handleToggle(todo.id)}
                        className={`${styles.checkButton} ${todo.completed ? styles.checked : ""}`}
                        title={todo.completed ? "Mark as active" : "Mark as complete"}
                      >
                        {todo.completed && <span className={styles.checkMark}>✓</span>}
                      </button>
                    </div>

                    <div className={styles.todoMiddle}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedTodoTitle}
                          onChange={(e) => setEditedTodoTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTodo(todo.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className={`${styles.todoTitleInput} ${styles.editingInput}`}
                          autoFocus
                        />
                      ) : (
                        <div className={`${styles.todoTitleDisplay} ${todo.completed ? styles.completedTitle : ""}`}>
                          {todo.title}
                          {isChallenge && (
                            <span
                              className={styles.challengeBadge}
                              title={`Challenge task • ${todo.challengeId}`}
                            >
                              Group Challenge
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.todoActions}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveTodo(todo.id)}
                            disabled={isSavingTodo || !editedTodoTitle.trim()}
                            className={styles.saveButton}
                            title="Save"
                          >
                            {isSavingTodo ? <div className={styles.loadingSpinner}></div> : "💾"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSavingTodo}
                            className={styles.cancelButton}
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditTodo(todo.id)}
                            className={styles.editButton}
                            title={isChallenge ? "Title editing disabled for challenge tasks" : "Edit title"}
                            disabled={isChallenge || editingTodoId !== null}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(todo.id)}
                            className={styles.deleteButton}
                            title={isChallenge ? "Cannot delete challenge tasks" : "Delete task"}
                            disabled={isChallenge || editingTodoId === todo.id}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Todos;
