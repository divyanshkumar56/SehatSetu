import type { Facility, Specialty } from './types';

export const SEED_FACILITIES: Facility[] = [
  {
    id: 'fac-001',
    name: 'PHC Khirki',
    type: 'PHC',
    district: 'Mathura',
    block: 'Farah',
    specialties: ['General Medicine', 'Obstetrics & Gynecology', 'Pediatrics'],
    capabilities: ['Basic Lab', 'Immunization', 'Normal Delivery', 'ANC/PNC'],
    acceptingReferrals: true,
    lat: 27.4800,
    lng: 77.6500,
    contactPhone: '0565-2580100',
    active: true,
  },
  {
    id: 'fac-002',
    name: 'CHC Narholi',
    type: 'CHC',
    district: 'Mathura',
    block: 'Narholi',
    specialties: ['General Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Surgery', 'Orthopedics'],
    capabilities: ['Operation Theatre', 'Blood Bank', 'X-Ray', 'Ultrasound', 'Lab', 'Emergency'],
    acceptingReferrals: true,
    lat: 27.5100,
    lng: 77.6700,
    contactPhone: '0565-2580200',
    active: true,
  },
  {
    id: 'fac-003',
    name: 'District Hospital Palampur',
    type: 'District Hospital',
    district: 'Palampur',
    block: 'Palampur City',
    specialties: [
      'General Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Surgery',
      'Orthopedics', 'Ophthalmology', 'ENT', 'Cardiology', 'Dermatology', 'Dental', 'Emergency Medicine'
    ],
    capabilities: [
      'ICU', 'NICU', 'Operation Theatre', 'Blood Bank', 'CT Scan', 'X-Ray',
      'Ultrasound', 'Pathology Lab', 'Emergency', 'Dialysis', 'Physiotherapy'
    ],
    acceptingReferrals: true,
    lat: 27.4924,
    lng: 77.6737,
    contactPhone: '0565-2501000',
    active: true,
  },
  {
    id: 'fac-004',
    name: 'Sub-District Hospital Vrindavan',
    type: 'Sub-District Hospital',
    district: 'Mathura',
    block: 'Vrindavan',
    specialties: ['General Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Surgery', 'ENT', 'Ophthalmology'],
    capabilities: ['Operation Theatre', 'X-Ray', 'Ultrasound', 'Lab', 'Emergency', 'Blood Storage'],
    acceptingReferrals: true,
    lat: 27.5800,
    lng: 77.7000,
    contactPhone: '0565-2540300',
    active: true,
  },
  {
    id: 'fac-005',
    name: 'PHC Raya',
    type: 'PHC',
    district: 'Mathura',
    block: 'Raya',
    specialties: ['General Medicine', 'Pediatrics'],
    capabilities: ['Basic Lab', 'Immunization', 'OPD'],
    acceptingReferrals: false,
    lat: 27.5600,
    lng: 77.8100,
    contactPhone: '0565-2580400',
    active: true,
  },
  {
    id: 'fac-006',
    name: 'CHC Govardhan',
    type: 'CHC',
    district: 'Mathura',
    block: 'Govardhan',
    specialties: ['General Medicine', 'Obstetrics & Gynecology', 'Orthopedics', 'Dental'],
    capabilities: ['Operation Theatre', 'X-Ray', 'Lab', 'Emergency', 'Normal Delivery'],
    acceptingReferrals: true,
    lat: 27.4970,
    lng: 77.4620,
    contactPhone: '0565-2580500',
    active: true,
  },
  {
    id: 'fac-007',
    name: 'PHC Baldeo',
    type: 'PHC',
    district: 'Mathura',
    block: 'Baldeo',
    specialties: ['General Medicine', 'Obstetrics & Gynecology'],
    capabilities: ['Basic Lab', 'Immunization', 'Normal Delivery', 'ANC/PNC'],
    acceptingReferrals: true,
    lat: 27.4050,
    lng: 77.8200,
    contactPhone: '0565-2580600',
    active: true,
  },
  {
    id: 'fac-008',
    name: 'PHC Palampur',
    type: 'PHC',
    district: 'Palampur',
    block: 'Palampur',
    specialties: ['General Medicine'],
    capabilities: ['Immunization', 'ANC/PNC', 'Health Education', 'Basic Life Support'],
    acceptingReferrals: false,
    lat: 27.4780,
    lng: 77.6480,
    contactPhone: '0565-2580700',
    active: true,
  },
];

export const REFERRING_FACILITY_ID = 'fac-008'; // PHC Palampur

// Haversine distance calculation
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getRecommendedFacilities(specialty: Specialty, baseLat = 27.4780, baseLng = 77.6480) {
  return SEED_FACILITIES
    .filter(f => f.active && f.id !== REFERRING_FACILITY_ID)
    .map(f => ({
      ...f,
      distance: calculateDistance(baseLat, baseLng, f.lat, f.lng),
      hasSpecialty: f.specialties.includes(specialty),
    }))
    .sort((a, b) => {
      // Prefer facilities that have the specialty, accept referrals, and are closer
      if (a.hasSpecialty && !b.hasSpecialty) return -1;
      if (!a.hasSpecialty && b.hasSpecialty) return 1;
      if (a.acceptingReferrals && !b.acceptingReferrals) return -1;
      if (!a.acceptingReferrals && b.acceptingReferrals) return 1;
      return a.distance - b.distance;
    });
}

export const SAMPLE_VILLAGES = [
  'Khirki Village', 'Sonkh', 'Chata', 'Govardhan', 'Baldeo',
  'Farah', 'Naujheel', 'Mant', 'Shergarh', 'Raya'
];

export const REFERRAL_REASONS = [
  'High-risk pregnancy - previous C-section',
  'Severe anemia in pregnancy (Hb < 7)',
  'Suspected gestational diabetes',
  'Persistent high fever in child (>5 days)',
  'Suspected pneumonia in infant',
  'Malnutrition - SAM with complications',
  'Uncontrolled blood pressure',
  'Chest pain and breathlessness',
  'Road traffic accident - fracture',
  'Chronic wound not healing',
  'Difficulty in vision - cataract suspected',
  'Hearing loss in child',
  'Suspected TB - persistent cough >2 weeks',
  'Seizures in child',
  'Dental abscess with swelling',
];
