import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import UserInfo from "../UserInfo/UserInfo.jsx";
import styles from "./Home.module.css";

function Home({ showInfo, setShowInfo }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; 
    hasRun.current = true;  

    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      const userObj = Array.isArray(parsed) ? parsed[0] : parsed;
      setUser(userObj);
    } else {
      navigate("/login"); // redirect אם אין משתמש
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className={styles.homeContainer}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Welcome, {user.username}
        </h1>
        <p className={styles.welcomeSubtitle}>
          Role: {user.role || "user"}
        </p>
      </div>

      {/* Dashboard */}
      <div className={styles.dashboard}>
        <button onClick={() => navigate("/todos")} className={styles.card}>
          My Todos
        </button>
        <button onClick={() => navigate("/posts")} className={styles.card}>
          My Posts
        </button>
        <button onClick={() => navigate("/challenges")} className={styles.card}>
          Challenges
        </button>
        {user.role === "coach" && (
          <button onClick={() => navigate("/challenges")} className={styles.card}>
            + Create Challenge
          </button>
        )}
      </div>

      {/* User Info Modal */}
      {showInfo && (
        <div className={styles.infoSection}>
          <UserInfo user={user} onClose={() => setShowInfo(false)} />
        </div>
      )}
    </div>
  );
}

export default Home;
