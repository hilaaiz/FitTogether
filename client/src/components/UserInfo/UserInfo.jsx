import styles from "./UserInfo.module.css";

function UserInfo({ user, onClose }) {
  return (
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>User Profile</h2>
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>

      <div className={styles.modalContent}>
        {/* Personal Info */}
        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Personal Info</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{user.name || "Not provided"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Username:</span>
              <span className={styles.value}>{user.username || "Not provided"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user.email || "Not provided"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Role:</span>
              <span className={styles.value}>{user.role || "Not provided"}</span>
            </div>
          </div>
        </section>

        {/* Physical Info */}
        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Body Info</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Height:</span>
              <span className={styles.value}>
                {user.height ? `${user.height} cm` : "Not set"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Weight:</span>
              <span className={styles.value}>
                {user.weight ? `${user.weight} kg` : "Not set"}
              </span>
            </div>
          </div>
        </section>

        {/* Address as block */}
        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Address</h3>
          <div className={styles.addressBlock}>
            <p>
              {(user.street || "Not provided") + " " + (user.suite || "")}
            </p>
            <p>
              {(user.city || "Not provided") + " " + (user.zipcode || "")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserInfo;
