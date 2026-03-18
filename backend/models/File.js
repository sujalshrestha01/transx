import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Categories this file is shared with
  sharedWithCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }
  ],
  // Individual users with access (outside categories)
  allowedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  accessLog: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      accessedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model('File', fileSchema);