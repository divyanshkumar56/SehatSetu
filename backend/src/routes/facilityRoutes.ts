import { Router } from 'express';
import { getRecommendedFacilities } from '../controllers/facilityController';

const router = Router();

router.get('/recommend', getRecommendedFacilities);

export default router;
