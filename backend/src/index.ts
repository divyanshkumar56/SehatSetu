import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sehatsetu_dev';

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SehatSetu API is running' });
});

import referralRoutes from './routes/referralRoutes';
import facilityRoutes from './routes/facilityRoutes';
import { startStallDetectionCron } from './services/stallDetector';

// Hook up actual routes
app.use('/api/referrals', referralRoutes);
app.use('/api/facilities', facilityRoutes);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    startStallDetectionCron(); // Start the background job
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
