// Global layout with persistent Topbar + Nav Rail + Profile Modal (view/edit)
// Profile button ONLY in the Nav Rail (not in the Topbar)
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import styles from "./RoutesLayout.module.css";

// Existing profile components
import UserInfo from "../UserInfo/UserInfo.jsx";
import UserEdit from "../UserInfo/UserEdit.jsx";

export default function RoutesLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [auth, setAuth] = useState(null);
  const user = auth?.user || null;
  const token = auth?.token || null;

  // Profile modal state (global)
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // load current auth on route change (keeps avatar initial fresh)
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      setAuth(JSON.parse(stored));
    } else {
      setAuth(null);
    }
  }, [location.pathname]);

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

  // Open/Close modal
  const openProfile = () => {
    setShowProfile(true);
    setEditMode(false);
  };
  const closeProfile = () => {
    setShowProfile(false);
    setEditMode(false);
  };

  // Save from edit modal (PUT /users/me)
  const handleSave = async (updatedUser) => {
    try {
      const res = await fetch(`http://localhost:5000/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });
      if (!res.ok) {
        const e = await res.text();
        throw new Error(e || "Failed to update user");
      }
      const data = await res.json();
      const nextAuth = { token, user: data.user };
      localStorage.setItem("auth", JSON.stringify(nextAuth));
      setAuth(nextAuth);
      setEditMode(false);
      setShowProfile(true);
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Failed to save profile.");
    }
  };

  return (
    <div className={styles.layoutRoot}>
      {/* Topbar (בלי כפתור פרופיל) */}
      <header className={styles.topbar}>
        <div
          className={styles.brand}
          onClick={() => navigate("/home")}
          role="button"
          tabIndex={0}
        >
          <img 
            src="/favicon-24x24.png" 
            alt="FitTogether logo" 
            className={styles.brandIcon}
            width="24" 
            height="24"
          />
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

      {/* Nav Rail – כאן נמצא כפתור ה-Profile */}
      <nav className={styles.navRail}>
        <button
          className={`${styles.navChip} ${
            isActive("/home") ? styles.activeChip : ""
          }`}
          onClick={() => navigate("/home")}
        >
          Home
        </button>
        <button
          className={`${styles.navChip} ${
            isActive("/todos") ? styles.activeChip : ""
          }`}
          onClick={() => navigate("/todos")}
        >
          Tasks
        </button>
        <button
          className={`${styles.navChip} ${
            isActive("/posts") ? styles.activeChip : ""
          }`}
          onClick={() => navigate("/posts")}
        >
          Posts
        </button>
        <button
          className={`${styles.navChip} ${
            isActive("/challenges") ? styles.activeChip : ""
          }`}
          onClick={() => navigate("/challenges")}
        >
          Group challenges
        </button>
        {/* Profile רק כאן */}
        <button className={styles.navChip} onClick={openProfile}>
          Profile
        </button>
      </nav>

      {/* Page Content */}
      <main className={styles.pageContent}>
        <Outlet />
      </main>

      {/* PROFILE MODAL – גלובלי, זמין בכל דף */}
      {showProfile && (
        <div className={styles.overlay} onClick={closeProfile}>
          <div
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={editMode ? "Edit Profile" : "User Information"}
          >
            {!editMode ? (
              <UserInfo user={user || {}} onEdit={() => setEditMode(true)} />
            ) : (
              <UserEdit
                user={user || {}}
                onClose={() => setEditMode(false)}
                onSave={handleSave}
              />
            )}
            {/* Close X */}
            <button
              className={styles.closeX}
              onClick={closeProfile}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
