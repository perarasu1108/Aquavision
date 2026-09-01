const RechargeStructure = require('../models/RechargeStructure');

// @desc    Get all recharge structures
// @route   GET /api/recharge
exports.getStructures = async (req, res, next) => {
  try {
    const { type, status, district, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (district) query.district = district;

    const total = await RechargeStructure.countDocuments(query);
    const structures = await RechargeStructure.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: structures.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: structures
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single structure
// @route   GET /api/recharge/:id
exports.getStructure = async (req, res, next) => {
  try {
    const structure = await RechargeStructure.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Structure not found' });
    }
    res.json({ success: true, data: structure });
  } catch (error) {
    next(error);
  }
};

// @desc    Create structure
// @route   POST /api/recharge
exports.createStructure = async (req, res, next) => {
  try {
    const structure = await RechargeStructure.create(req.body);
    res.status(201).json({ success: true, data: structure });
  } catch (error) {
    next(error);
  }
};

// @desc    Update structure
// @route   PUT /api/recharge/:id
exports.updateStructure = async (req, res, next) => {
  try {
    const structure = await RechargeStructure.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Structure not found' });
    }
    res.json({ success: true, data: structure });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recharge stats
// @route   GET /api/recharge/stats
exports.getRechargeStats = async (req, res, next) => {
  try {
    const total = await RechargeStructure.countDocuments();
    const operational = await RechargeStructure.countDocuments({ status: 'Operational' });

    const typeWise = await RechargeStructure.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, avgStorage: { $avg: '$currentStorageLevel' } } },
      { $sort: { count: -1 } }
    ]);

    const totalCapacity = await RechargeStructure.aggregate([
      { $group: { _id: null, total: { $sum: '$capacity' }, avgStorage: { $avg: '$currentStorageLevel' } } }
    ]);

    const conditionSummary = await RechargeStructure.aggregate([
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);

    const totalRecharge = await RechargeStructure.aggregate([
      { $group: { _id: null, total: { $sum: '$estimatedRecharge' } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        operational,
        typeWise,
        totalCapacity: totalCapacity[0]?.total || 0,
        avgStorageLevel: totalCapacity[0]?.avgStorage?.toFixed(1) || 0,
        conditionSummary,
        totalEstimatedRecharge: totalRecharge[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
