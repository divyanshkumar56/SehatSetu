import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  User,
  FileText,
  MapPin,
  Building2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Printer,
  Home,
  Copy,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../store/useStore';
import { getRecommendedFacilities, REFERRAL_REASONS, SAMPLE_VILLAGES } from '../data/seedData';
import type { Specialty, Urgency, Gender } from '../data/types';

type Step = 'form' | 'facility' | 'success';

const SPECIALTIES: Specialty[] = [
  'General Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Orthopedics',
  'Ophthalmology', 'ENT', 'Cardiology', 'Dermatology', 'Dental', 'Surgery', 'Emergency Medicine',
];

const CreateReferral: React.FC = () => {
  const navigate = useNavigate();
  const { createReferral, facilities: allFacilities } = useStore();

  const [step, setStep] = useState<Step>('form');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<Gender>('Female');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientVillage, setPatientVillage] = useState('');
  const [referralReason, setReferralReason] = useState('');
  const [requiredSpecialty, setRequiredSpecialty] = useState<Specialty>('General Medicine');
  const [urgency, setUrgency] = useState<Urgency>('NORMAL');

  // Result
  const [createdReferral, setCreatedReferral] = useState<{ referralCode: string; facilityName: string } | null>(null);

  const recommendedFacilities = getRecommendedFacilities(requiredSpecialty);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!patientName.trim()) errs.patientName = 'Patient name is required';
    if (!patientAge || parseInt(patientAge) < 0 || parseInt(patientAge) > 120) errs.patientAge = 'Enter a valid age (0-120)';
    if (!patientPhone || patientPhone.length < 10) errs.patientPhone = 'Enter a valid 10-digit phone number';
    if (!patientVillage.trim()) errs.patientVillage = 'Village/address is required';
    if (!referralReason.trim()) errs.referralReason = 'Referral reason is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setStep('facility');
    }
  };

  const handleSelectFacility = (facilityId: string) => {
    const facility = allFacilities.find(f => f.id === facilityId) || recommendedFacilities.find(f => f.id === facilityId);
    if (!facility) return;

    const referral = createReferral({
      patientName: patientName.trim(),
      patientAge: parseInt(patientAge),
      patientGender,
      patientPhone: patientPhone.trim(),
      patientVillage: patientVillage.trim(),
      referralReason: referralReason.trim(),
      requiredSpecialty,
      urgency,
      referringFacilityId: 'fac-008',
      destinationFacilityId: facilityId,
    });

    setCreatedReferral({
      referralCode: referral.referralCode,
      facilityName: facility.name,
    });
    setStep('success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    if (createdReferral) {
      navigator.clipboard.writeText(createdReferral.referralCode);
    }
  };

  // ===== STEP 1: PATIENT FORM =====
  if (step === 'form') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">New Referral</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-xs font-semibold text-brand-700">Patient Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-xs font-medium text-gray-400">Select Facility</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-xs font-medium text-gray-400">Done</span>
          </div>
        </div>

        <form onSubmit={handleNext} className="space-y-5">
          {/* Patient Info */}
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center uppercase tracking-wider">
              <User className="h-4 w-4 mr-2 text-brand-600" /> Patient Details
            </h2>
            <div className="space-y-4">
              <FieldGroup label="Full Name" error={errors.patientName}>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="e.g. Kamla Devi"
                  className="input-field"
                />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Age" error={errors.patientAge}>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={e => setPatientAge(e.target.value)}
                    placeholder="Years"
                    min="0"
                    max="120"
                    className="input-field"
                  />
                </FieldGroup>
                <FieldGroup label="Gender">
                  <select value={patientGender} onChange={e => setPatientGender(e.target.value as Gender)} className="input-field bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </FieldGroup>
              </div>

              <FieldGroup label="Phone Number" error={errors.patientPhone}>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 text-sm">+91</span>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="input-field pl-12"
                  />
                </div>
              </FieldGroup>

              <FieldGroup label="Village / Address" error={errors.patientVillage}>
                <input
                  type="text"
                  value={patientVillage}
                  onChange={e => setPatientVillage(e.target.value)}
                  placeholder="e.g. Khirki Village"
                  list="villages"
                  className="input-field"
                />
                <datalist id="villages">
                  {SAMPLE_VILLAGES.map(v => <option key={v} value={v} />)}
                </datalist>
              </FieldGroup>
            </div>
          </div>

          {/* Clinical Info */}
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center uppercase tracking-wider">
              <FileText className="h-4 w-4 mr-2 text-brand-600" /> Clinical Context
            </h2>
            <div className="space-y-4">
              <FieldGroup label="Referral Reason" error={errors.referralReason}>
                <select
                  value={referralReason}
                  onChange={e => setReferralReason(e.target.value)}
                  className="input-field bg-white"
                >
                  <option value="">Select reason...</option>
                  {REFERRAL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </FieldGroup>

              <FieldGroup label="Required Specialty">
                <select
                  value={requiredSpecialty}
                  onChange={e => setRequiredSpecialty(e.target.value as Specialty)}
                  className="input-field bg-white"
                >
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FieldGroup>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Urgency / Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['NORMAL', 'HIGH', 'CRITICAL'] as Urgency[]).map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      className={`py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${
                        urgency === u
                          ? u === 'NORMAL' ? 'bg-green-50 border-green-500 text-green-700'
                          : u === 'HIGH' ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'bg-red-50 border-red-500 text-red-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {u === 'NORMAL' ? '🟢 Normal' : u === 'HIGH' ? '🟡 High Risk' : '🔴 Critical'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3.5 rounded-xl shadow-md shadow-brand-500/20 flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
          >
            Find Nearest Facilities <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    );
  }

  // ===== STEP 2: FACILITY SELECTION =====
  if (step === 'facility') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => setStep('form')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold text-gray-900">Select Facility</h1>
            <p className="text-xs text-gray-500">Based on {requiredSpecialty} & distance</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-gray-400">Patient Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-brand-300" />
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-xs font-semibold text-brand-700">Select Facility</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-xs font-medium text-gray-400">Done</span>
          </div>
        </div>

        {/* Patient Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="bg-brand-100 p-2 rounded-lg">
            <User className="h-4 w-4 text-brand-600" />
          </div>
          <div className="text-sm">
            <span className="font-semibold text-gray-900">{patientName}</span>
            <span className="text-gray-500"> • {patientAge} yrs • {patientGender}</span>
            <p className="text-xs text-gray-500 mt-0.5">{referralReason}</p>
          </div>
        </div>

        <div className="space-y-4">
          {recommendedFacilities.map((facility, index) => (
            <div
              key={facility.id}
              className={`bg-white rounded-xl border-2 overflow-hidden relative transition-all hover:shadow-md ${
                index === 0 && facility.hasSpecialty && facility.acceptingReferrals
                  ? 'border-brand-400'
                  : 'border-gray-100'
              }`}
            >
              {index === 0 && facility.hasSpecialty && facility.acceptingReferrals && (
                <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wide">
                  Recommended
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{facility.name}</h3>
                    <p className="text-xs text-gray-500">{facility.type} • {facility.district}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-lg ${
                    facility.distance < 10 ? 'bg-green-50 text-green-700' : facility.distance < 20 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <MapPin className="h-3 w-3 mr-1" /> {facility.distance} km
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    facility.hasSpecialty ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {facility.hasSpecialty ? '✓ ' + requiredSpecialty : 'No ' + requiredSpecialty}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    facility.acceptingReferrals ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {facility.acceptingReferrals ? '✓ Accepting' : '✗ Not Accepting'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {facility.specialties.slice(0, 4).map(s => (
                    <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {facility.specialties.length > 4 && (
                    <span className="text-[10px] text-gray-400 px-1">+{facility.specialties.length - 4} more</span>
                  )}
                </div>

                <button
                  onClick={() => handleSelectFacility(facility.id)}
                  disabled={!facility.acceptingReferrals}
                  className={`w-full font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    !facility.acceptingReferrals
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : index === 0 && facility.hasSpecialty
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-500/20 hover:shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {facility.acceptingReferrals ? 'Refer Here' : 'Not Available'}
                  {facility.acceptingReferrals && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== STEP 3: SUCCESS =====
  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="flex-1 h-0.5 bg-brand-300" />
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="flex-1 h-0.5 bg-brand-300" />
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-green-700">Complete</span>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
        <CheckCircle2 className="h-14 w-14 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Referral Created!</h1>
      <p className="text-gray-500 px-4 mb-8">
        Patient <span className="font-semibold text-gray-700">{patientName}</span> has been referred to{' '}
        <span className="font-semibold text-gray-700">{createdReferral?.facilityName}</span>.
      </p>

      {/* QR Slip */}
      <div className="print-area bg-white p-6 rounded-2xl shadow-lg border border-gray-100 inline-flex flex-col items-center w-full max-w-sm mb-8 relative overflow-hidden mx-auto">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 to-brand-600" />
        <span className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-4">Patient Referral Slip</span>

        <div className="bg-white p-3 border-2 border-gray-100 rounded-xl mb-4 shadow-sm">
          <QRCodeSVG
            value={`${window.location.origin}/patient/${createdReferral?.referralCode}`}
            size={160}
            level="H"
          />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl font-mono font-bold text-gray-800 tracking-wider bg-gray-50 px-4 py-2 rounded-lg">
            {createdReferral?.referralCode}
          </span>
          <button onClick={handleCopyCode} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Copy code">
            <Copy className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <p className="text-[10px] text-gray-400 mt-1">
          Show this code at the receiving facility.
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100 w-full text-left text-xs text-gray-500 space-y-1">
          <p><span className="font-semibold text-gray-700">Patient:</span> {patientName}, {patientAge} yrs</p>
          <p><span className="font-semibold text-gray-700">Facility:</span> {createdReferral?.facilityName}</p>
          <p><span className="font-semibold text-gray-700">Urgency:</span> {urgency}</p>
        </div>
      </div>

      {/* SMS Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-6 text-left">
        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-blue-900">SMS Notification (Demo)</p>
          <p className="text-xs text-blue-800 mt-1">
            "{patientName}, your referral to {createdReferral?.facilityName} is confirmed. Show {createdReferral?.referralCode} at reception."
          </p>
        </div>
      </div>

      <div className="flex gap-3 no-print">
        <button
          onClick={handlePrint}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Printer className="h-5 w-5" /> Print Slip
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-[2] bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
        >
          <Home className="h-5 w-5" /> Done
        </button>
      </div>
    </div>
  );
};

// Utility components
function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

export default CreateReferral;
