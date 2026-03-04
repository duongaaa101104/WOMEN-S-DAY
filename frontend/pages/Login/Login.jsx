import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [view, setView] = useState('choice'); 
  const navigate = useNavigate();

  // XỬ LÝ ĐĂNG NHẬP USER (Khách hàng)
  const handleUserLogin = async (e) => {
    e.preventDefault();
    
    // Thu thập dữ liệu từ Form
    const formData = {
      fullname: e.target.fullname.value,
      birthYear: e.target.birthYear.value,
      gender: e.target.gender.value
    };

    try {
      // Gửi yêu cầu lưu Guest vào Backend
      const res = await axios.post('http://localhost:5000/api/users/login-user', formData);
      
      // Lưu thông tin định danh vào localStorage để các tính năng tương tác sử dụng
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role);
      
      // Chuyển hướng về Trang chủ
      navigate('/home');
    } catch (err) {
      console.error("User Login Error:", err);
      alert("Lỗi kết nối Server hoặc không thể lưu thông tin!");
    }
  };

  // XỬ LÝ ĐĂNG NHẬP ADMIN (Quản trị viên)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const account = e.target.account.value;
    const password = e.target.password.value;

    try {
      // Xác thực Admin qua Backend
      const res = await axios.post('http://localhost:5000/api/users/login-admin', { account, password });
      
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role);
      
      // Chuyển hướng về Trang Admin
      navigate('/admin');
    } catch (err) {
      // Hiển thị thông báo lỗi cụ thể từ Server
      alert(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu Admin!");
    }
  };

  return (
    <div className="login-page">
      <AnimatePresence mode="wait">
        {/* BƯỚC 1: CHỌN VAI TRÒ */}
        {view === 'choice' && (
          <motion.div 
            key="choice" 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            className="login-container"
          >
            <h2 className="login-title">CHÀO MỪNG 8/3 🌸</h2>
            <p>Vui lòng chọn vai trò để tiếp tục trải nghiệm</p>
            <div className="btn-group-choice">
              <button className="btn-user" onClick={() => setView('userForm')}>KHÁCH QUA ĐƯỜNG BẤM VÀO ĐÂY</button>
              <button className="btn-admin" onClick={() => setView('adminForm')}>BẠN MUỐN HIỆN LÊN Ư ?</button>
            </div>
          </motion.div>
        )}

        {/* BƯỚC 2A: FORM USER */}
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
                <input name="fullname" type="text" placeholder="Họ và tên của bạn..." required />
              </div>
              <div className="form-group-login">
                <input name="birthYear" type="number" placeholder="Năm sinh (VD: 2000)" required />
              </div>
              <div className="form-group-login">
                <select name="gender" required>
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <button type="submit" className="btn-confirm">XÁC NHẬN & VÀO TRANG CHỦ 🚀</button>
              <p className="back-link" onClick={() => setView('choice')}>← Quay lại lựa chọn</p>
            </form>
          </motion.div>
        )}

        {/* BƯỚC 2B: FORM ADMIN */}
        {view === 'adminForm' && (
          <motion.div 
            key="admin" 
            initial={{ x: -100, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: 100, opacity: 0 }}
            className="login-container"
          >
            <h2>ADMIN LOGIN</h2>
            <form onSubmit={handleAdminLogin}>
              <div className="form-group-login">
                <input name="account" type="text" placeholder="Tài khoản hệ thống" required />
              </div>
              <div className="form-group-login">
                <input name="password" type="password" placeholder="Mật khẩu" required />
              </div>
              <button type="submit" className="btn-confirm admin-btn">ĐĂNG NHẬP HỆ THỐNG</button>
              <p className="back-link" onClick={() => setView('choice')}>← Quay lại lựa chọn</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;