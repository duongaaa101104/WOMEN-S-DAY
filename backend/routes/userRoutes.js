import express from 'express';
import UserContent from '../models/UserContent.js';
import { upload } from '../config/cloudinary.js';
import Guest from '../models/Guest.js';

const router = express.Router();

// --- ĐĂNG NHẬP ---
router.post('/login-admin', (req, res) => {
  const { account, password } = req.body;
  if (account === 'admin' && password === '123') {
    res.status(200).json({ message: "Admin đăng nhập thành công", username: "Quản trị viên", role: 'admin' });
  } else {
    res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
  }
});

router.post('/login-user', async (req, res) => {
  try {
    const { fullname, birthYear, gender } = req.body;
    if (!fullname) return res.status(400).json({ message: "Vui lòng nhập tên" });
    const user = await Guest.findOneAndUpdate(
      { fullname },
      { fullname, birthYear: Number(birthYear), gender, lastLogin: Date.now() }, 
      { upsert: true, returnDocument: 'after' }
    );
    res.status(200).json({ message: "Thành công", username: user.fullname, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng nhập" });
  }
});

// --- QUẢN LÝ NỘI DUNG (Hỗ trợ HTTPS cho Vercel) ---
router.post('/add', upload.array('images', 20), async (req, res) => {
  try {
    const { fullname, nickname, age, gender, userWish } = req.body;
    // Tự động chuyển đổi sang HTTPS ngay khi lưu
    const imageUrls = req.files ? req.files.map(file => file.path.replace("http://", "https://")) : [];

    const newUser = new UserContent({
      fullname, nickname,
      age: Number(age),
      gender: gender || 'female',
      userWish,
      images: imageUrls,
    });
    await newUser.save();
    res.status(201).json({ message: "Đã thêm thành công!", data: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lưu dữ liệu", detail: error.message });
  }
});

router.put('/update/:id', upload.array('images', 20), async (req, res) => {
  try {
    const { fullname, nickname, age, userWish, gender } = req.body;
    let updateData = { fullname, nickname, age, userWish, gender };
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path.replace("http://", "https://"));
    }
    const updatedUser = await UserContent.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật" });
  }
});

router.get('/all', async (req, res) => {
  try {
    const users = await UserContent.find().sort({ likes: -1, createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu" });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    await UserContent.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa" });
  }
});

// --- TƯƠNG TÁC ---
router.patch('/like/:id', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await UserContent.findById(req.params.id);
    const hasLiked = user.likedBy.includes(username);
    let update = hasLiked 
      ? { $inc: { likes: -1 }, $pull: { likedBy: username } } 
      : { $inc: { likes: 1 }, $push: { likedBy: username } };

    const updatedUser = await UserContent.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Lỗi like" });
  }
});

router.post('/comment/:id', async (req, res) => {
  try {
    const { author, text } = req.body;
    const user = await UserContent.findByIdAndUpdate(req.params.id, { $push: { comments: { author, text } } }, { returnDocument: 'after' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi bình luận" });
  }
});

export default router;