import { Request, Response } from 'express';
import Facility from '../models/Facility';
import { haversineDistance } from '../utils/distance';

export const getRecommendedFacilities = async (req: Request, res: Response) => {
  try {
    // In production, these come from the patient's village coordinates or the ASHA's GPS
    const { lat, lng, category } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Coordinates are required' });
    }

    const patientLat = parseFloat(lat as string);
    const patientLng = parseFloat(lng as string);

    // Get all facilities accepting referrals
    const facilities = await Facility.find({ acceptingReferrals: true });

    // Calculate distance and sort
    const recommendations = facilities.map(facility => {
      const distance = haversineDistance(patientLat, patientLng, facility.location.lat, facility.location.lng);
      return {
        ...facility.toObject(),
        distance
      };
    }).sort((a, b) => a.distance - b.distance);

    res.json({ facilities: recommendations });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching facilities' });
  }
};
