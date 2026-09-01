const Alert = require('../models/Alert');

// @desc    Get all alerts
// @route   GET /api/alerts
exports.getAlerts = async (req, res, next) => {
  try {
    const { severity, type, isResolved, page = 1, limit = 20 } = req.query;
    const query = {};

    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (isResolved !== undefined) query.isResolved = isResolved === 'true';

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: alerts.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread alert count
// @route   GET /api/alerts/unread-count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Alert.countDocuments({ isRead: false });
    const critical = await Alert.countDocuments({ isRead: false, severity: 'Critical' });
    res.json({ success: true, data: { count, critical } });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
exports.resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, {
      isResolved: true,
      isRead: true,
      resolvedAt: new Date(),
      resolvedBy: req.user?._id
    }, { new: true });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Get alert statistics
// @route   GET /api/alerts/stats
exports.getAlertStats = async (req, res, next) => {
  try {
    const total = await Alert.countDocuments();
    const unresolved = await Alert.countDocuments({ isResolved: false });

    const bySeverity = await Alert.aggregate([
      { $match: { isResolved: false } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    const byType = await Alert.aggregate([
      { $match: { isResolved: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Weekly trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTrend = await Alert.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { total, unresolved, bySeverity, byType, weeklyTrend }
    });
  } catch (error) {
    next(error);
  }
};
