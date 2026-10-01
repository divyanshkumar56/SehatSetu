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
    // 1. Active - just created
    {
      id: 'ref-001',
      referralCode: 'REF-2026-0001',
      patientName: 'Kamla Devi',
      patientAge: 28,
      patientGender: 'Female',
      patientPhone: '9876543210',
      patientVillage: 'Khirki Village',
      referralReason: 'High-risk pregnancy - previous C-section',
      requiredSpecialty: 'Obstetrics & Gynecology',
      urgency: 'HIGH',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-002',
      currentStatus: 'CREATED',
      isStalled: false,
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 3, actor: 'ASHA Sunita (SC Khirki Village)', notes: 'High-risk pregnancy referral created' },
      ]),
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(3),
    },

    // 2. Accepted, waiting for appointment
    {
      id: 'ref-002',
      referralCode: 'REF-2026-0002',
      patientName: 'Ramesh Kumar',
      patientAge: 55,
      patientGender: 'Male',
      patientPhone: '9876543211',
      patientVillage: 'Sonkh',
      referralReason: 'Uncontrolled blood pressure',
      requiredSpecialty: 'Cardiology',
      urgency: 'HIGH',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-003',
      currentStatus: 'ACCEPTED',
      isStalled: false,
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 48, actor: 'ASHA Sunita (SC Khirki Village)', notes: 'Referred for hypertension management' },
        { status: 'ACCEPTED', hoursAgo: 46, actor: 'Dr. Meena (District Hospital Mathura)', notes: 'Referral accepted. Please schedule appointment.' },
      ]),
      createdAt: daysAgo(2),
      updatedAt: hoursAgo(46),
    },

    // 3. Appointment scheduled
    {
      id: 'ref-003',
      referralCode: 'REF-2026-0003',
      patientName: 'Sunita Sharma',
      patientAge: 32,
      patientGender: 'Female',
      patientPhone: '9876543212',
      patientVillage: 'Chata',
      referralReason: 'Suspected gestational diabetes',
      requiredSpecialty: 'Obstetrics & Gynecology',
      urgency: 'NORMAL',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-002',
      currentStatus: 'APPOINTMENT_SCHEDULED',
      isStalled: false,
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      appointmentTime: '10:30',
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 72, actor: 'ASHA Sunita (SC Khirki Village)', notes: 'GDM screening referral' },
        { status: 'ACCEPTED', hoursAgo: 70, actor: 'Dr. Priya (CHC Narholi)', notes: 'Accepted for OB-GYN evaluation' },
        { status: 'APPOINTMENT_SCHEDULED', hoursAgo: 24, actor: 'Dr. Priya (CHC Narholi)', notes: 'Appointment scheduled for OB-GYN consultation' },
      ]),
      createdAt: daysAgo(3),
      updatedAt: hoursAgo(24),
    },

    // 4. Patient arrived
    {
      id: 'ref-004',
      referralCode: 'REF-2026-0004',
      patientName: 'Raju Yadav',
      patientAge: 8,
      patientGender: 'Male',
      patientPhone: '9876543213',
      patientVillage: 'Govardhan',
      referralReason: 'Persistent high fever in child (>5 days)',
      requiredSpecialty: 'Pediatrics',
      urgency: 'HIGH',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-003',
      currentStatus: 'PATIENT_ARRIVED',
      isStalled: false,
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '09:00',
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 96, actor: 'ASHA Sunita (SC Khirki Village)', notes: 'Child with persistent fever, not responding to medication' },
        { status: 'ACCEPTED', hoursAgo: 94, actor: 'Dr. Amit (District Hospital Mathura)' },
        { status: 'APPOINTMENT_SCHEDULED', hoursAgo: 72, actor: 'Dr. Amit (District Hospital Mathura)', notes: 'Pediatric OPD appointment' },
        { status: 'PATIENT_ARRIVED', hoursAgo: 2, actor: 'Reception (District Hospital Mathura)', notes: 'Patient arrived and checked in' },
      ]),
      createdAt: daysAgo(4),
      updatedAt: hoursAgo(2),
    },

    // 5. Treatment recorded
    {
      id: 'ref-005',
      referralCode: 'REF-2026-0005',
      patientName: 'Priya Verma',
      patientAge: 45,
      patientGender: 'Female',
      patientPhone: '9876543214',
      patientVillage: 'Baldeo',
      referralReason: 'Difficulty in vision - cataract suspected',
      requiredSpecialty: 'Ophthalmology',
      urgency: 'NORMAL',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-003',
      currentStatus: 'TREATMENT_RECORDED',
      isStalled: false,
      appointmentDate: daysAgo(1).split('T')[0],
      appointmentTime: '11:00',
      treatmentNotes: 'Bilateral immature cataract diagnosed. Started on eye drops. Surgery recommended in 3 months.',
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 168, actor: 'ASHA Sunita (SC Khirki Village)' },
        { status: 'ACCEPTED', hoursAgo: 166, actor: 'Dr. Sanjay (District Hospital Mathura)' },
        { status: 'APPOINTMENT_SCHEDULED', hoursAgo: 120, actor: 'Dr. Sanjay (District Hospital Mathura)' },
        { status: 'PATIENT_ARRIVED', hoursAgo: 26, actor: 'Reception (District Hospital Mathura)' },
        { status: 'TREATMENT_RECORDED', hoursAgo: 24, actor: 'Dr. Sanjay (District Hospital Mathura)', notes: 'Bilateral immature cataract. Eye drops prescribed. Follow-up for surgery planning.' },
      ]),
      createdAt: daysAgo(7),
      updatedAt: hoursAgo(24),
    },

    // 6. Stalled referral (created but not accepted for >48 hours)
    {
      id: 'ref-006',
      referralCode: 'REF-2026-0006',
      patientName: 'Meera Bai',
      patientAge: 62,
      patientGender: 'Female',
      patientPhone: '9876543215',
      patientVillage: 'Farah',
      referralReason: 'Chest pain and breathlessness',
      requiredSpecialty: 'Cardiology',
      urgency: 'CRITICAL',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-003',
      currentStatus: 'CREATED',
      isStalled: true,
      stalledSince: hoursAgo(24),
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 72, actor: 'ASHA Sunita (SC Khirki Village)', notes: 'Critical: Elderly patient with chest pain' },
      ]),
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },

    // 7. Stalled - accepted but no appointment for 48+ hours
    {
      id: 'ref-007',
      referralCode: 'REF-2026-0007',
      patientName: 'Arjun Singh',
      patientAge: 35,
      patientGender: 'Male',
      patientPhone: '9876543216',
      patientVillage: 'Naujheel',
      referralReason: 'Road traffic accident - fracture',
      requiredSpecialty: 'Orthopedics',
      urgency: 'HIGH',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-004',
      currentStatus: 'ACCEPTED',
      isStalled: true,
      stalledSince: hoursAgo(12),
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 96, actor: 'ASHA Sunita (SC Khirki Village)', notes: 'Patient has suspected forearm fracture from RTA' },
        { status: 'ACCEPTED', hoursAgo: 72, actor: 'Dr. Anil (Sub-District Hospital Vrindavan)', notes: 'Accepted. Bring X-rays if available.' },
      ]),
      createdAt: daysAgo(4),
      updatedAt: daysAgo(3),
    },

    // 8. Closed referral
    {
      id: 'ref-008',
      referralCode: 'REF-2026-0008',
      patientName: 'Lakshmi Devi',
      patientAge: 25,
      patientGender: 'Female',
      patientPhone: '9876543217',
      patientVillage: 'Mant',
      referralReason: 'Severe anemia in pregnancy (Hb < 7)',
      requiredSpecialty: 'Obstetrics & Gynecology',
      urgency: 'HIGH',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-002',
      currentStatus: 'CLOSED',
      isStalled: false,
      appointmentDate: daysAgo(10).split('T')[0],
      appointmentTime: '09:30',
      treatmentNotes: 'Iron sucrose IV infusion given. Hb improved to 9.2. Oral iron and folic acid continued.',
      followUpDate: daysAgo(3).split('T')[0],
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 360, actor: 'ASHA Sunita (SC Khirki Village)' },
        { status: 'ACCEPTED', hoursAgo: 358, actor: 'Dr. Priya (CHC Narholi)' },
        { status: 'APPOINTMENT_SCHEDULED', hoursAgo: 336, actor: 'Dr. Priya (CHC Narholi)' },
        { status: 'PATIENT_ARRIVED', hoursAgo: 240, actor: 'Reception (CHC Narholi)' },
        { status: 'TREATMENT_RECORDED', hoursAgo: 238, actor: 'Dr. Priya (CHC Narholi)', notes: 'Iron sucrose IV given' },
        { status: 'FOLLOW_UP_SCHEDULED', hoursAgo: 200, actor: 'Dr. Priya (CHC Narholi)', notes: 'Follow-up in 1 week for Hb recheck' },
        { status: 'FOLLOW_UP_COMPLETED', hoursAgo: 72, actor: 'Dr. Priya (CHC Narholi)', notes: 'Hb improved to 9.2' },
        { status: 'CLOSED', hoursAgo: 48, actor: 'Dr. Priya (CHC Narholi)', notes: 'Referral cycle complete. Continue oral supplements.' },
      ]),
      createdAt: daysAgo(15),
      updatedAt: hoursAgo(48),
    },

    // 9. Rejected referral
    {
      id: 'ref-009',
      referralCode: 'REF-2026-0009',
      patientName: 'Mohan Lal',
      patientAge: 70,
      patientGender: 'Male',
      patientPhone: '9876543218',
      patientVillage: 'Shergarh',
      referralReason: 'Suspected TB - persistent cough >2 weeks',
      requiredSpecialty: 'General Medicine',
      urgency: 'NORMAL',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-005',
      currentStatus: 'REJECTED',
      isStalled: false,
      rejectionReason: 'PHC Raya is currently not accepting referrals. Please redirect to CHC Narholi or District Hospital.',
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 120, actor: 'ASHA Sunita (SC Khirki Village)' },
        { status: 'REJECTED', hoursAgo: 118, actor: 'PHC Raya Admin', notes: 'Facility not accepting referrals currently. Suggest CHC Narholi.' },
      ]),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },

    // 10. Follow-up scheduled
    {
      id: 'ref-010',
      referralCode: 'REF-2026-0010',
      patientName: 'Sita Ram',
      patientAge: 40,
      patientGender: 'Male',
      patientPhone: '9876543219',
      patientVillage: 'Raya',
      referralReason: 'Chronic wound not healing',
      requiredSpecialty: 'Surgery',
      urgency: 'NORMAL',
      referringFacilityId: 'fac-008',
      destinationFacilityId: 'fac-002',
      currentStatus: 'FOLLOW_UP_SCHEDULED',
      isStalled: false,
      appointmentDate: daysAgo(5).split('T')[0],
      appointmentTime: '14:00',
      treatmentNotes: 'Wound debridement done. Antibiotics started. Needs follow-up for wound dressing.',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeline: makeTimeline([
        { status: 'CREATED', hoursAgo: 240, actor: 'ASHA Sunita (SC Khirki Village)' },
        { status: 'ACCEPTED', hoursAgo: 238, actor: 'Dr. Ravi (CHC Narholi)' },
        { status: 'APPOINTMENT_SCHEDULED', hoursAgo: 216, actor: 'Dr. Ravi (CHC Narholi)' },
        { status: 'PATIENT_ARRIVED', hoursAgo: 120, actor: 'Reception (CHC Narholi)' },
        { status: 'TREATMENT_RECORDED', hoursAgo: 118, actor: 'Dr. Ravi (CHC Narholi)', notes: 'Wound debridement and antibiotics' },
        { status: 'FOLLOW_UP_SCHEDULED', hoursAgo: 48, actor: 'Dr. Ravi (CHC Narholi)', notes: 'Follow-up for wound dressing change' },
      ]),
      createdAt: daysAgo(10),
      updatedAt: hoursAgo(48),
    },
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
