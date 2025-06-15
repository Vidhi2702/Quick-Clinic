import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  email: String,
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  labAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

export default mongoose.model("Hospital", hospitalSchema);
