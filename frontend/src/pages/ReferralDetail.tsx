import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertOctagon,
  XCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  FileText,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_FLOW,
  VALID_TRANSITIONS,
  URGENCY_COLORS,
} from '../data/types';
import type { ReferralStatus } from '../data/types';

const ReferralDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReferral, advanceReferral, facilities, role } = useStore();

  const referral = getReferral(id || '');
  const [actionNotes, setActionNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showActionPanel, setShowActionPanel] = useState(true);

  if (!referral) {
    return (
      <div className="text-center py-20">
        <AlertOctagon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-700 mb-2">Referral Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">The referral you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/referrals')} className="text-brand-600 font-semibold text-sm hover:underline">
          ← Back to All Referrals
        </button>
      </div>
    );
  }

  const destFacility = facilities.find(f => f.id === referral.destinationFacilityId);
  const refFacility = facilities.find(f => f.id === referral.referringFacilityId);
  const validNext = VALID_TRANSITIONS[referral.currentStatus] || [];

  const getActorName = () => {
    switch (role) {
      case 'referring_facility': return 'Dr. Rajesh — PHC Palampur';
      case 'receiving_facility': return 'Admin — District Hospital Palampur';
      case 'doctor': return 'Dr. Priya Sharma — Cardiology';
      case 'asha': return 'ASHA Sunita Devi';
      case 'admin': return 'System Administrator';
      case 'patient': return 'Patient';
      default: return 'System';
    }
  };

  const allowedActionsByRole: Record<string, ReferralStatus[]> = {
    referring_facility: ['CANCELLED'],
    receiving_facility: ['ACCEPTED', 'REJECTED', 'APPOINTMENT_SCHEDULED'],
    doctor: ['PATIENT_ARRIVED', 'TREATMENT_RECORDED', 'FOLLOW_UP_SCHEDULED', 'FOLLOW_UP_COMPLETED', 'CLOSED'],
    asha: [],
    admin: [],
    patient: [],
  };

  const roleValidNext = validNext.filter(status => allowedActionsByRole[role]?.includes(status));

  const handleAdvance = (status: ReferralStatus) => {
    const extra: Record<string, string | undefined> = {};
    let notes = actionNotes;

    if (status === 'APPOINTMENT_SCHEDULED') {
      if (!appointmentDate || !appointmentTime) {
        alert('Please select appointment date and time.');
        return;
      }
      extra.appointmentDate = appointmentDate;
      extra.appointmentTime = appointmentTime;
      notes = notes || `Appointment scheduled for ${appointmentDate} at ${appointmentTime}`;
    }

    if (status === 'TREATMENT_RECORDED') {
      if (!treatmentNotes.trim()) {
        alert('Please enter treatment notes.');
        return;
      }
      extra.treatmentNotes = treatmentNotes;
      notes = treatmentNotes;
    }

    if (status === 'FOLLOW_UP_SCHEDULED') {
      if (!followUpDate) {
        alert('Please select follow-up date.');
        return;
      }
      extra.followUpDate = followUpDate;
      notes = notes || `Follow-up scheduled for ${followUpDate}`;
    }

    if (status === 'REJECTED') {
      if (!rejectReason.trim()) {
        alert('Please provide a rejection reason.');
        return;
      }
      extra.rejectionReason = rejectReason;
      notes = rejectReason;
    }

    const success = advanceReferral(referral.id, status, getActorName(), notes || STATUS_LABELS[status], extra);
    if (success) {
      setActionNotes('');
      setAppointmentDate('');
      setAppointmentTime('');
      setFollowUpDate('');
      setTreatmentNotes('');
      setRejectReason('');
    } else {
      alert('This transition is not allowed.');
    }
  };

  const sc = STATUS_COLORS[referral.currentStatus];

  // Determine which steps in the flow are completed
  const isTerminal = ['CLOSED', 'CANCELLED', 'REJECTED'].includes(referral.currentStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{referral.referralCode}</h1>
              {referral.isStalled && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertOctagon className="h-3 w-3" /> STALLED
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Created {new Date(referral.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${sc.bg} ${sc.text} ${sc.border} border`}>
          {STATUS_LABELS[referral.currentStatus]}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Info + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center uppercase tracking-wider">
              <User className="h-4 w-4 mr-2 text-brand-600" /> Patient Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="Name" value={referral.patientName} />
              <InfoRow label="Age / Gender" value={`${referral.patientAge} yrs • ${referral.patientGender}`} />
              <InfoRow label="Phone" value={`+91 ${referral.patientPhone}`} icon={<Phone className="h-3.5 w-3.5 text-gray-400" />} />
              <InfoRow label="Village" value={referral.patientVillage} icon={<MapPin className="h-3.5 w-3.5 text-gray-400" />} />
              <InfoRow label="Urgency" value={referral.urgency} badge={URGENCY_COLORS[referral.urgency]} />
              <InfoRow label="Specialty" value={referral.requiredSpecialty} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <InfoRow label="Referral Reason" value={referral.referralReason} fullWidth />
            </div>
          </div>

          {/* Facility Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center uppercase tracking-wider">
              <Building2 className="h-4 w-4 mr-2 text-brand-600" /> Facility Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Referring Facility</p>
                <p className="text-sm font-semibold text-gray-800">{refFacility?.name || 'SC Khirki Village'}</p>
                <p className="text-xs text-gray-500">{refFacility?.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Destination Facility</p>
                <p className="text-sm font-semibold text-gray-800">{destFacility?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{destFacility?.type} • {destFacility?.district}</p>
              </div>
            </div>
            {referral.appointmentDate && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-brand-500" />
                  <span className="font-semibold text-gray-800">Appointment:</span>
                  <span className="text-gray-600">{referral.appointmentDate} at {referral.appointmentTime}</span>
                </div>
              </div>
            )}
            {referral.treatmentNotes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-brand-500 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800">Treatment Notes:</span>
                    <p className="text-gray-600 mt-0.5">{referral.treatmentNotes}</p>
                  </div>
                </div>
              </div>
            )}
            {referral.followUpDate && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold text-gray-800">Follow-up Date:</span>
                  <span className="text-gray-600">{referral.followUpDate}</span>
                </div>
              </div>
            )}
            {referral.rejectionReason && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-start gap-2 text-sm bg-red-50 p-3 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <span className="font-semibold text-red-700">Rejection Reason:</span>
                    <p className="text-red-600 mt-0.5">{referral.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visual Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center uppercase tracking-wider">
              <Clock className="h-4 w-4 mr-2 text-brand-600" /> Referral Journey
            </h3>

            {/* Flow Visualization */}
            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
              {STATUS_FLOW.map((status, i) => {
                const completed = referral.timeline.some(t => t.status === status);
                const isCurrent = referral.currentStatus === status;
                const fColor = STATUS_COLORS[status];
                return (
                  <React.Fragment key={status}>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${
                      isCurrent ? `${fColor.bg} ${fColor.text} ring-2 ring-offset-1 ring-current` :
                      completed ? 'bg-green-50 text-green-600' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {completed && !isCurrent && <CheckCircle2 className="h-3 w-3" />}
                      {isCurrent && <Circle className="h-3 w-3 fill-current" />}
                      {STATUS_LABELS[status].replace('Scheduled', 'Sched.').replace('Recorded', 'Rec.').replace('Completed', 'Done')}
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`w-4 h-0.5 shrink-0 ${completed && referral.timeline.some(t => t.status === STATUS_FLOW[i + 1]) ? 'bg-green-300' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Detailed Timeline */}
            <div className="space-y-0">
              {referral.timeline.map((entry, i) => {
                const eColor = STATUS_COLORS[entry.status];
                const isLast = i === referral.timeline.length - 1;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isLast ? eColor.bg : 'bg-green-50'}`}>
                        {isLast ? (
                          entry.status === 'REJECTED' || entry.status === 'CANCELLED'
                            ? <XCircle className={`h-4 w-4 ${eColor.text}`} />
                            : <Circle className={`h-4 w-4 ${eColor.text} fill-current`} />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {i < referral.timeline.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-bold ${isLast ? eColor.text : 'text-gray-800'}`}>
                        {STATUS_LABELS[entry.status]}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{entry.actor}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-gray-600 mt-1 bg-gray-50 px-3 py-2 rounded-lg">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          {/* Actions Panel */}
          {!isTerminal && roleValidNext.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
              <button
                onClick={() => setShowActionPanel(!showActionPanel)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Actions</h3>
                {showActionPanel ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {showActionPanel && (
                <div className="space-y-4">
                  {/* Accept */}
                  {roleValidNext.includes('ACCEPTED') && (
                    <div className="space-y-2">
                      <textarea
                        value={actionNotes}
                        onChange={e => setActionNotes(e.target.value)}
                        placeholder="Optional notes..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-16 focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <button
                        onClick={() => handleAdvance('ACCEPTED')}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                      >
                        ✓ Accept Referral
                      </button>
                    </div>
                  )}

                  {/* Reject */}
                  {roleValidNext.includes('REJECTED') && (
                    <div className="space-y-2">
                      <select
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-red-50"
                      >
                        <option value="">Select reason...</option>
                        <option value="Cardiology service unavailable currently">Cardiology service unavailable currently</option>
                        <option value="No beds available">No beds available</option>
                        <option value="Specialist on leave">Specialist on leave</option>
                      </select>
                      {rejectReason && (
                        <div className="mt-2">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Suggest Alternative Facility</label>
                          <select
                            onChange={e => {
                              if (e.target.value) {
                                setRejectReason(rejectReason.split(' - Suggested alternative:')[0] + ' - Suggested alternative: ' + e.target.value);
                              }
                            }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                          >
                            <option value="">None</option>
                            {facilities.filter(f => f.id !== referral.destinationFacilityId && f.acceptingReferrals).map(f => (
                              <option key={f.id} value={f.name}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <button
                        onClick={() => handleAdvance('REJECTED')}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 rounded-lg text-sm border border-red-200 transition-colors"
                      >
                        ✗ Send Alternative Recommendation
                      </button>
                    </div>
                  )}

                  {/* Schedule Appointment */}
                  {roleValidNext.includes('APPOINTMENT_SCHEDULED') && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600">Schedule Appointment</label>
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={e => setAppointmentDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <input
                        type="time"
                        value={appointmentTime}
                        onChange={e => setAppointmentTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <button
                        onClick={() => handleAdvance('APPOINTMENT_SCHEDULED')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                      >
                        📅 Schedule Appointment
                      </button>
                    </div>
                  )}

                  {/* Patient Arrived */}
                  {roleValidNext.includes('PATIENT_ARRIVED') && (
                    <button
                      onClick={() => handleAdvance('PATIENT_ARRIVED')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      🏥 Mark Patient Arrived
                    </button>
                  )}

                  {/* Record Treatment */}
                  {roleValidNext.includes('TREATMENT_RECORDED') && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600">Treatment Notes</label>
                      <textarea
                        value={treatmentNotes}
                        onChange={e => setTreatmentNotes(e.target.value)}
                        placeholder="Describe the treatment provided..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-24 focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <button
                        onClick={() => handleAdvance('TREATMENT_RECORDED')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                      >
                        📝 Record Treatment
                      </button>
                    </div>
                  )}

                  {/* Schedule Follow-up */}
                  {roleValidNext.includes('FOLLOW_UP_SCHEDULED') && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600">Follow-up Date</label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={e => setFollowUpDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <button
                        onClick={() => handleAdvance('FOLLOW_UP_SCHEDULED')}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                      >
                        🔄 Schedule Follow-up
                      </button>
                    </div>
                  )}

                  {/* Complete Follow-up */}
                  {roleValidNext.includes('FOLLOW_UP_COMPLETED') && (
                    <div className="space-y-2">
                      <textarea
                        value={actionNotes}
                        onChange={e => setActionNotes(e.target.value)}
                        placeholder="Follow-up notes..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-16 focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <button
                        onClick={() => handleAdvance('FOLLOW_UP_COMPLETED')}
                        className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                      >
                        ✅ Complete Follow-up
                      </button>
                    </div>
                  )}

                  {/* Close */}
                  {roleValidNext.includes('CLOSED') && (
                    <button
                      onClick={() => handleAdvance('CLOSED')}
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      🔒 Close Referral
                    </button>
                  )}

                  {/* Cancel */}
                  {roleValidNext.includes('CANCELLED') && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this referral?')) {
                          handleAdvance('CANCELLED');
                        }
                      }}
                      className="w-full bg-white hover:bg-gray-50 text-gray-500 font-medium py-2 rounded-lg text-xs border border-gray-200 transition-colors"
                    >
                      Cancel Referral
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Patient QR Link */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Patient Tracking QR</h3>
            <div className="bg-white p-3 rounded-xl inline-block mb-3 shadow-sm border border-gray-100">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/patient/' + referral.referralCode)}`} 
                alt="Patient Tracking QR Code"
                className="w-32 h-32 mx-auto"
              />
            </div>
            <p className="text-xs text-gray-500 mb-4 px-2">Print or share this code with the patient so they can track their referral.</p>
            <button
              onClick={() => navigate(`/patient/${referral.referralCode}`)}
              className="w-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold py-2.5 rounded-lg text-sm border border-brand-200 transition-colors flex items-center justify-center gap-2"
            >
              Simulate Patient View <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoRow({ label, value, icon, badge, fullWidth }: {
  label: string; value: string; icon?: React.ReactNode; badge?: { bg: string; text: string };
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon}
        {badge ? (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>{value}</span>
        ) : (
          <p className="text-sm font-medium text-gray-800">{value}</p>
        )}
      </div>
    </div>
  );
}

export default ReferralDetail;
