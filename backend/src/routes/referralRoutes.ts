import { Router } from 'express';
import { createReferral, getDashboardStats, triggerStallDetection } from '../controllers/referralController';

const router = Router();

router.post('/', createReferral);
router.get('/dashboard', getDashboardStats);
router.post('/trigger-stall', triggerStallDetection);

export default router;
