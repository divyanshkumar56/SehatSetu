import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowRight,
  AlertOctagon,
  CheckCircle2,
  Activity,
  XCircle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { STATUS_COLORS, STATUS_LABELS, URGENCY_COLORS } from '../data/types';
import type { ReferralStatus } from '../data/types';

const STATUS_FILTERS: { label: string; value: ReferralStatus | 'ALL' | 'STALLED' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Stalled', value: 'STALLED' },
  { label: 'Created', value: 'CREATED' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Scheduled', value: 'APPOINTMENT_SCHEDULED' },
  { label: 'Arrived', value: 'PATIENT_ARRIVED' },
  { label: 'Treated', value: 'TREATMENT_RECORDED' },
  { label: 'Follow-up', value: 'FOLLOW_UP_SCHEDULED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const AllReferrals: React.FC = () => {
  const navigate = useNavigate();
  const { referrals, facilities } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const getFacilityName = (id: string) => facilities.find(f => f.id === id)?.name || 'Unknown';

  const filtered = useMemo(() => {
    let list = [...referrals];

    if (statusFilter === 'STALLED') {
      list = list.filter(r => r.isStalled);
    } else if (statusFilter !== 'ALL') {
      list = list.filter(r => r.currentStatus === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.patientName.toLowerCase().includes(q) ||
        r.referralCode.toLowerCase().includes(q) ||
        r.patientVillage.toLowerCase().includes(q) ||
        r.referralReason.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [referrals, search, statusFilter]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusIcon = (status: ReferralStatus, isStalled: boolean) => {
    if (isStalled) return <AlertOctagon className="h-5 w-5 text-red-500" />;
    switch (status) {
      case 'CLOSED': return <CheckCircle2 className="h-5 w-5 text-gray-500" />;
      case 'CANCELLED':
      case 'REJECTED': return <XCircle className="h-5 w-5 text-red-400" />;
      default: return <Activity className={`h-5 w-5 ${STATUS_COLORS[status].text}`} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Referrals</h1>
          <p className="text-sm text-gray-500 mt-1">{referrals.length} total referrals</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient name, referral code, village..."
          className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? f.value === 'STALLED' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.value === 'STALLED' && (
              <span className="ml-1">({referrals.filter(r => r.isStalled).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No referrals found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">Code</div>
              <div className="col-span-2">Patient</div>
              <div className="col-span-2">Reason</div>
              <div className="col-span-2">Facility</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Urgency</div>
              <div className="col-span-1">Created</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-gray-100">
              {filtered.map(ref => {
                const sc = STATUS_COLORS[ref.currentStatus];
                const uc = URGENCY_COLORS[ref.urgency];
                return (
                  <div
                    key={ref.id}
                    onClick={() => navigate(`/referrals/${ref.id}`)}
                    className="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* Mobile layout */}
                    <div className="lg:hidden">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ref.currentStatus, ref.isStalled)}
                          <span className="font-bold text-gray-900">{ref.patientName}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sc.bg} ${sc.text}`}>
                          {ref.isStalled ? '⚠ STALLED' : STATUS_LABELS[ref.currentStatus]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-mono">{ref.referralCode}</span>
                        <span>{timeAgo(ref.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">→ {getFacilityName(ref.destinationFacilityId)}</p>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1">
                        <span className="text-xs font-mono text-gray-600">{ref.referralCode}</span>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold text-gray-900 text-sm">{ref.patientName}</p>
                        <p className="text-xs text-gray-500">{ref.patientAge} yrs • {ref.patientGender}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-600 truncate">{ref.referralReason}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-700 font-medium truncate">{getFacilityName(ref.destinationFacilityId)}</p>
                      </div>
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${sc.bg} ${sc.text}`}>
                          {ref.isStalled && <AlertOctagon className="h-3 w-3" />}
                          {ref.isStalled ? 'STALLED' : STATUS_LABELS[ref.currentStatus]}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${uc.bg} ${uc.text}`}>{ref.urgency}</span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-xs text-gray-500">{timeAgo(ref.createdAt)}</span>
                      </div>
                      <div className="col-span-1 text-right">
                        <ArrowRight className="h-4 w-4 text-gray-300 inline" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllReferrals;
