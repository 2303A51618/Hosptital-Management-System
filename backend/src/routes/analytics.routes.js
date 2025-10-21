import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getMetrics, getRecentActivities, getChartData } from '../controllers/analytics.controller.js';
const router = Router();
router.get('/', protect, authorize('Admin', 'Billing'), getMetrics);
router.get('/recent-activities', protect, authorize('Admin', 'Billing'), getRecentActivities);
router.get('/chart-data', protect, authorize('Admin', 'Billing'), getChartData);
export default router;
