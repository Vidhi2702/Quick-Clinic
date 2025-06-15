import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  date: Date,
  timeSlot: String,
  mode: { type: String, enum: ["teleconsultation", "in-person"] },
  status: { type: String, enum: ["booked", "completed", "cancelled"], default: "booked" }
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
