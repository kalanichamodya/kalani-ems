const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  nic: { type: String, required: true, unique: true },
  address: { type: String },
  department: {
    type: String,
    enum: ['Sales', 'Tailoring', 'Cashier', 'Management', 'Security', 'Other'],
    required: true
  },
  position: { type: String, required: true },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract'],
    default: 'Full-time'
  },
  basicSalary: { type: Number, required: true },
  joinedDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  dateOfBirth: { type: Date },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);