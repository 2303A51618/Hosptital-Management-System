import express from 'express';
import { protect } from '../middleware/auth.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

// Get user notifications
router.get('/', protect, notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', protect, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, notificationController.markAllAsRead);

export default router;
