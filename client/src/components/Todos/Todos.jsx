import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Todo.module.css";

/* ===== לוגיקת המלצה ===== */
function activityRecommendation(current) {
  if (!current) return { label: "", level: "neutral" };
  const t = current.temp_c;
  const f = current.feelslike_c;
  const hum = current.humidity;
  const uv = current.uv || 0;
  const precip = current.precip_mm || 0;

  if (precip >= 1 || uv >= 9) return { label: "לא מומלץ לפעילות מאומצת בחוץ", level: "bad" };
  if ((f || t) >= 36 || hum >= 75) return { label: "להליכה קצרה בלבד, לשתות הרבה", level: "warn" };
  if (t >= 12 && t <= 24 && uv <= 7 && precip < 0.5 && hum <= 70)
    return { label: "מצוין לריצה / רכיבה", level: "good" };
  if (t >= 8 && t <= 28 && precip < 0.5)
    return { label: "טוב לאימון חוץ קל / הליכה", level: "ok" };
  return { label: "תנאים בינוניים — העדיפי אימון קצר", level: "neutral" };
}

function WeatherPanel({ locationLabel, weather, loading, onRefresh }) {
  const cur = weather?.current || null;
  const rec = activityRecommendation(cur);
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.weatherCard} ${styles.weatherGlass}`}>
      <div className={styles.weatherHero}>
        {/* צד שמאל: אייקון גדול + מיקום */}
        <div className={styles.weatherIconSide}>
          {cur?.condition?.icon ? (
            <img
              src={`https:${cur.condition.icon}`}
              alt={cur.condition?.text || "weather"}
              className={styles.weatherIconXL}
            />
          ) : (
            <div className={styles.weatherIconPlaceholder}>☁️</div>
          )}
          <div className={styles.weatherLocSmall}>{locationLabel || "Jerusalem, Israel"}</div>
        </div>

        {/* צד ימין: טמפ' גדולה + תיאור */}
        <div className={styles.weatherMainCol}>
          <div className={styles.weatherTempBig}>
            {cur ? `${Math.round(cur.temp_c)}°C` : "—"}
          </div>
          <div className={styles.weatherCond}>
            {cur?.condition?.text || "אין נתונים"}
          </div>
        </div>

        {/* המלצה – יושבת על כל רוחב הגריד (שתי העמודות) ומתחת לאייקון */}
        {rec.label && (
          <div
            className={`${styles.weatherRecoFull} ${
              rec.level === "good" ? styles.recoGood :
              rec.level === "ok"   ? styles.recoOk   :
              rec.level === "warn" ? styles.recoWarn :
              rec.level === "bad"  ? styles.recoBad  : styles.recoNeutral
            }`}
          >
            {rec.label}
          </div>
        )}
      </div>

      {/* כפתורים */}
      <div className={styles.weatherActionsRow}>
        <button className={styles.weatherRefreshBtn} onClick={onRefresh} disabled={loading}>
          {loading ? "↻" : "↻"}
        </button>
        <button
          className={styles.weatherToggleBtn}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "▲" : "▼"}
        </button>
      </div>

      {/* פרטים מתקפלים */}
      {open && cur && (
        <div className={styles.weatherDetailsGrid}>
          <div><span className={styles.weatherLabel}>Feels like</span><span className={styles.weatherValue}>{Math.round(cur.feelslike_c)}°C</span></div>
          <div><span className={styles.weatherLabel}>Humidity</span><span className={styles.weatherValue}>{cur.humidity}%</span></div>
          <div><span className={styles.weatherLabel}>UV</span><span className={styles.weatherValue}>{cur.uv ?? "—"}</span></div>
          <div><span className={styles.weatherLabel}>Precip</span><span className={styles.weatherValue}>{cur.precip_mm} mm</span></div>
          <div><span className={styles.weatherLabel}>Cloud</span><span className={styles.weatherValue}>{cur.cloud}%</span></div>
          <div><span className={styles.weatherLabel}>Dew Point</span><span className={styles.weatherValue}>{cur.dewpoint_c != null ? `${Math.round(cur.dewpoint_c)}°C` : "—"}</span></div>
          <div><span className={styles.weatherLabel}>Pressure</span><span className={styles.weatherValue}>{cur.pressure_mb} mb</span></div>
          <div><span className={styles.weatherLabel}>Updated</span><span className={styles.weatherValue}>{cur.last_updated || "—"}</span></div>
        </div>
      )}
    </div>
  );
}



/* ================== Todos Page ================== */
function Todos() {
  // auth נשמר כ- { token, user } ב-localStorage.auth
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;
  const user = auth?.user;

  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  // filters + sort
  const [filter, setFilter] = useState({
    text: "",
    completed: "all", // "all" | "true" | "false"
    type: "all",      // "all" | "personal" | "challenge"
  });
  const [sortBy, setSortBy] = useState("title"); // "title" | "status" | "id"

  // new todo
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  // edit mode
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editedTodoTitle, setEditedTodoTitle] = useState("");
  const [isSavingTodo, setIsSavingTodo] = useState(false);

  // weather
  const [profileCityLabel, setProfileCityLabel] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const hasRun = useRef(false);

  /* ---- טעינת TODOS מהשרת (גרסה אחידה — רק השרת שלך) ---- */
  useEffect(() => {
    if (!user || !token) return;
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/todos", {
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
    })();
  }, [user, token]);

  /* ---- טעינת פרופיל (לתיוג מיקום) ---- */
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("http://localhost:5000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error(`getMyProfile failed (${r.status})`);
        const j = await r.json();
        const me = j.user;
        const label =
          (me?.city && me.city.trim()) ||
          (me?.geo_lat && me?.geo_lng
            ? `${Number(me.geo_lat).toFixed(4)}, ${Number(me.geo_lng).toFixed(4)}`
            : "Jerusalem, Israel");
        if (!cancelled) setProfileCityLabel(label);
      } catch (e) {
        console.error(e);
        if (!cancelled) setProfileCityLabel("Jerusalem, Israel");
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  /* ---- טעינת מזג אוויר מהשרת שלך ---- */
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch("http://localhost:5000/weather/current/by-user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
        const data = await res.json();
        if (!cancelled) setWeatherData(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function refreshWeatherFromProfile() {
    setWeatherLoading(true);
    try {
      const res = await fetch("http://localhost:5000/weather/current/by-user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
      const data = await res.json();
      setWeatherData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setWeatherLoading(false);
    }
  }

  /* ---------------- פעולות TODOS ---------------- */
  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;
    setIsAddingTodo(true);
    try {
      const res = await fetch("http://localhost:5000/todos", {
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
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete todo");
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

    const body = todo.challengeId
      ? { completed: !todo.completed } // אצלך: משימת אתגר — רק completed
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

  /* ---- פילטור/מיון ---- */
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
      <div className={styles.backgroundElements}>
        <div className={`${styles.bgElement} ${styles.bgElement1}`} />
        <div className={`${styles.bgElement} ${styles.bgElement2}`} />
        <div className={`${styles.bgElement} ${styles.bgElement3}`} />
      </div>

      <div className={styles.content}>
        {/* Header + Weather side-by-side */}
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
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
          </div>

          <div className={styles.headerRight}>
            <WeatherPanel
              locationLabel={profileCityLabel}
              weather={weatherData}
              loading={weatherLoading}
              onRefresh={refreshWeatherFromProfile}
            />
          </div>
        </div>

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
