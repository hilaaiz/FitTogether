import { useState } from "react";
import styles from "./UserInfo.module.css";

function UserEdit({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
    height: user.height || "",
    weight: user.weight || "",
    street: user.street || "",
    suite: user.suite || "",
    city: user.city || "",
    zipcode: user.zipcode || "",
    company_name: user.company_name || "",
    catchPhrase: user.catchPhrase || "",
    bs: user.bs || ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Edit Profile</h2>
        <div className={styles.actions}>
          <button className={styles.saveButton} onClick={handleSubmit}>
            Save Changes
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>

      <form className={styles.modalContent} onSubmit={handleSubmit}>
        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Personal Info</h3>
          <div className={styles.infoGrid}>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className={styles.input}
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={styles.input}
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
              className={styles.input}
            />
            <input
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="Height"
              className={styles.input}
            />
            <input
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Weight"
              className={styles.input}
            />
          </div>
        </section>

        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Address</h3>
          <div className={styles.infoGrid}>
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Street"
              className={styles.input}
            />
            <input
              name="suite"
              value={formData.suite}
              onChange={handleChange}
              placeholder="Suite"
              className={styles.input}
            />
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className={styles.input}
            />
            <input
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              placeholder="Zipcode"
              className={styles.input}
            />
          </div>
        </section>

        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Company Info</h3>
          <div className={styles.infoGrid}>
            <input
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Company Name"
              className={styles.input}
            />
            <input
              name="catchPhrase"
              value={formData.catchPhrase}
              onChange={handleChange}
              placeholder="Slogan"
              className={styles.input}
            />
            <input
              name="bs"
              value={formData.bs}
              onChange={handleChange}
              placeholder="Field"
              className={styles.input}
            />
          </div>
        </section>
      </form>
    </div>
  );
}

export default UserEdit;
