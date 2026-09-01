const mongoose = require('mongoose');

const extractionRecordSchema = new mongoose.Schema({
  borewellId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borewell',
    required: true
  },
  extractionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  volumeExtracted: {
    type: Number, // liters
    required: true,
    min: 0
  },
  pumpingDuration: {
    type: Number, // hours
    required: true,
    min: 0
  },
  purpose: {
    type: String,
    enum: ['Irrigation', 'Drinking', 'Industrial', 'Domestic', 'Other'],
    required: true
  },
  operatorName: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

extractionRecordSchema.index({ borewellId: 1, extractionDate: -1 });
extractionRecordSchema.index({ purpose: 1 });

module.exports = mongoose.model('ExtractionRecord', extractionRecordSchema);
