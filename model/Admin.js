import mongoose from "mongoose";
import User from './User.js'
const adminSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  position: { type: String },
  permissions: {
    manageDoctors: { type: Boolean, default: true },
    manageAppointments: { type: Boolean, default: true },
    manageLabReports: { type: Boolean, default: true }
  }
});

module.exports = User.discriminator('admin', adminSchema);