import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  referralCode: string;
  patientId: mongoose.Types.ObjectId;
  originFacilityId?: mongoose.Types.ObjectId;
  destinationFacilityId: mongoose.Types.ObjectId;
  createdByUserId: mongoose.Types.ObjectId;
  
  referralCategory: 'MATERNAL' | 'PEDIATRIC' | 'TRAUMA' | 'CHRONIC' | 'GENERAL';
  referralReason: string;
  clinicalNotes?: string;
  priorityLevel: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // State Machine
  currentState: 'CREATED' | 'ACCEPTED' | 'REJECTED' | 'APPOINTMENT_SCHEDULED' | 'VISIT_CONFIRMED' | 'TREATMENT_RECORDED' | 'FOLLOW_UP_SCHEDULED' | 'CLOSED' | 'EXPIRED' | 'CANCELLED';
  currentStateEnteredAt: Date;
  
  appointmentDate?: Date;
  treatmentSummary?: string;
  followUpDate?: Date;
  
  isStalled: boolean;
  stalledAt?: Date;
}

const ReferralSchema = new Schema({
  referralCode: { type: String, required: true, unique: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  originFacilityId: { type: Schema.Types.ObjectId, ref: 'Facility' },
  destinationFacilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  referralCategory: { type: String, enum: ['MATERNAL', 'PEDIATRIC', 'TRAUMA', 'CHRONIC', 'GENERAL'], required: true },
  referralReason: { type: String, required: true },
  clinicalNotes: { type: String },
  priorityLevel: { type: String, enum: ['NORMAL', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'NORMAL' },
  
  currentState: { 
    type: String, 
    enum: ['CREATED', 'ACCEPTED', 'REJECTED', 'APPOINTMENT_SCHEDULED', 'VISIT_CONFIRMED', 'TREATMENT_RECORDED', 'FOLLOW_UP_SCHEDULED', 'CLOSED', 'EXPIRED', 'CANCELLED'],
    default: 'CREATED' 
  },
  currentStateEnteredAt: { type: Date, default: Date.now },
  
  appointmentDate: { type: Date },
  treatmentSummary: { type: String },
  followUpDate: { type: Date },
  
  isStalled: { type: Boolean, default: false },
  stalledAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<IReferral>('Referral', ReferralSchema);
