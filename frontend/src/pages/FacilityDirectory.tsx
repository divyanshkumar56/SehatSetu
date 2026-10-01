import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  MapPin,
  Phone,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  Edit3,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Facility, Specialty, FacilityType } from '../data/types';
import { calculateDistance } from '../data/seedData';

const ALL_SPECIALTIES: Specialty[] = [
  'General Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Orthopedics',
  'Ophthalmology', 'ENT', 'Cardiology', 'Dermatology', 'Dental', 'Surgery', 'Emergency Medicine',
];

const FACILITY_TYPES: FacilityType[] = [
  'Sub-Centre', 'PHC', 'CHC', 'Sub-District Hospital', 'District Hospital'
];

const FacilityDirectory: React.FC = () => {
  const { facilities, role, addFacility, updateFacility } = useStore();
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Facility>>({
    name: '', type: 'PHC', district: 'Mathura', block: '',
    specialties: [], capabilities: [], acceptingReferrals: true,
    lat: 27.49, lng: 77.67, contactPhone: '', active: true,
  });

  const filtered = useMemo(() => {
    let list = [...facilities];
    if (specialtyFilter !== 'ALL') {
      list = list.filter(f => f.specialties.includes(specialtyFilter as Specialty));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.block.toLowerCase().includes(q)
      );
    }
    return list;
  }, [facilities, search, specialtyFilter]);

  const handleEdit = (facility: Facility) => {
    setFormData({ ...facility });
    setEditingId(facility.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Facility name is required');
      return;
    }
    if (editingId) {
      updateFacility(editingId, formData);
    } else {
      addFacility(formData as Omit<Facility, 'id'>);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '', type: 'PHC', district: 'Mathura', block: '',
      specialties: [], capabilities: [], acceptingReferrals: true,
      lat: 27.49, lng: 77.67, contactPhone: '', active: true,
    });
  };

  const toggleSpecialty = (s: Specialty) => {
    const current = formData.specialties || [];
    setFormData({
      ...formData,
      specialties: current.includes(s)
        ? current.filter(x => x !== s)
        : [...current, s]
    });
  };

  const baseLat = 27.4780;
  const baseLng = 77.6480;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facility Directory</h1>
          <p className="text-sm text-gray-500 mt-1">{facilities.filter(f => f.active).length} active facilities</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" /> Add Facility
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search facilities..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="ALL">All Specialties</option>
            {ALL_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Facility Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">No facilities found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(facility => {
            const dist = calculateDistance(baseLat, baseLng, facility.lat, facility.lng);
            return (
              <div
                key={facility.id}
                className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
                  !facility.active ? 'opacity-60 border-gray-200' : 'border-gray-200'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${facility.active ? 'bg-brand-50' : 'bg-gray-100'}`}>
                        <Building2 className={`h-5 w-5 ${facility.active ? 'text-brand-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{facility.name}</h3>
                        <p className="text-xs text-gray-500">{facility.type}</p>
                      </div>
                    </div>
                    {role === 'admin' && (
                      <button
                        onClick={() => handleEdit(facility)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                      <MapPin className="h-3 w-3 text-gray-400" /> {facility.district}, {facility.block}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                      <MapPin className="h-3 w-3 text-brand-500" /> {dist} km
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      facility.acceptingReferrals ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {facility.acceptingReferrals
                        ? <><CheckCircle2 className="h-3 w-3" /> Accepting</>
                        : <><XCircle className="h-3 w-3" /> Not Accepting</>
                      }
                    </span>
                    {!facility.active && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {facility.specialties.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                    ))}
                    {facility.specialties.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{facility.specialties.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="h-3 w-3" /> {facility.contactPhone}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowForm(false); setEditingId(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Facility' : 'Add Facility'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Facility Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                  <select value={formData.type || 'PHC'} onChange={e => setFormData({ ...formData, type: e.target.value as FacilityType })} className="input-field bg-white">
                    {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">District</label>
                  <input type="text" value={formData.district || ''} onChange={e => setFormData({ ...formData, district: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Block</label>
                  <input type="text" value={formData.block || ''} onChange={e => setFormData({ ...formData, block: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Phone</label>
                  <input type="tel" value={formData.contactPhone || ''} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SPECIALTIES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        formData.specialties?.includes(s)
                          ? 'bg-brand-100 text-brand-700 border-brand-300 border'
                          : 'bg-gray-50 text-gray-500 border-gray-200 border hover:bg-gray-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.acceptingReferrals}
                    onChange={e => setFormData({ ...formData, acceptingReferrals: e.target.checked })}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  Accepting Referrals
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  {editingId ? 'Save Changes' : 'Add Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityDirectory;
