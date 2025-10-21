import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['appointment', 'billing', 'room', 'patient', 'alert', 'general'],
    default: 'general'
  },
  actionLink: { 
    type: String 
  },
  read: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model('Notification', notificationSchema);
