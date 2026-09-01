const mongoose = require('mongoose');

const groundwaterLevelSchema = new mongoose.Schema({
  borewellId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borewell',
    required: true
  },
  waterLevel: {
    type: Number, // meters below ground level
    required: true
  },
  measuredAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  season: {
    type: String,
    enum: ['Pre-Monsoon', 'Monsoon', 'Post-Monsoon', 'Rabi'],
    required: true
  },
  measuredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  qualityParams: {
    ph: { type: Number, min: 0, max: 14, default: 7.0 },
    tds: { type: Number, default: 500 }, // mg/L
    hardness: { type: Number, default: 200 }, // mg/L
    chloride: { type: Number, default: 100 }, // mg/L
    fluoride: { type: Number, default: 0.5 }, // mg/L
    nitrate: { type: Number, default: 10 } // mg/L
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient time-series queries
groundwaterLevelSchema.index({ borewellId: 1, measuredAt: -1 });
groundwaterLevelSchema.index({ season: 1 });

module.exports = mongoose.model('GroundwaterLevel', groundwaterLevelSchema);
