# FitTogether 🏋️‍♀️💪

**FitTogether** is a web-based fitness application that combines **group fitness challenges**, **personal task management**, and **social features** – creating a community-driven and motivating fitness experience.

---

## 🚀 Purpose and Features

- **Group Fitness Challenges** – Coaches create challenges; users join and track progress.
- **Task Management (Todos)** – Personal tasks + auto-generated tasks when joining a challenge.
- **Weather Integration** – Outdoor task recommendations based on live weather data.
- **Social Features** – Post updates, share tips, comment, and engage with the community.
- **Role-Based Access Control**
  - **User**: join challenges, manage tasks, create posts, comment.
  - **Coach**: all user capabilities + create/manage challenges and participants.

---

## 🏗 Architecture

FitTogether follows a **modern three-tier architecture**:

1. **Frontend** – React SPA with React Router for navigation.
2. **Backend** – RESTful API handling authentication and DB access.
3. **Database** – MySQL (`fullstack7_db`) with relational schema for users, challenges, tasks, and social features.

---

## 🔐 Authentication & User Management

- **JWT Authentication** – Tokens stored in `localStorage`.
- **Protected Routes** – Access only with a valid token.
- **RBAC (Role-Based Access Control)** – Permissions tied to the `role` field in the `users` table.

**Login Flow Diagram:**  
![Login Sequence Diagram](./docs/SequenceDiagramLoging.jpg)

---

## ⚙️ Technology Stack

### Frontend
- **React** `^19.1.1` – SPA with component-based architecture.
- **React Router DOM** `^7.7.1` – Client-side routing & protected routes.
- **React Icons** `^5.5.0` – Icon library for UI elements.
- **Vite** `^7.1.0` – Fast build tool with HMR.
- **ESLint** `^9.32.0` – Code linting and quality assurance.

### Backend
- **Node.js / Express** – RESTful API development.
- **JWT** – Token-based authentication.
- **bcrypt** – Password hashing.

### Database
- **MySQL** (`fullstack7_db`) – Core relational database.
- **SQL Scripts** – `create tables.sql` for schema setup.

---

## 🗄 Data Model Highlights

- **Users** – User details + role (user/coach).
- **Challenges** – Fitness challenges with goals and deadlines.
- **Todos** – Personal or challenge-related tasks.
- **Posts & Comments** – Social content hierarchy.

---

## 📊 Dashboard & UI Components

- **Todos** ✅ – Manage personal and challenge tasks.
- **Posts** 📝 – Share updates, tips, and comment.
- **Challenges** 🏆 – Join group challenges.
- **User Profile** 👤 – View and edit profile information.

---

## 📂 Project Structure (High-Level)
FitTogether/
│── client/         # Frontend (React + Vite)
│── server/         # Backend (Node.js + Express)
│── DB/             # MySQL schema & scripts
│── docs/           # Architecture and feature documentation

---

## 🧑‍💻 Project Contributions & Skills Demonstrated

- Fullstack development with **React + Node.js + MySQL**.
- Implementation of **JWT-based authentication** and **role-based access control (RBAC)**.
- **RESTful API** design and integration with local storage.
- Relational DB schema design with **many-to-many** and social content hierarchies.
- Frontend best practices: **ESLint**, component-based design, **React Router**.
- Integration of **weather-based recommendations** for a dynamic UX.

---

## ▶️ Local Setup & Run

```bash
# Frontend setup
cd client
npm install
npm run dev

# Backend setup
cd ../server
npm install
npm start

# Database setup
# Run DB/create tables.sql in MySQL
