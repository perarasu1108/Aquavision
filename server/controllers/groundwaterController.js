const GroundwaterLevel = require('../models/GroundwaterLevel');
const Borewell = require('../models/Borewell');

// @desc    Get all groundwater readings
// @route   GET /api/groundwater
exports.getReadings = async (req, res, next) => {
  try {
    const { borewellId, season, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};

    if (borewellId) query.borewellId = borewellId;
    if (season) query.season = season;
    if (startDate || endDate) {
      query.measuredAt = {};
      if (startDate) query.measuredAt.$gte = new Date(startDate);
      if (endDate) query.measuredAt.$lte = new Date(endDate);
    }

    const total = await GroundwaterLevel.countDocuments(query);
    const readings = await GroundwaterLevel.find(query)
      .populate('borewellId', 'borewellId name district')
      .sort({ measuredAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: readings.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: readings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add groundwater reading
// @route   POST /api/groundwater
exports.addReading = async (req, res, next) => {
  try {
    const reading = await GroundwaterLevel.create(req.body);

    // Update borewell's current water level
    await Borewell.findByIdAndUpdate(req.body.borewellId, {
      currentWaterLevel: req.body.waterLevel
    });

    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trends for a specific borewell
// @route   GET /api/groundwater/trends/:borewellId
exports.getTrends = async (req, res, next) => {
  try {
    const readings = await GroundwaterLevel.find({ borewellId: req.params.borewellId })
      .sort({ measuredAt: 1 })
      .select('waterLevel measuredAt season qualityParams');

    res.json({ success: true, data: readings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get district-wide groundwater summary
// @route   GET /api/groundwater/summary
exports.getSummary = async (req, res, next) => {
  try {
    // Average water levels by month across all borewells (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyAvg = await GroundwaterLevel.aggregate([
      { $match: { measuredAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$measuredAt' },
            month: { $month: '$measuredAt' }
          },
          avgLevel: { $avg: '$waterLevel' },
          minLevel: { $min: '$waterLevel' },
          maxLevel: { $max: '$waterLevel' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Average quality params
    const qualityAvg = await GroundwaterLevel.aggregate([
      { $match: { measuredAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: null,
          avgPh: { $avg: '$qualityParams.ph' },
          avgTds: { $avg: '$qualityParams.tds' },
          avgHardness: { $avg: '$qualityParams.hardness' },
          avgChloride: { $avg: '$qualityParams.chloride' },
          avgFluoride: { $avg: '$qualityParams.fluoride' },
          avgNitrate: { $avg: '$qualityParams.nitrate' }
        }
      }
    ]);

    // Season-wise averages
    const seasonAvg = await GroundwaterLevel.aggregate([
      { $match: { measuredAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: '$season',
          avgLevel: { $avg: '$waterLevel' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReadings = await GroundwaterLevel.countDocuments();

    res.json({
      success: true,
      data: {
        monthlyAvg,
        qualityAvg: qualityAvg[0] || {},
        seasonAvg,
        totalReadings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get heatmap data (avg water levels per borewell location)
// @route   GET /api/groundwater/heatmap
exports.getHeatmap = async (req, res, next) => {
  try {
    const borewells = await Borewell.find({}, 'borewellId name location currentWaterLevel district status');

    const heatmapData = borewells.map(bw => ({
      id: bw._id,
      borewellId: bw.borewellId,
      name: bw.name,
      lat: bw.location.coordinates[1],
      lng: bw.location.coordinates[0],
      waterLevel: bw.currentWaterLevel,
      district: bw.district,
      status: bw.status
    }));

    res.json({ success: true, data: heatmapData });
  } catch (error) {
    next(error);
  }
};
