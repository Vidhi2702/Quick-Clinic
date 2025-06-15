import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: String,
  read: { type: Boolean, default: false },
  type: { type: String, enum: ["appointment", "prescription", "labReport", "general"] }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
