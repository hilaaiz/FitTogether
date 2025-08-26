// App.jsx
import React, { useState } from 'react';
import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom';

import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Home from './components/Home/Home';
import Todos from './components/Todos/Todos';
import Posts from './components/Posts/Posts';
import RoutesLayout from './components/RoutesLayout/RoutesLayout';
import Challenges from './components/Challenges/Challenges';

function App() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RoutesLayout setShowInfo={setShowInfo} />}>
        <Route path="/home" element={<Home showInfo={showInfo} setShowInfo={setShowInfo} />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:postId" element={<Posts />} />
        <Route path="/challenges" element={<Challenges />} />
      </Route>
    </Routes>
  );
}

export default App;
