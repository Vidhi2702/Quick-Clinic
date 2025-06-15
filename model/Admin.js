import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  role: { type: String, enum: ['admin'], default: 'admin' }
});

export default mongoose.model("Admin", adminSchema);
