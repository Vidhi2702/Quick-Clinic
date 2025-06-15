import mongoose, { Schema } from "mongoose";

const medicalSpecialtySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String } 
});

export default mongoose.model("MedicalSpecialties", medicalSpecialtySchema);
