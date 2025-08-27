import styles from "./UserInfo.module.css";
import { useNavigate } from "react-router-dom";

function UserInfo({ user, onEdit }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone and will remove all your data including tasks, posts, and challenges."
    );
    if (!confirmDelete) return;

    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      const token = storedAuth?.token;

      const response = await fetch("http://localhost:5000/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = await response.json();
        alert("Failed to delete profile: " + err.error);
        return;
      }

      localStorage.removeItem("auth");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Server error while deleting profile.");
    }
  };

  // *** שימי לב: אין כאן .modal חיצוני. רק כרטיס התוכן ***
  return (
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>User Profile</h2>
        <div className={styles.actions}>
          <button className={styles.editButton} onClick={onEdit}>
            Edit Profile
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            Delete Account
          </button>
        </div>
      </div>

      <section className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Personal Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Username</span>
            <span className={styles.value}>{user.username || ""}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Role</span>
            <span className={styles.roleBadge} data-role={user.role}>
              {user.role || "user"}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{user.email || ""}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Phone</span>
            <span className={styles.value}>{user.phone || ""}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Height</span>
            <span className={styles.value}>
              {user.height ? `${user.height} cm` : ""}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Weight</span>
            <span className={styles.value}>
              {user.weight ? `${user.weight} kg` : ""}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Address & Location</h3>
        <div className={styles.addressBlock}>
          <p>
            {user.street && user.suite
              ? `${user.street} ${user.suite}`
              : user.street || user.suite}
          </p>
          <p>
            {user.city && user.zipcode
              ? `${user.city}, ${user.zipcode}`
              : user.city || user.zipcode}
          </p>
        </div>

        {(user.geo_lat || user.geo_lng) && (
          <div className={styles.coordinateGrid} style={{ marginTop: "1rem" }}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Latitude</span>
              <span className={styles.value}>{user.geo_lat || ""}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Longitude</span>
              <span className={styles.value}>{user.geo_lng || ""}</span>
            </div>
          </div>
        )}
      </section>

      <section className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Company Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Company Name</span>
            <span className={styles.value}>{user.company_name || ""}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Company Slogan</span>
            <span className={styles.value}>{user.catchPhrase || ""}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Business Field</span>
            <span className={styles.value}>{user.bs || ""}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UserInfo;
