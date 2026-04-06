import mongoose from 'mongoose';
import crypto from 'crypto';

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'uploader', 'admin'],
    default: 'member'
  }
});

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  joinCode: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(4).toString('hex').toUpperCase()
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  allowAllUploads: {
    type: Boolean,
    default: false  // when true, all members can upload regardless of role
  },
   // ← NEW: dedicated activity log
  activityLog: [
    {
      type: {
        type: String,
        enum: ['upload', 'download', 'join', 'delete', 'role_change','restore'],
        required: true
      },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      fileName: { type: String },
      meta: { type: String },
      at: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Organization', organizationSchema);