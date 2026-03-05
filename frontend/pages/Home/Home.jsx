import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./Home.css";
import FallingPetals from "../FallingPetals/FallingPetals";

// Đảm bảo URL này trỏ chính xác đến Backend trên Render
const API_BASE_URL = "https://women-s-day-guym.onrender.com/api/users"; 

const Home = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [activeCommentUser, setActiveCommentUser] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [currentUser, setCurrentUser] = useState("Khách");

  // Hàm ép link ảnh sang HTTPS để tránh lỗi Mixed Content trên Vercel
  const getSecureUrl = (url) => {
    if (!url) return "";
    return url.replace("http://", "https://");
  };

  const fetchData = async () => {
    try {
      // Gọi đến /all để lấy danh sách người dùng
      const res = await axios.get(`${API_BASE_URL}/all`);
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi kết nối Backend:", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    fetchData();
  }, []);

  const handleLike = async (e, userId) => {
    e.stopPropagation();
    if (currentUser === "Khách") {
      alert("Vui lòng đăng nhập để thả tim!");
      return;
    }
    try {
      // Đã sửa lỗi lặp URL: chỉ dùng ${API_BASE_URL}/like/...
      const res = await axios.patch(
        `${API_BASE_URL}/like/${userId}`,
        { username: currentUser }
      );
      setUsers((prevUsers) => {
        const updated = prevUsers.map((u) => (u._id === userId ? res.data : u));
        return updated.sort((a, b) => b.likes - a.likes);
      });
    } catch (err) {
      console.error("Lỗi thả tim:", err);
      alert("Không thể thả tim, vui lòng kiểm tra kết nối!");
    }
  };

  const handleSendComment = async (userId) => {
    if (currentUser === "Khách") {
      alert("Vui lòng đăng nhập để gửi lời chúc!");
      return;
    }
    if (!commentText.trim()) return;
    try {
      // Đã sửa lỗi lặp URL: chỉ dùng ${API_BASE_URL}/comment/...
      const res = await axios.post(
        `${API_BASE_URL}/comment/${userId}`,
        { author: currentUser, text: commentText }
      );
      
      // Cập nhật state cho cả Popup bình luận và danh sách chính
      setActiveCommentUser(res.data);
      setCommentText("");
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
      alert("Không thể gửi bình luận");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="home-container">
      <FallingPetals />

      {/* Header Bar */}
      <div className="home-top-bar">
        <h1 className="header-title">HAPPY WOMEN'S DAY 8/3</h1>
        <div className="user-controls">
          <div className="user-info-group">
            <div className="user-badge">
              Chào, <span>{currentUser}</span>
            </div>
            {currentUser !== "Khách" && (
              <button className="btn-logout-small" onClick={handleLogout}>
                Thoát
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section: Rank & Top 1 */}
      <div className="hero-section">
        <div className="rank-list">
          <div className="rank-header">
            <h3>Bảng xếp hạng 🏆</h3>
            <span className="rank-subtitle">Top 5 nàng thơ được yêu thích nhất</span>
          </div>
          <div className="rank-items-container">
            {users.slice(0, 5).map((user, index) => (
              <div key={user._id} className={`rank-item rank-${index + 1}`}>
                <div className="rank-info">
                  <span className="rank-number">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                  </span>
                  <span className="rank-name">{user.nickname || user.fullname}</span>
                </div>
                <span className="rank-likes-badge">❤️ {user.likes || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="top-1-section">
          <div className="top-1-card">
            <div className="top-1-glow"></div>
            {users.length > 0 ? (
              <>
                <div className="top-1-badge">NGÔI SAO TỎA SÁNG 👑</div>
                <div className="top-1-content">
                  <p className="top-1-wish">"{users[0].userWish}"</p>
                  <div className="top-1-divider"></div>
                  <small className="top-1-author">{users[0].nickname || users[0].fullname}</small>
                </div>
              </>
            ) : (
              <div className="top-1-empty"><p>Chào mừng bạn đến với Galaxy 8/3! 🌸</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="image-grid">
        {users.map((user) => {
          const hasLiked = user.likedBy?.includes(currentUser);
          return (
            <motion.div
              key={user._id}
              className="image-item"
              whileHover={{ y: -8 }}
              onClick={() => setActiveUser(user)}
            >
              <div className="placeholder-img">
                {user.images && user.images[0] ? (
                  <img src={getSecureUrl(user.images[0])} alt={user.fullname} />
                ) : (
                  <div className="no-img-text"><span>{user.nickname || user.fullname}</span></div>
                )}
              </div>
              <div className="interaction-bar">
                <span className="user-name">{user.nickname || user.fullname}</span>
                <div className="action-group">
                  <div 
                    className={`action-btn like-btn ${hasLiked ? "active" : ""}`} 
                    onClick={(e) => handleLike(e, user._id)}
                  >
                    {hasLiked ? "❤️" : "🤍"} {user.likes || 0}
                  </div>
                  <div 
                    className="action-btn comment-btn" 
                    onClick={(e) => { e.stopPropagation(); setActiveCommentUser(user); }}
                  >
                    💬 {user.comments?.length || 0}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Album Modal */}
      <AnimatePresence>
        {activeUser && (
          <motion.div className="album-fixed-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveUser(null)}>
            <motion.div className="album-modal-content" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Album của {activeUser.nickname || activeUser.fullname}</h2>
                <div className="header-actions">
                  <button className="btn-go-effect" onClick={() => navigate(`/effect-showcase/${activeUser._id}`)}>
                    ✨ Xem Galaxy
                  </button>
                  <button className="btn-close-modal" onClick={() => setActiveUser(null)}>✕</button>
                </div>
              </div>
              <div className="modal-body">
                <div className="ai-wish-box"><p>{activeUser.userWish}</p></div>
                <div className="modal-gallery">
                  {activeUser.images.map((img, i) => (
                    <img key={i} src={getSecureUrl(img)} alt="8/3" />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Popup */}
      <AnimatePresence>
        {activeCommentUser && (
          <motion.div 
            className="comment-popup-overlay" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setActiveCommentUser(null)}
          >
            <motion.div 
              className="comment-popup-content" 
              initial={{ y: 50 }} 
              animate={{ y: 0 }} 
              exit={{ y: 50 }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="popup-header">
                <h3>Lời chúc tới {activeCommentUser.nickname || activeCommentUser.fullname}</h3>
                <button onClick={() => setActiveCommentUser(null)}>✕</button>
              </div>
              <div className="popup-comment-list">
                {activeCommentUser.comments?.length > 0 ? (
                  activeCommentUser.comments.map((c, i) => (
                    <div key={i} className="popup-comment-item">
                      <span className="comment-author">{c.author}:</span>
                      <p className="comment-text">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">Chưa có lời chúc nào. Hãy là người đầu tiên! 🌸</p>
                )}
              </div>
              <div className="popup-input-group">
                <input
                  type="text"
                  placeholder={currentUser === "Khách" ? "Đăng nhập để chúc..." : `Lời chúc từ ${currentUser}...`}
                  value={commentText}
                  disabled={currentUser === "Khách"}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendComment(activeCommentUser._id)}
                />
                <button 
                  disabled={currentUser === "Khách" || !commentText.trim()} 
                  onClick={() => handleSendComment(activeCommentUser._id)}
                >
                  Gửi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;