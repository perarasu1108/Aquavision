const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Critical Water Level', 'Over-Extraction', 'Structure Damage', 'Quality Alert', 'Maintenance Due', 'Low Recharge'],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
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
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Borewell', 'RechargeStructure', 'ExtractionRecord']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    entityName: {
      type: String,
      default: ''
    }
  },
  district: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

alertSchema.index({ isRead: 1, severity: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
