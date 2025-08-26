import React, { useState } from "react";
import styles from "./Login.module.css";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import useLocalStorage from "../../useLocalStorage";

const API = "http://localhost:5000";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // שינוי: שמירה של token + user במקום רק user
  const [, setAuth] = useLocalStorage("auth", { token: null, user: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // שינוי: הנתיב ל־/auth/login
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Invalid username or password");

      // שינוי: הפענוח כולל token + user
      const { token, user } = await res.json();

      // שינוי: שמירה בלוקאל סטורג׳
      setAuth({ token, user });

      // שינוי: ניווט בלי userId בנתיב
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className={styles.LoginPage}>
      <div className={styles.wrapper}>
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>

          <div className={styles.inputBox}>
            <input
              type="text"
              placeholder="Username"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <FaUser className={styles.icon} />
          </div>

          <div className={styles.inputBox}>
            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <RiLockPasswordFill className={styles.icon} />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn}>
            Login
          </button>

          <div className={styles.registerLink}>
            <Link to="/register">Don't have an account? Sign up!</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
