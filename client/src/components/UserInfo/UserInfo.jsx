import styles from "./UserInfo.module.css";
import { useNavigate } from "react-router-dom";

function UserInfo({ user, onEdit }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your profile?"
    );
    if (!confirmDelete) return;

    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      const token = storedAuth?.token;

      const response = await fetch("http://localhost:5000/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        alert("Failed to delete profile: " + err.error);
        return;
      }

      // מחיקה מדויקת של ה־auth
      localStorage.removeItem("auth");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Server error while deleting profile.");
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>User Information</h2>
        <div className={styles.actions}>
          <button className={styles.editButton} onClick={onEdit}>
            Edit Profile
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            Delete Profile
          </button>
        </div>
      </div>

      <div className={styles.modalContent}>
        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Personal Info</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Username:</span>
              <span className={styles.value}>{user.username}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user.email || "Not provided"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Height:</span>
              <span className={styles.value}>
                {user.height ? `${user.height} cm` : "Not provided"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Weight:</span>
              <span className={styles.value}>
                {user.weight ? `${user.weight} kg` : "Not provided"}
              </span>
            </div>
          </div>
        </section>

        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Address</h3>
          <div className={styles.addressBlock}>
            <p>
              {user.street || ""} {user.suite || ""}
            </p>
            <p>
              {user.city || ""} {user.zipcode || ""}
            </p>
          </div>
        </section>

        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Company Info</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Company Name:</span>
              <span className={styles.value}>
                {user.company_name || "Not provided"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Slogan:</span>
              <span className={styles.value}>
                {user.catchPhrase || "Not provided"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Field:</span>
              <span className={styles.value}>{user.bs || "Not provided"}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserInfo;
