const hospitalSchema = new Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  googleMapLink: { type: String },
  medicalSpecialties: [{ type: mongoose.Schema.Types.ObjectId, ref: "MedicalSpecialties" }],
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" } 
});
