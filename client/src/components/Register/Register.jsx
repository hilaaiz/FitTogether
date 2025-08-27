import React, { useState } from "react";
import styles from "./Register.module.css";
import { Link, useNavigate } from "react-router-dom";
import useLocalStorage from "../../useLocalStorage";

// Icons
import { FaUser, FaEnvelope, FaCity, FaHome, FaRulerVertical, FaWeight, FaHashtag } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

const API = "http://localhost:5000";

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    verifyPassword: "",
    name: "",
    street: "",
    city: "",
    zipcode: "",
    height: "",
    weight: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [, setAuth] = useLocalStorage("auth", { token: null, user: null });

  const handleCheck = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/auth/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username, email: formData.email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Check failed");
      }
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      const { token, user } = await res.json();
      setAuth({ token, user });
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.RegisterPage}>
      <div className={styles.formWrapper}>
        <form onSubmit={step === 1 ? handleCheck : handleRegister}>
          <h1>{step === 1 ? "Register" : "Complete Profile"}</h1>

          {step === 1 && (
            <>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                <FaUser className={styles.icon} />
              </div>

              <div className={styles.inputBox}>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <FaEnvelope className={styles.icon} />
              </div>

              <div className={styles.inputBox}>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <RiLockPasswordFill className={styles.icon} />
              </div>

              <div className={styles.inputBox}>
                <input
                  type="password"
                  placeholder="Verify Password"
                  required
                  value={formData.verifyPassword}
                  onChange={(e) => setFormData({ ...formData, verifyPassword: e.target.value })}
                />
                <RiLockPasswordFill className={styles.icon} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <FaUser className={styles.icon} />
              </div>

              <div className={styles.row}>
                <div className={styles.halfInput}>
                  <div className={styles.inputBox}>
                    <input
                      type="text"
                      placeholder="Street"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    />
                    <FaHome className={styles.icon} />
                  </div>
                </div>
                <div className={styles.halfInput}>
                  <div className={styles.inputBox}>
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                    <FaCity className={styles.icon} />
                  </div>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.halfInput}>
                  <div className={styles.inputBox}>
                    <input
                      type="text"
                      placeholder="Zipcode"
                      value={formData.zipcode}
                      onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                    />
                    <FaHashtag className={styles.icon} />
                  </div>
                </div>
                <div className={styles.halfInput}>
                  <div className={styles.inputBox}>
                    <input
                      type="number"
                      placeholder="Height (cm)"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                    <FaRulerVertical className={styles.icon} />
                  </div>
                </div>
              </div>

              <div className={styles.inputBox}>
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
                <FaWeight className={styles.icon} />
              </div>

              <div className={styles.inputBox}>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="coach">Coach</option>
                </select>
                <FaUser className={styles.icon} />
              </div>
            </>
          )}

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.btn}>
            {step === 1 ? "Next" : "Finish Registration"}
          </button>

          <div className={styles.registerLink}>
            <Link to="/login">Already have an account? Login!</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
