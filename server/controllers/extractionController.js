const ExtractionRecord = require('../models/ExtractionRecord');
const Borewell = require('../models/Borewell');

// @desc    Get extraction records
// @route   GET /api/extraction
exports.getRecords = async (req, res, next) => {
  try {
    const { borewellId, purpose, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};

    if (borewellId) query.borewellId = borewellId;
    if (purpose) query.purpose = purpose;
    if (startDate || endDate) {
      query.extractionDate = {};
      if (startDate) query.extractionDate.$gte = new Date(startDate);
      if (endDate) query.extractionDate.$lte = new Date(endDate);
    }

    const total = await ExtractionRecord.countDocuments(query);
    const records = await ExtractionRecord.find(query)
      .populate('borewellId', 'borewellId name district')
      .sort({ extractionDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: records.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add extraction record
// @route   POST /api/extraction
exports.addRecord = async (req, res, next) => {
  try {
    const record = await ExtractionRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Get extraction patterns (monthly aggregations)
// @route   GET /api/extraction/patterns
exports.getPatterns = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPatterns = await ExtractionRecord.aggregate([
      { $match: { extractionDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$extractionDate' },
            month: { $month: '$extractionDate' }
          },
          totalVolume: { $sum: '$volumeExtracted' },
          totalHours: { $sum: '$pumpingDuration' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Daily pattern for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const dailyPatterns = await ExtractionRecord.aggregate([
      { $match: { extractionDate: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { $dayOfMonth: '$extractionDate' },
          totalVolume: { $sum: '$volumeExtracted' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { monthlyPatterns, dailyPatterns }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get extraction by purpose
// @route   GET /api/extraction/by-purpose
exports.getByPurpose = async (req, res, next) => {
  try {
    const purposeBreakdown = await ExtractionRecord.aggregate([
      {
        $group: {
          _id: '$purpose',
          totalVolume: { $sum: '$volumeExtracted' },
          totalHours: { $sum: '$pumpingDuration' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalVolume: -1 } }
    ]);

    // Top extracting borewells
    const topBorewells = await ExtractionRecord.aggregate([
      {
        $group: {
          _id: '$borewellId',
          totalVolume: { $sum: '$volumeExtracted' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalVolume: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'borewells',
          localField: '_id',
          foreignField: '_id',
          as: 'borewell'
        }
      },
      { $unwind: '$borewell' },
      {
        $project: {
          borewellId: '$borewell.borewellId',
          name: '$borewell.name',
          district: '$borewell.district',
          totalVolume: 1,
          count: 1
        }
      }
    ]);

    const totalExtraction = await ExtractionRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$volumeExtracted' }, totalHours: { $sum: '$pumpingDuration' } } }
    ]);

    res.json({
      success: true,
      data: {
        purposeBreakdown,
        topBorewells,
        totalVolume: totalExtraction[0]?.total || 0,
        totalPumpingHours: totalExtraction[0]?.totalHours || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
