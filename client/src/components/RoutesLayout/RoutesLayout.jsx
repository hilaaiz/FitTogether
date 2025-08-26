// components/RoutesLayout/RoutesLayout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import styles from "./RoutesLayout.module.css";

function RoutesLayout({ setShowInfo }) {
  const navigate = useNavigate();

  // נטילת המשתמש מה־auth ששמור בלוקאל סטורג’
  const storedAuth = JSON.parse(localStorage.getItem("auth"));
  const token = storedAuth?.token;
  const user = storedAuth?.user;

  const handleLogout = () => {
    localStorage.removeItem("auth"); // נקה גם את המשתמש וגם את ה־token
    navigate("/login");
  };

  const goTo = (path) => {
    if (!token) return navigate("/login");
    navigate(`/${path}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigateBar}>
        <button
          className={`${styles.navButton} ${styles.infoButton}`}
          onClick={() => {
            goTo("home");
            setShowInfo(true);
          }}
        >
          Info
        </button>
        <button
          className={styles.navButton}
          onClick={() => goTo("todos")}
        >
          Todos
        </button>
        <button
          className={styles.navButton}
          onClick={() => goTo("posts")}
        >
          Posts
        </button>
        <button
          className={styles.navButton}
          onClick={() => goTo("challenges")}
        >
          Challenges
        </button>
        <button
          className={`${styles.navButton} ${styles.logoutButton}`}
          onClick={handleLogout}
        >
          LogOut
        </button>
      </div>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default RoutesLayout;
