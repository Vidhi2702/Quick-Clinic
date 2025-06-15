import mongoose from "mongoose";
import User from './User.js'

const patientSchema = new mongoose.Schema({
  dateOfBirth: { type: Date },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: String
  }],
  allergies: [String]
});

module.exports = User.discriminator('patient', patientSchema);