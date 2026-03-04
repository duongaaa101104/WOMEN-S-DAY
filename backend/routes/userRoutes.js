import express from 'express';
import UserContent from '../models/UserContent.js';
import { upload } from '../config/cloudinary.js';
import Guest from '../models/Guest.js';

const router = express.Router();

// -----------------------------------------------------------
// 1. API HỆ THỐNG (LOGIN & AUTH)
// -----------------------------------------------------------

// API: Đăng nhập Quản trị viên
router.post('/login-admin', (req, res) => {
  const { account, password } = req.body;
  // Thông tin đăng nhập mặc định cho Admin
  if (account === 'admin' && password === '123') {
    res.status(200).json({ 
      message: "Admin đăng nhập thành công", 
      username: "Quản trị viên",
      role: 'admin' 
    });
  } else {
    res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
  }
});

// API: Đăng nhập Khách và lưu lịch sử truy cập
router.post('/login-user', async (req, res) => {
  try {
    const { fullname, birthYear, gender } = req.body;
    if (!fullname) return res.status(400).json({ message: "Vui lòng nhập tên" });

    // Sử dụng returnDocument: 'after' để tránh cảnh báo Deprecated
    const user = await Guest.findOneAndUpdate(
      { fullname: fullname },
      { fullname, birthYear, gender, lastLogin: Date.now() }, 
      { upsert: true, returnDocument: 'after' }
    );

    res.status(200).json({ 
      message: "Đăng nhập thành công", 
      username: user.fullname,
      role: user.role 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lưu thông tin người dùng" });
  }
});

// -----------------------------------------------------------
// 2. API QUẢN LÝ NỘI DUNG (CRUD) - TẬP TRUNG LỜI CHÚC CÁ NHÂN
// -----------------------------------------------------------

// API: Thêm mới thiệp 8/3 (Hỗ trợ tải lên tới 20 ảnh)
router.post('/add', upload.array('images', 20), async (req, res) => {
  try {
    const { fullname, nickname, age, gender, userWish } = req.body;
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const newUser = new UserContent({
      fullname,
      nickname,
      age: Number(age), // ÉP KIỂU SỐ TẠI ĐÂY
      gender: gender || 'female',
      userWish,
      images: imageUrls,
    });

    await newUser.save();
    res.status(201).json({ message: "Đã thêm thành công!", data: newUser });
  } catch (error) {
    console.error("LỖI BACKEND CHI TIẾT:", error); // In lỗi ra Terminal để xem
    res.status(500).json({ message: "Lỗi khi lưu dữ liệu", detail: error.message });
  }
});
// API: Cập nhật thông tin thiệp
router.put('/update/:id', upload.array('images', 20), async (req, res) => {
  try {
    const { fullname, nickname, age, userWish, gender } = req.body;
    let updateData = { fullname, nickname, age, userWish, gender };

    // Nếu có tải ảnh mới lên thì cập nhật lại mảng ảnh
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    const updatedUser = await UserContent.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { returnDocument: 'after' } // Trả về dữ liệu mới nhất cho Admin
    );
    
    if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy đối tượng" });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật" });
  }
});

// API: Xóa thiệp
router.delete('/delete/:id', async (req, res) => {
  try {
    await UserContent.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa" });
  }
});

// API: Lấy toàn bộ danh sách (Sắp xếp theo số lượt thả tim)
router.get('/all', async (req, res) => {
  try {
    const users = await UserContent.find().sort({ likes: -1, createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu" });
  }
});

// -----------------------------------------------------------
// 3. API TƯƠNG TÁC NGƯỜI DÙNG (LIKE & COMMENT)
// -----------------------------------------------------------

// API: Thả tim hoặc Bỏ tim (Định danh theo username)
router.patch('/like/:id', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Cần tên người dùng để thả tim" });

    const user = await UserContent.findById(req.params.id);
    const hasLiked = user.likedBy.includes(username);

    let update = hasLiked 
      ? { $inc: { likes: -1 }, $pull: { likedBy: username } } 
      : { $inc: { likes: 1 }, $push: { likedBy: username } };

    const updatedUser = await UserContent.findByIdAndUpdate(
      req.params.id,
      update,
      { returnDocument: 'after' }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Lỗi xử lý thả tim" });
  }
});

// API: Gửi bình luận/lời chúc công khai
router.post('/comment/:id', async (req, res) => {
  try {
    const { author, text } = req.body;
    if (!text) return res.status(400).json({ message: "Nội dung lời chúc không được để trống" });

    const user = await UserContent.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { author, text } } },
      { returnDocument: 'after' }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi gửi bình luận" });
  }
});

export default router;