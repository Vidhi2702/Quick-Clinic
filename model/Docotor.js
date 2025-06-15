import mongoose from "mongoose";
import User from './User.js'

const doctorSchema = new mongoose.Schema({
  specialization: { type: String, required: true },
  qualifications: [{
    degree: String,
    university: String,
    year: Number
  }],
  licenseNumber: { type: String, required: true },
  yearsOfExperience: { type: Number },
  bio: { type: String },
  consultationFee: { type: Number, required: true },
  hospitals: [{
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    isActive: { type: Boolean, default: true }
  }],
  maxPatientsPerSlot: { type: Number, default: 1 }
});

module.exports = User.discriminator('doctor', doctorSchema);