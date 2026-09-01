const mongoose = require('mongoose');

const rechargeStructureSchema = new mongoose.Schema({
  structureId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Structure name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Check Dam', 'Percolation Tank', 'Recharge Shaft', 'Recharge Well', 'Farm Pond', 'Nala Bund', 'Gabion Structure'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  capacity: {
    type: Number, // cubic meters
    required: true
  },
  currentStorageLevel: {
    type: Number, // percentage
    min: 0,
    max: 100,
    default: 0
  },
  constructionYear: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Operational', 'Under Construction', 'Decommissioned', 'Needs Repair'],
    default: 'Operational'
  },
  condition: {
    type: String,
    enum: ['Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  beneficiaryVillages: {
    type: [String],
    default: []
  },
  lastInspectionDate: {
    type: Date
  },
  estimatedRecharge: {
    type: Number, // cubic meters per year
    default: 0
  },
  cost: {
    type: Number, // construction cost in INR
    default: 0
  },
  district: {
    type: String,
    required: true
  },
  block: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

rechargeStructureSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RechargeStructure', rechargeStructureSchema);
