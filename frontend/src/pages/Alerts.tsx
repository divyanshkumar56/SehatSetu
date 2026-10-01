import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Clock,
  Zap,
  Eye,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { STATUS_LABELS } from '../data/types';

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, referrals, markAlertRead, simulateStalled, addAlert } = useStore();
  const [triggering, setTriggering] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'STALLED' | 'CRITICAL'>('ALL');

  const stalledReferrals = referrals.filter(r => r.isStalled);
  const unreadCount = alerts.filter(a => !a.isRead).length;

  const filtered = alerts.filter(a => {
    if (filter === 'UNREAD') return !a.isRead;
    if (filter === 'STALLED') return a.type === 'STALLED';
    if (filter === 'CRITICAL') return a.severity === 'critical';
    return true;
  });

  const handleTriggerStall = () => {
    setTriggering(true);
    setTimeout(() => {
      const count = simulateStalled();
      setTriggering(false);
      if (count === 0) {
        alert('No new stalled referrals detected. All referrals are progressing normally or were updated recently.');
      }
    }, 800);
  };

  const handleSimulateEscalation = () => {
    const stalled = stalledReferrals[0];
    if (stalled) {
      addAlert({
        referralId: stalled.id,
        type: 'ESCALATION',
        message: `ESCALATION: Referral ${stalled.referralCode} for ${stalled.patientName} has been escalated to the Block Medical Officer due to prolonged inaction.`,
        severity: 'critical',
        isRead: false,
      });
    } else {
      addAlert({
        referralId: '',
        type: 'ESCALATION',
        message: 'ESCALATION: System-wide escalation triggered. No active stalled referrals found — all referrals are progressing.',
        severity: 'info',
        isRead: false,
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50/50';
      case 'warning': return 'border-amber-200 bg-amber-50/50';
      default: return 'border-blue-200 bg-blue-50/50';
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Escalations</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''} • {stalledReferrals.length} stalled referral{stalledReferrals.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-900 mb-3">🎯 Demo Controls</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleTriggerStall}
            disabled={triggering}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${triggering ? 'animate-spin' : ''}`} />
            Run Stall Detection
          </button>
          <button
            onClick={handleSimulateEscalation}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            Simulate Escalation
          </button>
        </div>
        <p className="text-[11px] text-blue-600 mt-2">
          Stall detection marks referrals as stalled if they haven't been updated in over 2 hours (shortened for demo).
        </p>
      </div>

      {/* Stalled Summary */}
      {stalledReferrals.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
            <AlertOctagon className="h-4 w-4" />
            Stalled Referrals ({stalledReferrals.length})
          </h3>
          <div className="space-y-2">
            {stalledReferrals.map(r => (
              <div
                key={r.id}
                onClick={() => navigate(`/referrals/${r.id}`)}
                className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100 cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.patientName}</p>
                  <p className="text-xs text-gray-500">
                    {r.referralCode} • Stalled at: {STATUS_LABELS[r.currentStatus]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    r.urgency === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {r.urgency}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { label: 'All', value: 'ALL' as const },
          { label: `Unread (${unreadCount})`, value: 'UNREAD' as const },
          { label: 'Stalled', value: 'STALLED' as const },
          { label: 'Critical', value: 'CRITICAL' as const },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f.value ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No alerts to show</p>
          </div>
        ) : (
          filtered.map(alert => (
            <div
              key={alert.id}
              className={`rounded-xl border p-4 transition-all ${getSeverityStyle(alert.severity)} ${
                !alert.isRead ? 'shadow-sm' : 'opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!alert.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {alert.message}
                    </p>
                    {!alert.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {timeAgo(alert.createdAt)}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      alert.type === 'STALLED' ? 'bg-amber-100 text-amber-700' :
                      alert.type === 'ESCALATION' ? 'bg-red-100 text-red-700' :
                      alert.type === 'CRITICAL_REFERRAL' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {alert.referralId && (
                      <button
                        onClick={() => navigate(`/referrals/${alert.referralId}`)}
                        className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> View Referral
                      </button>
                    )}
                    {!alert.isRead && (
                      <button
                        onClick={() => markAlertRead(alert.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
