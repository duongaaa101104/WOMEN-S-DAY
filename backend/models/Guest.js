import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  birthYear: Number,
  gender: String,
  role: { type: String, default: 'user' },
  lastLogin: { type: Date, default: Date.now }
});

export default mongoose.model('Guest', guestSchema);