// NEW: Global layout with persistent Topbar + Nav Rail
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import styles from "./RoutesLayout.module.css";

export default function RoutesLayout({ setShowInfo }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  // קבלת המשתמש המחובר מ-localStorage
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
    }
  }, [location.pathname]); // רענון קל כשמשנים עמוד

  const userInitial = useMemo(() => {
    const n = user?.username || user?.name || "";
    return n ? n[0].toUpperCase() : "?";
  }, [user]);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    const ok = window.confirm("Are you sure you want to log out?");
    if (!ok) return;
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={styles.layoutRoot}>
      {/* Topbar (קבוע בכל העמודים) */}
      <header className={styles.topbar}>
        <div className={styles.brand} onClick={() => navigate("/home")}>
          <span className={styles.brandIcon} aria-hidden>👟</span>
          <span className={styles.brandText}>FitTogether</span>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.avatar} title={user?.username || "User"}>
            {userInitial}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      {/* Nav Rail לבן (קבוע בכל העמודים) */}
      <nav className={styles.navRail}>
        <button
          className={`${styles.navChip} ${isActive("/home") ? styles.activeChip : ""}`}
          onClick={() => navigate("/home")}
        >
          Home
        </button>
        <button
          className={`${styles.navChip} ${isActive("/todos") ? styles.activeChip : ""}`}
          onClick={() => navigate("/todos")}
        >
          Tasks
        </button>
        <button
          className={`${styles.navChip} ${isActive("/posts") ? styles.activeChip : ""}`}
          onClick={() => navigate("/posts")}
        >
          Posts
        </button>
        <button
          className={`${styles.navChip} ${isActive("/challenges") ? styles.activeChip : ""}`}
          onClick={() => navigate("/challenges")}
        >
          Group challenges
        </button>
        <button
          className={styles.navChip}
          onClick={() => setShowInfo((v) => !v)}
        >
          { /* הכפתור רק פותח/סוגר את המודאל בפרופיל בדפים שמציגים אותו */ }
          Profile
        </button>
      </nav>

      {/* אזור התוכן של הדפים */}
      <main className={styles.pageContent}>
        <Outlet />
      </main>
    </div>
  );
}
