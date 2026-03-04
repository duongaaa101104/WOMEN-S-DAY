import mongoose from 'mongoose';

const userContentSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  age: { type: Number, required: true },
  images: [{ type: String }],
  gender: { type: String, default: 'female' },
  userWish: String,
  aiWish: String,
  nickname: { type: String },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      author: String, // Tên người bình luận lấy từ Login
      text: String,   // Nội dung bình luận
      createdAt: { type: Date, default: Date.now }
    }
  ],
});

export default mongoose.model('UserContent', userContentSchema);