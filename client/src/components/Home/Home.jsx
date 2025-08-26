import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import UserInfo from "../UserInfo/UserInfo.jsx";
import UserEdit from "../UserInfo/UserEdit.jsx";
import styles from "./Home.module.css";

function Home({ showInfo, setShowInfo }) {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(null);   // כולל token + user
  const [editMode, setEditMode] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      setAuth(parsed);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!auth) return null;
  const { user, token } = auth;

  const handleSave = async (updatedUser) => {
    try {
      const response = await fetch(`http://localhost:5000/users/me`, {
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

      // עדכון גם ב־state וגם בלוקאל סטורג'
      const newAuth = { token, user: data.user };
      setAuth(newAuth);
      localStorage.setItem("auth", JSON.stringify(newAuth));
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
              onEdit={() => setEditMode(true)}
            />
          ) : (
            <UserEdit
              user={user}
              onClose={() => setEditMode(false)}
              onSave={handleSave}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
