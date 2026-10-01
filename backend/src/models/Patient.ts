import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'OTHER';
  phone?: string;
  address: {
    village: string;
    block: string;
    district: string;
  };
  abhaId?: string; // Ayushman Bharat Health Account ID
}

const PatientSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['M', 'F', 'OTHER'], required: true },
  phone: { type: String },
  address: {
    village: { type: String },
    block: { type: String },
    district: { type: String },
  },
  abhaId: { type: String }
}, { timestamps: true });

export default mongoose.model<IPatient>('Patient', PatientSchema);
