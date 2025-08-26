import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import UserInfo from "../UserInfo/UserInfo.jsx";
import UserEdit from "../UserInfo/UserEdit.jsx";
import styles from "./Home.module.css";

function Home({ showInfo, setShowInfo }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false); // ← מצב עריכה/צפייה
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
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null;

  // פונקציה שתשמור את השינויים ותעדכן את הסטייט
  const handleSave = async (updatedUser) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const data = await response.json();
      // עדכון ב־state וגם ב־localStorage
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setEditMode(false);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Welcome, {user.username}
        </h1>
        <p className={styles.welcomeSubtitle}>
          Good to see you here
        </p>
      </div>

      {showInfo && (
        <div className={styles.infoSection}>
          {!editMode ? (
            <UserInfo
              user={user}
              onClose={() => setShowInfo(false)}
              onEdit={() => setEditMode(true)} // מעבר למצב עריכה
            />
          ) : (
            <UserEdit
              user={user}
              onClose={() => setEditMode(false)} // ביטול עריכה
              onSave={handleSave} // שמירת שינויים
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
