import Notification from '../models/notification.model.js';

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create notification (internal use)
export const createNotification = async (userId, title, message, type, actionLink) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      actionLink,
      read: false
    });
    
    // Emit socket event
    const { getIO } = await import('../utils/socket.js');
    const io = getIO();
    if (io && io.to) {
      io.to(userId.toString()).emit('notification', notification);
    }
    
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};
