import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

// Khai báo Base URL tập trung để dễ quản lý
const API_BASE_URL = "https://women-s-day-guym.onrender.com/api/users";

const Admin = () => {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullname: '',
    nickname: '',
    age: '',
    userWish: '',
    gender: 'female'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  // 1. Lấy danh sách dữ liệu (Sửa lỗi URL Render)
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/all`);
      setSavedItems(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      fullname: item.fullname,
      nickname: item.nickname || '',
      age: item.age,
      userWish: item.userWish,
      gender: item.gender || 'female'
    });
    setSelectedFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Xử lý Xóa (Sửa URL Localhost thành Render)
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa không? 🌸")) {
      try {
        await axios.delete(`${API_BASE_URL}/delete/${id}`);
        alert("Đã xóa thành công!");
        fetchUsers();
      } catch (err) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  // 3. Xử lý gửi Form (Sửa Logic FormData & URL)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const isChangingFiles = selectedFiles.length > 0;

    if (!editingId || isChangingFiles) {
      if (selectedFiles.length < 10 || selectedFiles.length > 20) {
        alert("🌸 Vui lòng chọn từ 10 đến 20 ảnh đẹp nhất nhé!");
        return;
      }
    }

    setLoading(true);
    const data = new FormData();
    data.append('fullname', formData.fullname);
    data.append('nickname', formData.nickname); 
    data.append('age', Number(formData.age)); // Ép kiểu số để tránh lỗi 500 tại Backend
    data.append('gender', formData.gender);
    data.append('userWish', formData.userWish);
    
    if (isChangingFiles) {
      // Sử dụng Array.from để đảm bảo gửi đúng định dạng mảng cho multer
      Array.from(selectedFiles).forEach(file => {
        data.append('images', file); 
      });
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      
      if (editingId) {
        // Cập nhật (Render URL)
        await axios.put(`${API_BASE_URL}/update/${editingId}`, data, config);
        alert("Cập nhật thành công! ✨");
      } else {
        // Thêm mới (Render URL)
        await axios.post(`${API_BASE_URL}/add`, data, config);
        alert("Thêm mới thành công! 💖");
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      // Hiển thị lỗi chi tiết từ Server
      alert("Lỗi: " + (err.response?.data?.message || "Không thể xử lý dữ liệu"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ fullname: '', nickname: '', age: '', userWish: '', gender: 'female' });
    setSelectedFiles([]);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2 className="admin-title">QUẢN TRỊ NỘI DUNG 🌸</h2>
        <button className="btn-logout-admin" onClick={() => {
            localStorage.clear(); // Xóa sạch session khi thoát
            navigate('/');
        }}>Thoát</button>
      </div>

      <div className="admin-main-content">
        <div className={`admin-column add-column ${editingId ? 'edit-mode-active' : ''}`}>
          <h3>{editingId ? "📝 CHỈNH SỬA" : "➕ THÊM MỚI"}</h3>
          
          <form className="admin-form" onSubmit={handleAddSubmit}>
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Họ và tên</label>
                <input type="text" value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} placeholder="Tên đầy đủ..." required />
              </div>
              <div className="form-group flex-1">
                <label>Biệt danh</label>
                <input type="text" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} placeholder="VD: Bé Gấu..." />
              </div>
            </div>

            <div className="form-group">
              <label>Năm sinh & Giới tính</label>
              <div className="form-row">
                <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="Tuổi..." required />
                <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                  <option value="female">Nữ</option>
                  <option value="male">Nam (Khác)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Lời chúc từ trái tim 💖</label>
              <textarea 
                value={formData.userWish} 
                onChange={(e) => setFormData({...formData, userWish: e.target.value})} 
                placeholder="Hãy viết những lời chúc thật ý nghĩa vào đây nhé..." 
                rows="6"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>{editingId ? "Đổi bộ ảnh (10-20 ảnh)" : "Tải ảnh (10-20 ảnh)"}</label>
              <div className="custom-file-upload">
                <input type="file" multiple onChange={(e) => setSelectedFiles(e.target.files)} required={!editingId} />
                <p>Đã chọn: <strong>{selectedFiles.length}</strong> ảnh</p>
              </div>
            </div>

            <div className="form-buttons">
              <button className="btn-submit" disabled={loading}>
                {loading ? "ĐANG LƯU..." : (editingId ? "CẬP NHẬT THAY ĐỔI ✨" : "LƯU KỶ NIỆM 💖")}
              </button>
              {editingId && <button type="button" className="btn-cancel" onClick={resetForm}>HỦY SỬA</button>}
            </div>
          </form>
        </div>

        <div className="admin-column saves-column">
          <h3>💾 DANH SÁCH ĐÃ LƯU</h3>
          <div className="saved-list">
            {savedItems.length > 0 ? savedItems.map(item => (
              <div key={item._id} className="saved-item">
                <div className="item-info">
                  <p className="item-name">{item.nickname || item.fullname} <small>({item.fullname})</small></p>
                  <p className="item-meta">❤️ {item.likes || 0} lượt tim | 📸 {item.images?.length || 0} ảnh</p>
                </div>
                <div className="item-actions">
                  <button className="btn-edit-sm" onClick={() => handleEdit(item)}>Sửa</button>
                  <button className="btn-delete-sm" onClick={() => handleDelete(item._id)}>Xóa</button>
                </div>
              </div>
            )) : <p style={{textAlign: 'center', padding: '20px', color: '#888'}}>Đang tải dữ liệu từ Render... (Có thể mất 30s) ✨</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;