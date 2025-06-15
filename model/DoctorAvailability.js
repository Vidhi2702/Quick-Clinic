import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  startTime: String,
  endTime: String,
  isHoliday: { type: Boolean, default: false },
  allowedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

const doctorAvailabilitySchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  day: { type: String, enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
  slots: [slotSchema]
}, { timestamps: true });

export default mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
