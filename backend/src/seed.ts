import mongoose from 'mongoose';
import Facility from './models/Facility';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sehatsetu_dev';

const seedFacilities = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB...');

    // Clear existing facilities
    await Facility.deleteMany({});

    const facilities = [
      {
        name: 'CHC Narholi',
        type: 'CHC',
        specializations: ['TRAUMA', 'MATERNAL', 'GENERAL'],
        acceptingReferrals: true,
        location: { lat: 27.5020, lng: 77.6710 }
      },
      {
        name: 'District Hospital Mathura',
        type: 'DH',
        specializations: ['TRAUMA', 'MATERNAL', 'PEDIATRIC', 'CHRONIC', 'GENERAL'],
        acceptingReferrals: true,
        location: { lat: 27.4924, lng: 77.6737 } // Approx 10+ km away in math calculations depending on origin
      },
      {
        name: 'PHC Govardhan',
        type: 'PHC',
        specializations: ['GENERAL', 'MATERNAL'],
        acceptingReferrals: false, // Testing filter
        location: { lat: 27.4975, lng: 77.4661 }
      }
    ];

    await Facility.insertMany(facilities);
    console.log('✅ Database seeded with facilities');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding DB:', error);
    process.exit(1);
  }
};

seedFacilities();
