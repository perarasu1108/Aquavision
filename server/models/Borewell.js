const mongoose = require('mongoose');

const borewellSchema = new mongoose.Schema({
  borewellId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Borewell name is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  depth: {
    type: Number,
    required: true,
    min: 0
  },
  diameter: {
    type: Number,
    default: 6 // inches
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Maintenance'],
    default: 'Active'
  },
  installedDate: {
    type: Date,
    default: Date.now
  },
  lastServicedDate: {
    type: Date
  },
  currentWaterLevel: {
    type: Number, // meters below ground level
    default: 0
  },
  yieldRate: {
    type: Number, // liters per hour
    default: 0
  },
  pumpType: {
    type: String,
    enum: ['Submersible', 'Centrifugal', 'Jet', 'Hand Pump'],
    default: 'Submersible'
  },
  motorHP: {
    type: Number,
    default: 5
  },
  district: {
    type: String,
    required: true
  },
  block: {
    type: String,
    default: ''
  },
  village: {
    type: String,
    default: ''
  },
  owner: {
    type: String,
    default: 'Government'
  }
}, {
  timestamps: true
});

// Geospatial index for map queries
borewellSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Borewell', borewellSchema);
