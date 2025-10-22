import { Router } from 'express';
import { getMetrics, getRecentActivities, getChartData } from '../controllers/analytics.controller.js';
const router = Router();
router.get('/', getMetrics);
router.get('/recent-activities', getRecentActivities);
router.get('/chart-data', getChartData);
export default router;
