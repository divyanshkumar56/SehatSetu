import { Request, Response } from 'express';
import Referral from '../models/Referral';
import Patient from '../models/Patient';
import mongoose from 'mongoose';

export const createReferral = async (req: Request, res: Response) => {
  try {
    const { patientInfo, referralInfo, destinationFacilityId } = req.body;

    // 1. Create or Find Patient
    const patient = new Patient({
      name: patientInfo.name,
      age: patientInfo.age,
      gender: patientInfo.gender,
      phone: patientInfo.phone,
      address: { village: 'Khirki', block: 'Mathura', district: 'Mathura' } // Mocked for now
    });
    await patient.save();

    // 2. Generate Unique Referral Code
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const referralCode = `REF-${year}-${randomNum}`;

    // 3. Create Referral
    const referral = new Referral({
      referralCode,
      patientId: patient._id,
      destinationFacilityId,
      createdByUserId: new mongoose.Types.ObjectId(), // Mocking auth user ID
      referralCategory: referralInfo.category,
      referralReason: 'Needs advanced care', // Mock
      priorityLevel: referralInfo.priority,
      currentState: 'CREATED',
    });

    await referral.save();

    // In a real app: Trigger SMS service here via Fast2SMS

    res.status(201).json({ 
      message: 'Referral created successfully', 
      referralCode,
      referralId: referral._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating referral' });
  }
};

import { checkStalledReferrals } from '../services/stallDetector';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const active = await Referral.countDocuments({ currentState: { $nin: ['CLOSED', 'CANCELLED', 'EXPIRED'] } });
    const stalled = await Referral.countDocuments({ isStalled: true });
    
    const recentReferrals = await Referral.find()
      .populate('patientId')
      .populate('destinationFacilityId')
      .sort({ createdAt: -1 })
      .limit(5);
      
    res.json({ stats: { active, stalled, closed: 45, followUp: 4 }, recentReferrals });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching stats' });
  }
};

export const triggerStallDetection = async (req: Request, res: Response) => {
  try {
    // We pass true to enable "Demo Mode" (calculates thresholds in minutes instead of hours)
    const newlyStalled = await checkStalledReferrals(true);
    res.json({ 
      message: 'Stall detection cycle completed', 
      newlyStalled 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run stall detection' });
  }
};
