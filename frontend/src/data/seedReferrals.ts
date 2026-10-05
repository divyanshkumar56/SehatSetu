import type { Referral, Alert, ReferralStatus, TimelineEntry } from './types';

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return hoursAgo(days * 24);
}

function makeTimeline(entries: { status: ReferralStatus; hoursAgo: number; actor: string; notes?: string }[]): TimelineEntry[] {
  return entries.map(e => ({
    status: e.status,
    timestamp: hoursAgo(e.hoursAgo),
    actor: e.actor,
    notes: e.notes,
  }));
}

export function generateSeedReferrals(): Referral[] {

  return [
    // 1. The Main Demo Referral - Ramesh Kumar
    // This starts as CREATED and we will advance it through the UI
    {
      id: 'ref-0124',
      referralCode: 'REF-2026-00124',
      patientName: 'Ramesh Kumar',
      patientAge: 58,
      patientGender: 'Male',
      patientPhone: '9876543210',
      patientVillage: 'Palampur Village',
      referralReason: 'Chest pain / suspected cardiac condition',
      requiredSpecialty: 'Cardiology',
      urgency: 'HIGH',
      referringFacilityId: 'fac-008', // PHC Palampur
      destinationFacilityId: 'fac-003', // District Hospital Palampur
      currentStatus: 'CREATED',
      isStalled: false,
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 0, actor: 'Dr. Rajesh — PHC Palampur', notes: 'Referred for urgent cardiac evaluation' },
      ]),
      createdAt: hoursAgo(0),
      updatedAt: hoursAgo(0),
    },

    // 2. The Stalled Referral - Suresh Kumar
    {
      id: 'ref-0125',
      referralCode: 'REF-2026-00125',
      patientName: 'Suresh Kumar',
      patientAge: 45,
      patientGender: 'Male',
      patientPhone: '9876543211',
      patientVillage: 'Palampur Village',
      referralReason: 'Severe joint pain and swelling',
      requiredSpecialty: 'Orthopedics',
      urgency: 'NORMAL',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-003',
      currentStatus: 'CREATED',
      isStalled: false,
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 48, actor: 'Dr. Rajesh — PHC Palampur', notes: 'Referred for orthopedics consult' },
      ]),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },

    // 3. A recently CLOSED referral for realism in ASHA view
    {
      id: 'ref-0123',
      referralCode: 'REF-2026-00123',
      patientName: 'Sunita Devi',
      patientAge: 32,
      patientGender: 'Female',
      patientPhone: '9876543212',
      patientVillage: 'Palampur Village',
      referralReason: 'High risk pregnancy evaluation',
      requiredSpecialty: 'Obstetrics & Gynecology',
      urgency: 'HIGH',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-002', // CHC Narholi
      currentStatus: 'CLOSED',
      isStalled: false,
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 72, actor: 'Dr. Rajesh — PHC Palampur' },
        { status: 'ACCEPTED', hoursAgo: 71, actor: 'Receiving Facility (CHC Narholi)' },
        { status: 'APPOINTMENT_SCHEDULED', hoursAgo: 70, actor: 'Receiving Facility (CHC Narholi)' },
        { status: 'PATIENT_ARRIVED', hoursAgo: 48, actor: 'Receiving Facility (CHC Narholi)' },
        { status: 'TREATMENT_RECORDED', hoursAgo: 47, actor: 'Dr. Meena (CHC Narholi)', notes: 'Evaluated. Normal vitals. Prescribed supplements.' },
        { status: 'CLOSED', hoursAgo: 46, actor: 'Dr. Meena (CHC Narholi)' },
      ]),
      createdAt: daysAgo(3),
      updatedAt: hoursAgo(46),
    }
  ];
}

export function generateSeedAlerts(referrals: Referral[]): Alert[] {
  const alerts: Alert[] = [];

  // Stalled alerts
  const stalledRefs = referrals.filter(r => r.isStalled);
  stalledRefs.forEach(r => {
    alerts.push({
      id: `alert-stalled-${r.id}`,
      referralId: r.id,
      type: 'STALLED',
      message: `Referral ${r.referralCode} for ${r.patientName} is stalled at "${r.currentStatus}"`,
      severity: r.urgency === 'CRITICAL' ? 'critical' : 'warning',
      isRead: false,
      createdAt: r.stalledSince || hoursAgo(12),
    });
  });

  // Critical referral alert
  const critRefs = referrals.filter(r => r.urgency === 'CRITICAL' && r.currentStatus !== 'CLOSED');
  critRefs.forEach(r => {
    alerts.push({
      id: `alert-critical-${r.id}`,
      referralId: r.id,
      type: 'CRITICAL_REFERRAL',
      message: `Critical referral for ${r.patientName}: ${r.referralReason}`,
      severity: 'critical',
      isRead: false,
      createdAt: r.createdAt,
    });
  });

  // Rejection alert
  const rejectedRefs = referrals.filter(r => r.currentStatus === 'REJECTED');
  rejectedRefs.forEach(r => {
    alerts.push({
      id: `alert-reject-${r.id}`,
      referralId: r.id,
      type: 'REJECTION',
      message: `Referral ${r.referralCode} for ${r.patientName} was rejected by the facility`,
      severity: 'warning',
      isRead: true,
      createdAt: r.updatedAt,
    });
  });

  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
