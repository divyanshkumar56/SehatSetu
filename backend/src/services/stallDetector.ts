import cron from 'node-cron';
import Referral from '../models/Referral';

// Core logic for detecting stalled referrals
export const checkStalledReferrals = async (demoMode = false) => {
  try {
    console.log('🔄 Running Stall Detection Cycle...');
    const now = new Date();
    
    // Find all active referrals that are NOT already stalled
    const activeReferrals = await Referral.find({
      isStalled: false,
      currentState: { $nin: ['CLOSED', 'CANCELLED', 'EXPIRED'] }
    });

    let newlyStalledCount = 0;

    for (const ref of activeReferrals) {
      let thresholdHours = 24; // Default 24 hours
      
      // Intelligent Rule: Critical cases stall much faster
      if (ref.priorityLevel === 'CRITICAL') thresholdHours = 2;
      if (ref.priorityLevel === 'HIGH') thresholdHours = 6;

      // HACKATHON DEMO MODE: If true, treat threshold as MINUTES instead of hours 
      // so you can demonstrate it live to judges.
      const timeDivider = demoMode ? (1000 * 60) : (1000 * 60 * 60); 
      
      const timeSinceStateChange = (now.getTime() - ref.currentStateEnteredAt.getTime()) / timeDivider;

      if (timeSinceStateChange > thresholdHours) {
        console.log(`⚠️ Referral ${ref.referralCode} is STALLED! (Time in state: ${timeSinceStateChange.toFixed(1)} units)`);
        
        ref.isStalled = true;
        ref.stalledAt = now;
        await ref.save();
        
        newlyStalledCount++;
        
        // In full app: Here we would also push to an 'Alerts' collection or send an FCM push notification
      }
    }

    if (newlyStalledCount > 0) {
      console.log(`🚨 Identified ${newlyStalledCount} new stalled referrals.`);
    } else {
      console.log('✅ All referrals are on track.');
    }

    return newlyStalledCount;

  } catch (error) {
    console.error('❌ Error in stall detection job:', error);
    return 0;
  }
};

// Start the background cron job
export const startStallDetectionCron = () => {
  // Run every 15 minutes in production (using every 1 minute for local dev)
  cron.schedule('* * * * *', () => {
    checkStalledReferrals(false); // Runs in normal hour-based mode in background
  });
  console.log('⏱️ Stall detection cron job initialized');
};
