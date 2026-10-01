import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  CheckCircle2,
  Circle,
  AlertOctagon,
  XCircle,
  Clock,
  Calendar,
  Building2,
  Phone,
  ArrowRight,
  QrCode,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_FLOW,
} from '../data/types';

const PatientView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { getReferral, facilities, referrals } = useStore();
  const [inputCode, setInputCode] = useState('');

  // If no code param, show lookup form
  const referral = code ? getReferral(code) : null;
  const destFacility = referral ? facilities.find(f => f.id === referral.destinationFacilityId) : null;

  // Demo: show a default referral if available
  const demoReferrals = referrals.slice(0, 3);

  if (!code) {
    return (
      <PatientShell>
        <div className="text-center py-8">
          <div className="bg-brand-100 p-4 rounded-full inline-flex mb-6">
            <QrCode className="h-10 w-10 text-brand-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Track Your Referral</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your referral code to see your appointment status</p>

          <div className="max-w-xs mx-auto space-y-3">
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. REF-2026-0001"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-mono focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <Link
              to={`/patient/${inputCode || 'REF-2026-0001'}`}
              className="block w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Track Referral
            </Link>
          </div>

          {demoReferrals.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Demo: Quick Access</p>
              <div className="space-y-2 max-w-xs mx-auto">
                {demoReferrals.map(r => (
                  <Link
                    key={r.id}
                    to={`/patient/${r.referralCode}`}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.patientName}</p>
                      <p className="text-xs text-gray-500 font-mono">{r.referralCode}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </PatientShell>
    );
  }

  if (!referral) {
    return (
      <PatientShell>
        <div className="text-center py-12">
          <AlertOctagon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">Referral Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">Please check the referral code and try again.</p>
          <Link to="/patient" className="text-brand-600 font-semibold text-sm hover:underline">
            ← Try Another Code
          </Link>
        </div>
      </PatientShell>
    );
  }

  const sc = STATUS_COLORS[referral.currentStatus];

  // What should the patient do next?
  const getNextStep = () => {
    switch (referral.currentStatus) {
      case 'CREATED': return 'Your referral has been sent. Please wait for the facility to accept it.';
      case 'ACCEPTED': return 'Your referral has been accepted! An appointment will be scheduled soon.';
      case 'APPOINTMENT_SCHEDULED': return `Please visit ${destFacility?.name || 'the facility'} on ${referral.appointmentDate} at ${referral.appointmentTime}.`;
      case 'PATIENT_ARRIVED': return 'You have checked in. Please wait for your consultation.';
      case 'TREATMENT_RECORDED': return 'Your treatment has been recorded. A follow-up may be scheduled.';
      case 'FOLLOW_UP_SCHEDULED': return `Please visit for your follow-up on ${referral.followUpDate}.`;
      case 'FOLLOW_UP_COMPLETED': return 'Your follow-up is complete. The referral will be closed soon.';
      case 'CLOSED': return 'Your referral cycle is complete. Thank you!';
      case 'REJECTED': return 'This referral was not accepted. Please contact your ASHA worker for assistance.';
      case 'CANCELLED': return 'This referral has been cancelled.';
      default: return '';
    }
  };

  return (
    <PatientShell>
      <div className="space-y-6">
        {/* Status Banner */}
        <div className={`${sc.bg} border ${sc.border} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${sc.text}`}>Current Status</span>
            <span className="text-xs text-gray-500 font-mono">{referral.referralCode}</span>
          </div>
          <h2 className={`text-lg font-bold ${sc.text}`}>{STATUS_LABELS[referral.currentStatus]}</h2>
          {referral.isStalled && (
            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
              <AlertOctagon className="h-3 w-3" /> Delayed — Please contact your health worker
            </p>
          )}
        </div>

        {/* Next Step */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">What to do next</h3>
          <p className="text-sm text-gray-700 font-medium">{getNextStep()}</p>
        </div>

        {/* Appointment Details */}
        {referral.appointmentDate && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Appointment
            </h3>
            <p className="text-lg font-bold text-indigo-900">{referral.appointmentDate}</p>
            <p className="text-sm text-indigo-700">Time: {referral.appointmentTime}</p>
          </div>
        )}

        {/* Facility Info */}
        {destFacility && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> Your Facility
            </h3>
            <p className="text-sm font-bold text-gray-900">{destFacility.name}</p>
            <p className="text-xs text-gray-500 mb-2">{destFacility.type} • {destFacility.district}</p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              {destFacility.contactPhone}
            </div>
          </div>
        )}

        {/* Journey Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Your Journey
          </h3>

          <div className="space-y-0">
            {STATUS_FLOW.map((status, i) => {
              const entry = referral.timeline.find(t => t.status === status);
              const isCurrent = referral.currentStatus === status;
              const isCompleted = !!entry && !isCurrent;
              const fColor = STATUS_COLORS[status];

              return (
                <div key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-green-100' :
                      isCurrent ? fColor.bg :
                      'bg-gray-50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : isCurrent ? (
                        <Circle className={`h-4 w-4 ${fColor.text} fill-current`} />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-200' : 'bg-gray-100'}`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-semibold ${
                      isCompleted ? 'text-green-700' :
                      isCurrent ? fColor.text :
                      'text-gray-400'
                    }`}>
                      {STATUS_LABELS[status]}
                    </p>
                    {entry && (
                      <p className="text-[11px] text-gray-400">
                        {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Terminal states */}
            {(referral.currentStatus === 'REJECTED' || referral.currentStatus === 'CANCELLED') && (
              <div className="flex gap-3 mt-2">
                <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-600">{STATUS_LABELS[referral.currentStatus]}</p>
                  {referral.rejectionReason && (
                    <p className="text-xs text-red-500 mt-0.5">{referral.rejectionReason}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[10px] text-gray-400">
            This is a read-only patient view. For questions, contact your ASHA worker.
          </p>
          <p className="text-[10px] text-gray-300 mt-1">SehatSetu • SIH 2026 Prototype</p>
        </div>
      </div>
    </PatientShell>
  );
};

function PatientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Compact header */}
      <header className="bg-gradient-to-r from-brand-600 to-brand-700 text-white sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <span className="font-bold text-lg">SehatSetu</span>
          </div>
          <span className="text-xs text-brand-200 font-medium">Patient Portal</span>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default PatientView;
