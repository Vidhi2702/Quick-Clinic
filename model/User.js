import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, enum: ["patient", "doctor", "admin", "labAssistant"], required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
