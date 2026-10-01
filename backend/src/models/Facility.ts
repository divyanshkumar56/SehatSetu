import mongoose, { Document, Schema } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  type: 'SC' | 'PHC' | 'CHC' | 'DH';
  specializations: string[];
  acceptingReferrals: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

const FacilitySchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['SC', 'PHC', 'CHC', 'DH'], required: true },
  specializations: [{ type: String }],
  acceptingReferrals: { type: Boolean, default: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
}, { timestamps: true });

export default mongoose.model<IFacility>('Facility', FacilitySchema);
