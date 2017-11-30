import mongoose from 'mongoose'

const User = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  type: { type: Number }
})

export default mongoose.model('user', User)
