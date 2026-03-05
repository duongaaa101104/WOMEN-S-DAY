import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from '../pages/Home/Home';
import Admin from '../pages/Admin/Admin';
import Login from '../pages/Login/Login';
import EffectShowcase from '../pages/EffectShowcase/EffectShowcase';
import './index.css';

function App() {
  const [users, setUsers] = useState([]); // State dùng chung cho toàn ứng dụng

  // Lấy dữ liệu một lần duy nhất tại App
  const fetchData = async () => {
    try {
      const res = await axios.get('https://women-s-day-guym.onrender.com/api/users/all');
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu tại App:", err);
    }
  };
//http://localhost:5000/api/users/all
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Truyền users vào Home để hiển thị danh sách */}
        <Route path="/home" element={<Home users={users} setUsers={setUsers} />} />
        
        {/* TRUYỀN USERS VÀO ĐÂY ĐỂ GALAXY CÓ ẢNH */}
        <Route path="/effect-showcase/:id" element={<EffectShowcase users={users} />} />
        
        <Route path="/admin" element={<Admin />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;