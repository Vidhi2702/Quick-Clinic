import mongoose from "mongoose";

const labReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  testName: String,
  result: String,
  shareWithDoctors: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("LabReport", labReportSchema);
