import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  AlertOctagon,
  ArrowRight,
  MapPin,
  Activity,
  Clock,
  CheckCircle2,
  CalendarDays,
  RefreshCw,
  Stethoscope,
  QrCode,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { STATUS_COLORS, STATUS_LABELS, URGENCY_COLORS } from '../data/types';
import type { Referral } from '../data/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { referrals: allReferrals, facilities, alerts, role, simulateStalled } = useStore();
  const [triggering, setTriggering] = React.useState(false);

  const referrals = React.useMemo(() => {
    let list = [...allReferrals];
    if (role === 'referring_facility' || role === 'asha') {
      return list.filter(r => r.referringFacilityId === 'fac-008');
    } else if (role === 'receiving_facility') {
      return list.filter(r => r.destinationFacilityId === 'fac-003');
    } else if (role === 'doctor') {
      return list.filter(r => 
        r.destinationFacilityId === 'fac-003' && 
        ['APPOINTMENT_SCHEDULED', 'PATIENT_ARRIVED', 'TREATMENT_RECORDED', 'FOLLOW_UP_SCHEDULED', 'FOLLOW_UP_COMPLETED', 'CLOSED'].includes(r.currentStatus)
      );
    }
    return list;
  }, [allReferrals, role]);

  const totalReferrals = referrals.length;
  const pendingAcceptance = referrals.filter(r => r.currentStatus === 'CREATED').length;
  const appointmentsScheduled = referrals.filter(r => r.currentStatus === 'APPOINTMENT_SCHEDULED').length;
  const stalledCount = referrals.filter(r => r.isStalled).length;
  const closedCount = referrals.filter(r => r.currentStatus === 'CLOSED').length;
  const activeCount = referrals.filter(r => !['CLOSED', 'CANCELLED', 'REJECTED'].includes(r.currentStatus)).length;

  const recentReferrals = [...referrals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stalledReferrals = referrals.filter(r => r.isStalled);
  const unreadAlerts = alerts.filter(a => !a.isRead).slice(0, 3);

  const handleTriggerStall = () => {
    setTriggering(true);
    setTimeout(() => {
      const count = simulateStalled();
      setTriggering(false);
      alert(`Stall detection complete: ${count} newly stalled referral${count !== 1 ? 's' : ''} found.`);
    }, 800);
  };

  const getFacilityName = (id: string) => facilities.find(f => f.id === id)?.name || 'Unknown Facility';

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (role === 'patient') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="bg-brand-100 p-4 rounded-full mb-6 mt-10">
          <QrCode className="h-10 w-10 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Demo Mode</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          You are currently in the Patient View role. Patients do not have access to a staff dashboard.
        </p>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-md w-full text-left mx-auto">
          <h3 className="font-bold text-gray-800 mb-2">How to continue the demo:</h3>
          <ol className="text-sm text-gray-600 space-y-3 list-decimal pl-4">
            <li>Open the sidebar menu on the left.</li>
            <li>Use the role switcher at the bottom to select a staff role (e.g., <span className="font-semibold text-gray-800">Receiving Facility</span>).</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {role === 'referring_facility' ? 'Welcome, Dr. Rajesh' : 
             role === 'receiving_facility' ? 'Welcome, Admin' :
             role === 'doctor' ? 'Welcome, Dr. Priya Sharma' :
             role === 'asha' ? 'Namaste, Sunita!' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {role === 'referring_facility' ? 'PHC Palampur' : 
             role === 'receiving_facility' ? 'District Hospital Palampur' :
             role === 'doctor' ? 'Cardiology • District Hospital Palampur' :
             role === 'asha' ? 'ASHA Worker • Palampur Village' : 'SehatSetu System Overview'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {role === 'referring_facility' && (
            <Link
              to="/create"
              className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              New Referral
            </Link>
          )}
        </div>
      </div>

      {/* Demo Mode Banner */}
      {(role === 'asha' || role === 'admin') && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-900"></p>
            <p className="text-xs text-blue-700 mt-0.5">Run stall detection manually to test the full workflow.</p>
          </div>
          <button
            onClick={handleTriggerStall}
            disabled={triggering}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${triggering ? 'animate-spin' : ''}`} />
            Simulate Stall Check
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Referrals"
          value={totalReferrals}
          icon={<Activity className="h-5 w-5" />}
          color="text-brand-600"
          bgColor="bg-brand-50"
          onClick={() => navigate('/referrals')}
        />
        <StatsCard
          label="Pending Acceptance"
          value={pendingAcceptance}
          icon={<Clock className="h-5 w-5" />}
          color="text-amber-600"
          bgColor="bg-amber-50"
          onClick={() => navigate('/referrals')}
        />
        <StatsCard
          label="Appointments"
          value={appointmentsScheduled}
          icon={<CalendarDays className="h-5 w-5" />}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
          onClick={() => navigate('/referrals')}
        />
        <StatsCard
          label="Stalled"
          value={stalledCount}
          icon={<AlertOctagon className="h-5 w-5" />}
          color="text-red-600"
          bgColor="bg-red-50"
          onClick={() => navigate('/alerts')}
          pulse={stalledCount > 0}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stalled Referrals */}
          {stalledReferrals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-red-500" />
                  Needs Attention
                </h2>
                <Link to="/alerts" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {stalledReferrals.slice(0, 2).map(ref => (
                  <StalledCard key={ref.id} referral={ref} facilityName={getFacilityName(ref.destinationFacilityId)} onClick={() => navigate(`/referrals/${ref.id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Referrals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Recent Referrals</h2>
              <Link to="/referrals" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {recentReferrals.length === 0 ? (
                <div className="p-8 text-center">
                  <Stethoscope className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No referrals yet.</p>
                  {role === 'referring_facility' && (
                    <Link to="/create" className="text-sm text-brand-600 font-semibold hover:underline mt-1 inline-block">
                      Create your first referral →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentReferrals.map(ref => (
                    <ReferralRow
                      key={ref.id}
                      referral={ref}
                      facilityName={getFacilityName(ref.destinationFacilityId)}
                      timeAgo={timeAgo(ref.createdAt)}
                      onClick={() => navigate(`/referrals/${ref.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Quick Actions</h3>
            <div className="space-y-2">
              {role === 'referring_facility' && (
                <Link to="/create" className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors group">
                  <div className="bg-brand-100 p-2 rounded-lg group-hover:bg-brand-200 transition-colors">
                    <PlusCircle className="h-4 w-4 text-brand-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Create New Referral</span>
                </Link>
              )}
              <Link to="/referrals" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Track Referrals</span>
              </Link>
              <Link to="/facilities" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <MapPin className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">View Facilities</span>
              </Link>
              <Link to="/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <Activity className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">View Analytics</span>
              </Link>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Alerts</h3>
              <Link to="/alerts" className="text-xs text-brand-600 font-semibold hover:underline">View all</Link>
            </div>
            {unreadAlerts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No new alerts</p>
            ) : (
              <div className="space-y-3">
                {unreadAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border text-xs cursor-pointer hover:shadow-sm transition-shadow ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      alert.severity === 'warning' ? 'bg-amber-50 border-amber-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => navigate(`/referrals/${alert.referralId}`)}
                  >
                    <p className={`font-semibold ${
                      alert.severity === 'critical' ? 'text-red-700' :
                      alert.severity === 'warning' ? 'text-amber-700' :
                      'text-blue-700'
                    }`}>{alert.message}</p>
                    <p className="text-gray-500 mt-1">{timeAgo(alert.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-5 text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-100 mb-3">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-200">Active</span>
                <span className="font-bold">{activeCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-200">Closed</span>
                <span className="font-bold">{closedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-200">Facilities</span>
                <span className="font-bold">{facilities.filter(f => f.active).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components

function StatsCard({ label, value, icon, color, bgColor, onClick, pulse }: {
  label: string; value: number; icon: React.ReactNode; color: string; bgColor: string;
  onClick?: () => void; pulse?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-4 lg:p-5 rounded-xl border border-gray-200 flex flex-col justify-center relative overflow-hidden text-left hover:shadow-md transition-shadow group"
    >
      <div className={`absolute top-3 right-3 ${bgColor} p-2 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
        <div className={color}>{icon}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-3xl font-extrabold text-gray-800">{value}</span>
        {pulse && value > 0 && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        )}
      </div>
      <span className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wide">{label}</span>
    </button>
  );
}

function StalledCard({ referral, facilityName, onClick }: { referral: Referral; facilityName: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-red-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex justify-between items-center">
        <span className="text-xs font-bold text-red-600 flex items-center gap-1">
          <AlertOctagon className="h-3.5 w-3.5" />
          STALLED: {STATUS_LABELS[referral.currentStatus]}
        </span>
        <span className="text-xs text-gray-500 font-mono">{referral.referralCode}</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900">{referral.patientName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{referral.patientAge} yrs • {referral.patientGender} • {referral.referralReason}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${URGENCY_COLORS[referral.urgency].bg} ${URGENCY_COLORS[referral.urgency].text}`}>
            {referral.urgency}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 bg-gray-50 p-2 rounded-lg">
          <MapPin className="h-4 w-4 text-brand-500 shrink-0" />
          <span className="truncate">→ <span className="font-semibold text-gray-800">{facilityName}</span></span>
        </div>
      </div>
    </div>
  );
}

function ReferralRow({ referral, facilityName, timeAgo, onClick }: {
  referral: Referral; facilityName: string; timeAgo: string; onClick: () => void;
}) {
  const statusColor = STATUS_COLORS[referral.currentStatus];
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${statusColor.bg}`}>
        {referral.currentStatus === 'CLOSED' ? (
          <CheckCircle2 className={`h-5 w-5 ${statusColor.text}`} />
        ) : referral.isStalled ? (
          <AlertOctagon className="h-5 w-5 text-red-500" />
        ) : (
          <Activity className={`h-5 w-5 ${statusColor.text}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 truncate">{referral.patientName}</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-2 ${statusColor.bg} ${statusColor.text}`}>
            {STATUS_LABELS[referral.currentStatus]}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {referral.patientAge} yrs • {referral.requiredSpecialty} → {facilityName}
        </p>
      </div>
      <span className="text-[11px] text-gray-400 shrink-0 hidden sm:block">{timeAgo}</span>
      <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />
    </div>
  );
}

export default Dashboard;
