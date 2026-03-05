import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Login.css';

// URL gốc của Backend trên Render
const API_BASE_URL = "https://women-s-day-guym.onrender.com/api/users"; 

const Login = () => {
  const [view, setView] = useState('choice'); 
  const navigate = useNavigate();

  // XỬ LÝ ĐĂNG NHẬP USER (Khách hàng)
  const handleUserLogin = async (e) => {
    e.preventDefault();
    
    // Thu thập và ép kiểu dữ liệu để tránh lỗi 500 tại Backend
    const formData = {
      fullname: e.target.fullname.value,
      birthYear: Number(e.target.birthYear.value), // Ép kiểu số
      gender: e.target.gender.value
    };

    try {
      // Gửi yêu cầu đến endpoint /login-user
      const res = await axios.post(`${API_BASE_URL}/login-user`, formData);
      
      // Lưu thông tin định danh và vai trò
      localStorage.setItem('username', res.data.username || formData.fullname);
      localStorage.setItem('role', 'guest');
      
      // Chuyển hướng về Trang chủ
      navigate('/home');
    } catch (err) {
      console.error("User Login Error:", err);
      alert(err.response?.data?.message || "Lỗi kết nối Server hoặc không thể lưu thông tin!");
    }
  };

  // XỬ LÝ ĐĂNG NHẬP ADMIN (Quản trị viên)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const account = e.target.account.value;
    const password = e.target.password.value;

    try {
      // Gửi yêu cầu xác thực Admin
      const res = await axios.post(`${API_BASE_URL}/login-admin`, { account, password });
      
      // Lưu thông tin Admin để vượt qua AdminRoute
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', 'admin');
      
      // Chuyển hướng về Trang Admin
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu Admin!");
    }
  };

  return (
    <div className="login-page">
      <AnimatePresence mode="wait">
        {/* Lựa chọn vai trò */}
        {view === 'choice' && (
          <motion.div 
            key="choice" 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            className="login-container"
          >
            <h2 className="login-title">GALAXY 8/3 🌸</h2>
            <p>Chọn vai trò của bạn để khám phá dải ngân hà</p>
            <div className="btn-group-choice">
              <button className="btn-user" onClick={() => setView('userForm')}>KHÁCH THAM QUAN</button>
              <button className="btn-admin" onClick={() => setView('adminForm')}>QUẢN TRỊ VIÊN</button>
            </div>
          </motion.div>
        )}

        {/* Form dành cho Khách */}
        {view === 'userForm' && (
          <motion.div 
            key="user" 
            initial={{ x: 100, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -100, opacity: 0 }}
            className="login-container"
          >
            <h2>THÔNG TIN CỦA BẠN</h2>
            <form onSubmit={handleUserLogin}>
              <div className="form-group-login">
                <input name="fullname" type="text" placeholder="Họ và tên..." required />
              </div>
              <div className="form-group-login">
                <input name="birthYear" type="number" placeholder="Năm sinh (VD: 2004)" required />
              </div>
              <div className="form-group-login">
                <select name="gender" required>
                  <option value="">Giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <button type="submit" className="btn-confirm">XÁC NHẬN VÀO TRANG CHỦ 🚀</button>
              <p className="back-link" onClick={() => setView('choice')}>← Quay lại</p>
            </form>
          </motion.div>
        )}

        {/* Form dành cho Admin */}
        {view === 'adminForm' && (
          <motion.div 
            key="admin" 
            initial={{ x: -100, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: 100, opacity: 0 }}
            className="login-container"
          >
            <h2>QUẢN TRỊ HỆ THỐNG</h2>
            <form onSubmit={handleAdminLogin}>
              <div className="form-group-login">
                <input name="account" type="text" placeholder="Tài khoản" required />
              </div>
              <div className="form-group-login">
                <input name="password" type="password" placeholder="Mật khẩu" required />
              </div>
              <button type="submit" className="btn-confirm admin-btn">ĐĂNG NHẬP ADMIN</button>
              <p className="back-link" onClick={() => setView('choice')}>← Quay lại</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;