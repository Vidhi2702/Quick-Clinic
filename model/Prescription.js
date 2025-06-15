import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  notes: String,
  medicines: [String]
}, { timestamps: true });

export default mongoose.model("Prescription", prescriptionSchema);
