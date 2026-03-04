import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState([]); // State lưu danh sách từ DB
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // Quản lý trạng thái Sửa/Thêm mới

  const [formData, setFormData] = useState({
    fullname: '',
    nickname: '', // Biệt danh cho lời chúc thân mật
    age: '',
    userWish: '', // Lời chúc tự viết tay
    gender: 'female'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  // 1. Lấy danh sách dữ liệu từ Backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/all');
      setSavedItems(res.data); // Đã sửa lỗi setUsers thành setSavedItems
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Kích hoạt chế độ Chỉnh sửa
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
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang để sửa
  };

  // 3. Xử lý Xóa đối tượng
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa không? 🌸")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/delete/${id}`);
        alert("Đã xóa thành công!");
        fetchUsers();
      } catch (err) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  // 4. Xử lý gửi Form (Thêm mới hoặc Cập nhật)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const isChangingFiles = selectedFiles.length > 0;

    // Kiểm tra số lượng ảnh (10-20 ảnh)
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
    data.append('age', formData.age);
    data.append('gender', formData.gender);
    data.append('userWish', formData.userWish);
    
    if (isChangingFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        data.append('images', selectedFiles[i]);
      }
    }

    try {
      if (editingId) {
        // Gửi yêu cầu cập nhật
        await axios.put(`http://localhost:5000/api/users/update/${editingId}`, data);
        alert("Cập nhật thành công! ✨");
      } else {
        // Gửi yêu cầu thêm mới
        await axios.post('http://localhost:5000/api/users/add', data);
        alert("Thêm mới thành công! 💖");
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      alert("Lỗi hệ thống: " + (err.response?.data?.message || "Không thể xử lý"));
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
        <button className="btn-logout-admin" onClick={() => navigate('/login')}>Đăng xuất</button>
      </div>

      <div className="admin-main-content">
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
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

        {/* CỘT PHẢI: DANH SÁCH ĐÃ LƯU */}
        <div className="admin-column saves-column">
          <h3>💾 DANH SÁCH ĐÃ LƯU</h3>
          <div className="saved-list">
            {savedItems.map(item => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;