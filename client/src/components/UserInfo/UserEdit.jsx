import { useState } from "react";
import styles from "./UserInfo.module.css";

function UserEdit({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    email: user.email || "",
    phone: user.phone || "",
    height: user.height || "",
    weight: user.weight || "",
    street: user.street || "",
    suite: user.suite || "",
    city: user.city || "",
    zipcode: user.zipcode || "",
    geo_lat: user.geo_lat || "",
    geo_lng: user.geo_lng || "",
    company_name: user.company_name || "",
    catchPhrase: user.catchPhrase || "",
    bs: user.bs || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (formData.height && (parseFloat(formData.height) < 0 || parseFloat(formData.height) > 300))
      newErrors.height = "Height must be between 0-300 cm";
    if (formData.weight && (parseFloat(formData.weight) < 0 || parseFloat(formData.weight) > 500))
      newErrors.weight = "Weight must be between 0-500 kg";
    if (formData.zipcode && !/^\d{5,7}$/.test(formData.zipcode))
      newErrors.zipcode = "Zipcode must be 5-7 digits";
    if (formData.geo_lat && (parseFloat(formData.geo_lat) < -90 || parseFloat(formData.geo_lat) > 90))
      newErrors.geo_lat = "Latitude must be between -90 and 90";
    if (formData.geo_lng && (parseFloat(formData.geo_lng) < -180 || parseFloat(formData.geo_lng) > 180))
      newErrors.geo_lng = "Longitude must be between -180 and 180";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!validateForm()) return;
    const dataToSave = {
      ...formData,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      geo_lat: formData.geo_lat ? parseFloat(formData.geo_lat) : null,
      geo_lng: formData.geo_lng ? parseFloat(formData.geo_lng) : null,
    };
    onSave(dataToSave);
  };

  // *** שימי לב: אין כאן .modal חיצוני. רק כרטיס התוכן ***
  return (
    <div className={styles.modalContent}>
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

      <form onSubmit={handleSubmit}>
        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>
          <div className={styles.infoGrid}>
            <div>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              />
              {errors.email && <div className={styles.errorText}>{errors.email}</div>}
            </div>

            <div>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className={styles.input}
              />
            </div>

            <div>
              <input
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                placeholder="Height (cm)"
                min="0"
                max="300"
                step="0.1"
                className={`${styles.input} ${errors.height ? styles.inputError : ""}`}
              />
              {errors.height && <div className={styles.errorText}>{errors.height}</div>}
            </div>

            <div>
              <input
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight (kg)"
                min="0"
                max="500"
                step="0.1"
                className={`${styles.input} ${errors.weight ? styles.inputError : ""}`}
              />
              {errors.weight && <div className={styles.errorText}>{errors.weight}</div>}
            </div>
          </div>
        </section>

        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Address & Location</h3>
          <div className={styles.infoGrid}>
            <div>
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street address"
                className={styles.input}
              />
            </div>

            <div>
              <input
                name="suite"
                value={formData.suite}
                onChange={handleChange}
                placeholder="Apartment/Suite"
                className={styles.input}
              />
            </div>

            <div>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className={styles.input}
              />
            </div>

            <div>
              <input
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                placeholder="Postal code"
                className={`${styles.input} ${errors.zipcode ? styles.inputError : ""}`}
              />
              {errors.zipcode && <div className={styles.errorText}>{errors.zipcode}</div>}
            </div>
          </div>

          <div className={styles.coordinateGrid} style={{ marginTop: "1rem" }}>
            <div className={styles.coordinateField}>
              <input
                name="geo_lat"
                type="number"
                value={formData.geo_lat}
                onChange={handleChange}
                placeholder="Latitude (-90 to 90)"
                min="-90"
                max="90"
                step="0.000001"
                className={`${styles.input} ${errors.geo_lat ? styles.inputError : ""}`}
              />
              {errors.geo_lat && <div className={styles.errorText}>{errors.geo_lat}</div>}
            </div>

            <div className={styles.coordinateField}>
              <input
                name="geo_lng"
                type="number"
                value={formData.geo_lng}
                onChange={handleChange}
                placeholder="Longitude (-180 to 180)"
                min="-180"
                max="180"
                step="0.000001"
                className={`${styles.input} ${errors.geo_lng ? styles.inputError : ""}`}
              />
              {errors.geo_lng && <div className={styles.errorText}>{errors.geo_lng}</div>}
            </div>
          </div>
        </section>

        <section className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Company Information</h3>
          <div className={styles.infoGrid}>
            <div>
              <input
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Company name"
                className={styles.input}
              />
            </div>

            <div>
              <input
                name="catchPhrase"
                value={formData.catchPhrase}
                onChange={handleChange}
                placeholder="Company slogan"
                className={styles.input}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <textarea
                name="bs"
                value={formData.bs}
                onChange={handleChange}
                placeholder="Business field/description"
                className={styles.textarea}
                rows="3"
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

export default UserEdit;
