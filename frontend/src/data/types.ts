// ===== CORE TYPES FOR SEHATSETU =====

export type UserRole = 'referring_facility' | 'receiving_facility' | 'doctor' | 'asha' | 'admin' | 'patient';

export type ReferralStatus =
  | 'CREATED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'APPOINTMENT_SCHEDULED'
  | 'PATIENT_ARRIVED'
  | 'TREATMENT_RECORDED'
  | 'FOLLOW_UP_SCHEDULED'
  | 'FOLLOW_UP_COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export type Urgency = 'NORMAL' | 'HIGH' | 'CRITICAL';

export type Gender = 'Male' | 'Female' | 'Other';

export type Specialty =
  | 'General Medicine'
  | 'Obstetrics & Gynecology'
  | 'Pediatrics'
  | 'Orthopedics'
  | 'Ophthalmology'
  | 'ENT'
  | 'Cardiology'
  | 'Dermatology'
  | 'Dental'
  | 'Surgery'
  | 'Emergency Medicine';

export type FacilityType = 'Sub-Centre' | 'PHC' | 'CHC' | 'Sub-District Hospital' | 'District Hospital';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  district: string;
  block: string;
  specialties: Specialty[];
  capabilities: string[];
  acceptingReferrals: boolean;
  lat: number;
  lng: number;
  contactPhone: string;
  active: boolean;
}

export interface TimelineEntry {
  status: ReferralStatus;
  timestamp: string; // ISO string
  actor: string;
  notes?: string;
}

export interface Referral {
  id: string;
  referralCode: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  patientPhone: string;
  patientVillage: string;
  referralReason: string;
  requiredSpecialty: Specialty;
  urgency: Urgency;
  referringFacilityId: string;
  destinationFacilityId: string;
  currentStatus: ReferralStatus;
  isStalled: boolean;
  stalledSince?: string;
  timeline: TimelineEntry[];
  appointmentDate?: string;
  appointmentTime?: string;
  treatmentNotes?: string;
  followUpDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  referralId: string;
  type: 'STALLED' | 'ESCALATION' | 'REJECTION' | 'CRITICAL_REFERRAL';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  createdAt: string;
}

// Valid status transitions
export const VALID_TRANSITIONS: Record<ReferralStatus, ReferralStatus[]> = {
  CREATED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['APPOINTMENT_SCHEDULED', 'CANCELLED'],
  REJECTED: [],
  APPOINTMENT_SCHEDULED: ['PATIENT_ARRIVED', 'CANCELLED'],
  PATIENT_ARRIVED: ['TREATMENT_RECORDED'],
  TREATMENT_RECORDED: ['FOLLOW_UP_SCHEDULED', 'CLOSED'],
  FOLLOW_UP_SCHEDULED: ['FOLLOW_UP_COMPLETED'],
  FOLLOW_UP_COMPLETED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

export const STATUS_LABELS: Record<ReferralStatus, string> = {
  CREATED: 'Created',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  APPOINTMENT_SCHEDULED: 'Appointment Scheduled',
  PATIENT_ARRIVED: 'Patient Arrived',
  TREATMENT_RECORDED: 'Treatment Recorded',
  FOLLOW_UP_SCHEDULED: 'Follow-up Scheduled',
  FOLLOW_UP_COMPLETED: 'Follow-up Completed',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
};

export const STATUS_FLOW: ReferralStatus[] = [
  'CREATED',
  'ACCEPTED',
  'APPOINTMENT_SCHEDULED',
  'PATIENT_ARRIVED',
  'TREATMENT_RECORDED',
  'FOLLOW_UP_SCHEDULED',
  'FOLLOW_UP_COMPLETED',
  'CLOSED',
];

export const STATUS_COLORS: Record<ReferralStatus, { bg: string; text: string; border: string }> = {
  CREATED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ACCEPTED: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  APPOINTMENT_SCHEDULED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  PATIENT_ARRIVED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  TREATMENT_RECORDED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  FOLLOW_UP_SCHEDULED: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  FOLLOW_UP_COMPLETED: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
};

export const URGENCY_COLORS: Record<Urgency, { bg: string; text: string; border: string }> = {
  NORMAL: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  HIGH: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};
