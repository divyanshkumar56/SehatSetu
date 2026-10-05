import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Referral, Facility, Alert, UserRole, ReferralStatus, TimelineEntry } from '../data/types';
import { VALID_TRANSITIONS } from '../data/types';
import { SEED_FACILITIES } from '../data/seedData';
import { generateSeedReferrals, generateSeedAlerts } from '../data/seedReferrals';

const STORAGE_KEYS = {
  referrals: 'sehatsetu_referrals',
  facilities: 'sehatsetu_facilities',
  alerts: 'sehatsetu_alerts',
  role: 'sehatsetu_role',
  initialized: 'sehatsetu_initialized',
};

interface StoreContextType {
  // Role
  role: UserRole;
  setRole: (role: UserRole) => void;

  // Referrals
  referrals: Referral[];
  getReferral: (id: string) => Referral | undefined;
  createReferral: (data: Omit<Referral, 'id' | 'referralCode' | 'currentStatus' | 'isStalled' | 'timeline' | 'createdAt' | 'updatedAt'>) => Referral;
  advanceReferral: (id: string, newStatus: ReferralStatus, actor: string, notes?: string, extra?: Partial<Referral>) => boolean;

  // Facilities
  facilities: Facility[];
  getFacility: (id: string) => Facility | undefined;
  addFacility: (data: Omit<Facility, 'id'>) => Facility;
  updateFacility: (id: string, data: Partial<Facility>) => void;

  // Alerts
  alerts: Alert[];
  markAlertRead: (id: string) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;

  // Stalled simulation
  simulateStalled: () => number;
  resolveStalled: (referralId: string) => void;

  // Reset
  resetAllData: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

let referralCounter = 100;

function generateReferralCode(): string {
  referralCounter++;
  const year = new Date().getFullYear();
  return `REF-${year}-${String(referralCounter).padStart(4, '0')}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const loadedRole = loadFromStorage(STORAGE_KEYS.role, 'referring_facility' as UserRole);
    const validRoles = ['referring_facility', 'receiving_facility', 'doctor', 'asha', 'admin', 'patient'];
    return validRoles.includes(loadedRole) ? loadedRole : 'referring_facility';
  });
  const [referrals, setReferrals] = useState<Referral[]>(() => loadFromStorage(STORAGE_KEYS.referrals, []));
  const [facilities, setFacilities] = useState<Facility[]>(() => loadFromStorage(STORAGE_KEYS.facilities, []));
  const [alerts, setAlerts] = useState<Alert[]>(() => loadFromStorage(STORAGE_KEYS.alerts, []));

  // Initialize seed data on first launch
  useEffect(() => {
    const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
    if (!initialized) {
      const seedFacilities = SEED_FACILITIES;
      const seedReferrals = generateSeedReferrals();
      const seedAlerts = generateSeedAlerts(seedReferrals);

      // Find the max counter from seed referrals
      const maxCode = seedReferrals.reduce((max, r) => {
        const num = parseInt(r.referralCode.split('-').pop() || '0');
        return num > max ? num : max;
      }, 0);
      referralCounter = maxCode;

      setFacilities(seedFacilities);
      setReferrals(seedReferrals);
      setAlerts(seedAlerts);

      saveToStorage(STORAGE_KEYS.facilities, seedFacilities);
      saveToStorage(STORAGE_KEYS.referrals, seedReferrals);
      saveToStorage(STORAGE_KEYS.alerts, seedAlerts);
      localStorage.setItem(STORAGE_KEYS.initialized, 'true');
    } else {
      // Ensure counter is up to date
      const existing = loadFromStorage<Referral[]>(STORAGE_KEYS.referrals, []);
      const maxCode = existing.reduce((max, r) => {
        const num = parseInt(r.referralCode.split('-').pop() || '0');
        return num > max ? num : max;
      }, 100);
      referralCounter = maxCode;
    }
  }, []);

  // Persist on change
  useEffect(() => { saveToStorage(STORAGE_KEYS.referrals, referrals); }, [referrals]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.facilities, facilities); }, [facilities]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.alerts, alerts); }, [alerts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.role, role); }, [role]);

  const setRole = useCallback((r: UserRole) => setRoleState(r), []);

  const getReferral = useCallback((id: string) => referrals.find(r => r.id === id || r.referralCode === id), [referrals]);

  const createReferral = useCallback((data: Omit<Referral, 'id' | 'referralCode' | 'currentStatus' | 'isStalled' | 'timeline' | 'createdAt' | 'updatedAt'>): Referral => {
    const now = new Date().toISOString();
    const newReferral: Referral = {
      ...data,
      id: generateId(),
      referralCode: generateReferralCode(),
      currentStatus: 'CREATED',
      isStalled: false,
      timeline: [{
        status: 'CREATED',
        timestamp: now,
        actor: 'ASHA Sunita (SC Khirki Village)',
        notes: 'Referral created',
      }],
      createdAt: now,
      updatedAt: now,
    };
    setReferrals(prev => [newReferral, ...prev]);

    // Add alert for new critical referrals
    if (data.urgency === 'CRITICAL') {
      const alert: Alert = {
        id: generateId(),
        referralId: newReferral.id,
        type: 'CRITICAL_REFERRAL',
        message: `Critical referral created for ${data.patientName} — requires immediate attention`,
        severity: 'critical',
        isRead: false,
        createdAt: now,
      };
      setAlerts(prev => [alert, ...prev]);
    }

    return newReferral;
  }, []);

  const advanceReferral = useCallback((id: string, newStatus: ReferralStatus, actor: string, notes?: string, extra?: Partial<Referral>): boolean => {
    // Synchronously check if transition is allowed using current state
    const ref = referrals.find(r => r.id === id || r.referralCode === id);
    if (!ref || !VALID_TRANSITIONS[ref.currentStatus]?.includes(newStatus)) {
      return false;
    }

    setReferrals(prev => prev.map(r => {
      if ((r.id === id || r.referralCode === id) && VALID_TRANSITIONS[r.currentStatus]?.includes(newStatus)) {
        const now = new Date().toISOString();
        const entry: TimelineEntry = {
          status: newStatus,
          timestamp: now,
          actor,
          notes,
        };
        return {
          ...r,
          ...extra,
          currentStatus: newStatus,
          timeline: [...r.timeline, entry],
          isStalled: false,
          stalledSince: undefined,
          updatedAt: now,
        };
      }
      return r;
    }));
    return true;
  }, [referrals]);

  const getFacility = useCallback((id: string) => facilities.find(f => f.id === id), [facilities]);

  const addFacility = useCallback((data: Omit<Facility, 'id'>): Facility => {
    const newFacility: Facility = { ...data, id: generateId() };
    setFacilities(prev => [...prev, newFacility]);
    return newFacility;
  }, []);

  const updateFacility = useCallback((id: string, data: Partial<Facility>) => {
    setFacilities(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  }, []);

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = { ...alert, id: generateId(), createdAt: new Date().toISOString() };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const simulateStalled = useCallback((): number => {
    let count = 0;
    const now = new Date();
    setReferrals(prev => prev.map(r => {
      if (!r.isStalled && !['CLOSED', 'CANCELLED', 'REJECTED'].includes(r.currentStatus)) {
        // Check if last update was > 24 hours ago (simulated as > 2 hours for demo)
        const lastUpdate = new Date(r.updatedAt);
        const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 2) {
          count++;
          const stalledAlert: Alert = {
            id: generateId(),
            referralId: r.id,
            type: 'STALLED',
            message: `Referral ${r.referralCode} for ${r.patientName} is stalled at "${r.currentStatus}" for ${Math.round(hoursDiff)} hours`,
            severity: r.urgency === 'CRITICAL' ? 'critical' : 'warning',
            isRead: false,
            createdAt: now.toISOString(),
          };
          setAlerts(prev => [stalledAlert, ...prev]);
          return { ...r, isStalled: true, stalledSince: now.toISOString() };
        }
      }
      return r;
    }));
    return count;
  }, []);

  const resolveStalled = useCallback((referralId: string) => {
    setReferrals(prev => prev.map(r =>
      r.id === referralId ? { ...r, isStalled: false, stalledSince: undefined } : r
    ));
  }, []);

  const resetAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    const seedFacilities = SEED_FACILITIES;
    const seedReferrals = generateSeedReferrals();
    const seedAlerts = generateSeedAlerts(seedReferrals);
    const maxCode = seedReferrals.reduce((max, r) => {
      const num = parseInt(r.referralCode.split('-').pop() || '0');
      return num > max ? num : max;
    }, 0);
    referralCounter = maxCode;
    setFacilities(seedFacilities);
    setReferrals(seedReferrals);
    setAlerts(seedAlerts);
    setRoleState('referring_facility');
    localStorage.setItem(STORAGE_KEYS.initialized, 'true');
  }, []);

  return (
    <StoreContext.Provider value={{
      role, setRole,
      referrals, getReferral, createReferral, advanceReferral,
      facilities, getFacility, addFacility, updateFacility,
      alerts, markAlertRead, addAlert,
      simulateStalled, resolveStalled,
      resetAllData,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
