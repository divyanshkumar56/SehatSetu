import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  Area, AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { STATUS_LABELS } from '../data/types';
import type { ReferralStatus } from '../data/types';

const CHART_COLORS = [
  '#0d9488', '#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef',
  '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6',
];

const Analytics: React.FC = () => {
  const { referrals, facilities } = useStore();

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    referrals.forEach(r => {
      const label = STATUS_LABELS[r.currentStatus];
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [referrals]);

  // Stalled vs Active
  const stalledData = useMemo(() => {
    const stalled = referrals.filter(r => r.isStalled).length;
    const active = referrals.filter(r => !['CLOSED', 'CANCELLED', 'REJECTED'].includes(r.currentStatus) && !r.isStalled).length;
    const closed = referrals.filter(r => ['CLOSED', 'CANCELLED', 'REJECTED'].includes(r.currentStatus)).length;
    return [
      { name: 'Active', value: active },
      { name: 'Stalled', value: stalled },
      { name: 'Closed/Rejected', value: closed },
    ];
  }, [referrals]);

  // Urgency distribution
  const urgencyData = useMemo(() => {
    const counts: Record<string, number> = {};
    referrals.forEach(r => {
      counts[r.urgency] = (counts[r.urgency] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [referrals]);

  // Facility-wise distribution
  const facilityData = useMemo(() => {
    const counts: Record<string, number> = {};
    referrals.forEach(r => {
      const fac = facilities.find(f => f.id === r.destinationFacilityId);
      const name = fac?.name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, referrals]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, referrals }))
      .sort((a, b) => b.referrals - a.referrals);
  }, [referrals, facilities]);

  // Avg time in each stage (hours)
  const stageTimeData = useMemo(() => {
    const stages: ReferralStatus[] = ['CREATED', 'ACCEPTED', 'APPOINTMENT_SCHEDULED', 'PATIENT_ARRIVED', 'TREATMENT_RECORDED'];
    return stages.map(stage => {
      const timesInStage: number[] = [];
      referrals.forEach(r => {
        const entryIdx = r.timeline.findIndex(t => t.status === stage);
        if (entryIdx >= 0 && entryIdx < r.timeline.length - 1) {
          const entryTime = new Date(r.timeline[entryIdx].timestamp).getTime();
          const nextTime = new Date(r.timeline[entryIdx + 1].timestamp).getTime();
          timesInStage.push((nextTime - entryTime) / (1000 * 60 * 60));
        }
      });
      const avg = timesInStage.length > 0 ? timesInStage.reduce((a, b) => a + b, 0) / timesInStage.length : 0;
      return {
        name: STATUS_LABELS[stage].replace('Appointment ', 'Appt ').replace('Scheduled', 'Sched.'),
        hours: Math.round(avg * 10) / 10,
      };
    });
  }, [referrals]);

  // Trend data (referrals created by day, last 14 days)
  const trendData = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      days[key] = 0;
    }
    referrals.forEach(r => {
      const d = new Date(r.createdAt);
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (key in days) {
        days[key]++;
      }
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [referrals]);

  const totalReferrals = referrals.length;
  const activeCount = referrals.filter(r => !['CLOSED', 'CANCELLED', 'REJECTED'].includes(r.currentStatus)).length;
  const stalledCount = referrals.filter(r => r.isStalled).length;
  const closedCount = referrals.filter(r => r.currentStatus === 'CLOSED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of referral performance and facility utilization</p>
        {/* <p className="">sample Data</p> */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={<Activity className="h-5 w-5" />} label="Total Referrals" value={totalReferrals} color="text-brand-600" bg="bg-brand-50" />
        <SummaryCard icon={<TrendingUp className="h-5 w-5" />} label="Active" value={activeCount} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard icon={<AlertOctagon className="h-5 w-5" />} label="Stalled" value={stalledCount} color="text-red-600" bg="bg-red-50" />
        <SummaryCard icon={<CheckCircle2 className="h-5 w-5" />} label="Closed" value={closedCount} color="text-green-600" bg="bg-green-50" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <ChartCard title="Referrals by Status">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {statusData.map((_entry, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [value, 'Referrals']} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Stalled vs Active */}
        <ChartCard title="Active vs Stalled vs Closed">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stalledData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                <Cell fill="#0d9488" />
                <Cell fill="#ef4444" />
                <Cell fill="#9ca3af" />
              </Pie>
              <Tooltip formatter={(value: any) => [value, 'Referrals']} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Referral Trend */}
        <ChartCard title="Referral Trend (14 Days)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#0d9488" fill="url(#colorCount)" strokeWidth={2} name="Referrals" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Facility Distribution */}
        <ChartCard title="Referrals by Facility">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={facilityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="referrals" fill="#0d9488" radius={[0, 4, 4, 0]} name="Referrals" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Avg Time in Stage */}
        <ChartCard title="Average Time per Stage (Hours)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stageTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: any) => [`${value} hrs`, 'Avg Time']} />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Urgency Distribution */}
        <ChartCard title="Referrals by Urgency">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={urgencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Referrals">
                {urgencyData.map((entry, i) => (
                  <Cell key={i} fill={entry.name === 'CRITICAL' ? '#ef4444' : entry.name === 'HIGH' ? '#f59e0b' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

function SummaryCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`${bg} p-2 rounded-lg`}>
          <div className={color}>{icon}</div>
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-extrabold text-gray-800">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default Analytics;
