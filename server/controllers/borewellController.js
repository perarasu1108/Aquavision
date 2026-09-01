const Borewell = require('../models/Borewell');

// @desc    Get all borewells
// @route   GET /api/borewells
exports.getBorewells = async (req, res, next) => {
  try {
    const { district, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (district) query.district = district;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { borewellId: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Borewell.countDocuments(query);
    const borewells = await Borewell.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: borewells.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: borewells
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single borewell
// @route   GET /api/borewells/:id
exports.getBorewell = async (req, res, next) => {
  try {
    const borewell = await Borewell.findById(req.params.id);
    if (!borewell) {
      return res.status(404).json({ success: false, message: 'Borewell not found' });
    }
    res.json({ success: true, data: borewell });
  } catch (error) {
    next(error);
  }
};

// @desc    Create borewell
// @route   POST /api/borewells
exports.createBorewell = async (req, res, next) => {
  try {
    const borewell = await Borewell.create(req.body);
    res.status(201).json({ success: true, data: borewell });
  } catch (error) {
    next(error);
  }
};

// @desc    Update borewell
// @route   PUT /api/borewells/:id
exports.updateBorewell = async (req, res, next) => {
  try {
    const borewell = await Borewell.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!borewell) {
      return res.status(404).json({ success: false, message: 'Borewell not found' });
    }
    res.json({ success: true, data: borewell });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete borewell
// @route   DELETE /api/borewells/:id
exports.deleteBorewell = async (req, res, next) => {
  try {
    const borewell = await Borewell.findByIdAndDelete(req.params.id);
    if (!borewell) {
      return res.status(404).json({ success: false, message: 'Borewell not found' });
    }
    res.json({ success: true, message: 'Borewell deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get borewell statistics
// @route   GET /api/borewells/stats
exports.getBorewellStats = async (req, res, next) => {
  try {
    const total = await Borewell.countDocuments();
    const active = await Borewell.countDocuments({ status: 'Active' });
    const inactive = await Borewell.countDocuments({ status: 'Inactive' });
    const maintenance = await Borewell.countDocuments({ status: 'Under Maintenance' });

    const avgWaterLevel = await Borewell.aggregate([
      { $group: { _id: null, avg: { $avg: '$currentWaterLevel' } } }
    ]);

    const avgYield = await Borewell.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: null, avg: { $avg: '$yieldRate' } } }
    ]);

    const districtWise = await Borewell.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 }, avgLevel: { $avg: '$currentWaterLevel' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        maintenance,
        avgWaterLevel: avgWaterLevel[0]?.avg?.toFixed(2) || 0,
        avgYield: avgYield[0]?.avg?.toFixed(2) || 0,
        districtWise
      }
    });
  } catch (error) {
    next(error);
  }
};
