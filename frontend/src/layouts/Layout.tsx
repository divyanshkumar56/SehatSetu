import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Building2,
  AlertTriangle,
  BarChart3,
  User,
  Menu,
  X,
  RefreshCw,
  ChevronDown,
  Heart,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { UserRole } from '../data/types';

const ROLE_LABELS: Record<UserRole, string> = {
  referring_facility: 'Referring Facility — PHC Palampur',
  receiving_facility: 'Receiving Facility — District Hospital Palampur',
  doctor: 'Doctor — Dr. Priya Sharma',
  asha: 'ASHA/ANM — Sunita Devi',
  admin: 'Administrator',
  patient: 'Patient View',
};

const ROLE_COLORS: Record<UserRole, string> = {
  referring_facility: 'bg-emerald-100 text-emerald-800',
  receiving_facility: 'bg-blue-100 text-blue-800',
  doctor: 'bg-indigo-100 text-indigo-800',
  asha: 'bg-teal-100 text-teal-800',
  admin: 'bg-purple-100 text-purple-800',
  patient: 'bg-gray-100 text-gray-800',
};

const getNavItems = (role: UserRole) => {
  switch (role) {
    case 'referring_facility':
      return [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/create', label: 'Create Referral', icon: PlusCircle },
        { path: '/referrals', label: 'My Referrals', icon: ClipboardList },
        { path: '/facilities', label: 'Facility Directory', icon: Building2 },
        { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
      ];
    case 'receiving_facility':
      return [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/referrals', label: 'Incoming Referrals', icon: ClipboardList },
        { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
      ];
    case 'doctor':
      return [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/referrals', label: "Today's Appointments", icon: ClipboardList },
      ];
    case 'asha':
      return [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/referrals', label: 'My Assigned Referrals', icon: ClipboardList },
        { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
      ];
    case 'admin':
      return [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/referrals', label: 'All Referrals', icon: ClipboardList },
        { path: '/facilities', label: 'Facilities', icon: Building2 },
        { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      ];
    case 'patient':
    default:
      return [];
  }
};

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole, alerts, referrals: allReferrals, resetAllData } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const scopedReferrals = React.useMemo(() => {
    let list = allReferrals;
    if (role === 'referring_facility') return list.filter(r => r.referringFacilityId === 'fac-008');
    if (role === 'asha') return list.filter(r => r.patientVillage === 'Palampur Village');
    if (role === 'receiving_facility') return list.filter(r => r.destinationFacilityId === 'fac-003');
    if (role === 'doctor') return list.filter(r => r.destinationFacilityId === 'fac-003');
    return list;
  }, [allReferrals, role]);

  const unreadAlerts = alerts.filter(a => !a.isRead && (a.referralId === '' || scopedReferrals.some(r => r.id === a.referralId))).length;

  // Don't show the main layout for the patient view page
  if (location.pathname.startsWith('/patient')) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-screen z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-xl shadow-md shadow-brand-500/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-gray-900 tracking-tight">SehatSetu</span>
              <p className="text-[10px] text-gray-400 font-medium -mt-0.5">Referral Management</p>
            </div>
          </Link>
        </div>

        {/* Role Selector */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${ROLE_COLORS[role]}`}
            >
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                {ROLE_LABELS[role]}
              </div>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleDropdownOpen(false);
                      if (r === 'patient') {
                        navigate('/patient/REF-2026-00124');
                      } else {
                        navigate('/');
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-gray-50 transition-colors ${r === role ? 'bg-brand-50 text-brand-700' : 'text-gray-700'}`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {getNavItems(role).map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                {item.label}
                {item.path === '/alerts' && unreadAlerts > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Reset Data */}
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => { if (confirm('Reset all demo data to initial state?')) resetAllData(); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Demo Data
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-xl">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="font-extrabold text-lg text-gray-900">SehatSetu</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Mobile Role Selector */}
            <div className="px-4 py-3 border-b border-gray-100">
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  setRole(newRole);
                  if (newRole === 'patient') {
                    navigate('/patient/REF-2026-00124');
                  } else {
                    navigate('/');
                  }
                }}
                className={`w-full px-3 py-2 rounded-lg text-xs font-semibold ${ROLE_COLORS[role]} border-0 outline-none`}
              >
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {getNavItems(role).map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                    {item.label}
                    {item.path === '/alerts' && unreadAlerts > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadAlerts}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 py-3 border-t border-gray-100">
              <button
                onClick={() => { if (confirm('Reset all demo data?')) resetAllData(); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Demo Data
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-1.5 rounded-lg">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">SehatSetu</span>
              </div>
              <h1 className="hidden lg:block text-lg font-semibold text-gray-800">
                {getNavItems(role).find(n => n.path === location.pathname || (n.path !== '/' && location.pathname.startsWith(n.path)))?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/alerts" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <AlertTriangle className="h-5 w-5 text-gray-500" />
                {unreadAlerts > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </span>
                )}
              </Link>
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${ROLE_COLORS[role]}`}>
                <User className="h-3.5 w-3.5" />
                {ROLE_LABELS[role].split('—')[0].trim()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
