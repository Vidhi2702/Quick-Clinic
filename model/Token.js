import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessToken: String,
  refreshToken: String
}, { timestamps: true });

export default mongoose.model("Token", tokenSchema);
