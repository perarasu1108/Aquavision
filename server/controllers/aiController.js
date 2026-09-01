const Borewell = require('../models/Borewell');
const GroundwaterLevel = require('../models/GroundwaterLevel');
const ExtractionRecord = require('../models/ExtractionRecord');
const RechargeStructure = require('../models/RechargeStructure');
const Alert = require('../models/Alert');
const mlService = require('../services/mlService');

// @desc    Predict groundwater level for a borewell
// @route   POST /api/ai/predict-level
exports.predictLevel = async (req, res, next) => {
  try {
    const { borewellId, daysAhead = 30 } = req.body;

    const readings = await GroundwaterLevel.find({ borewellId })
      .sort({ measuredAt: 1 })
      .select('waterLevel measuredAt');

    if (readings.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient data for prediction. Need at least 5 readings.'
      });
    }

    const predictions = mlService.predictWaterLevel(readings, daysAhead);

    res.json({
      success: true,
      data: {
        borewellId,
        historicalReadings: readings.length,
        predictions,
        daysAhead
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-generated recommendations
// @route   GET /api/ai/recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = [];

    // Find borewells with critical water levels
    const criticalBorewells = await Borewell.find({ currentWaterLevel: { $gt: 15 }, status: 'Active' });
    criticalBorewells.forEach(bw => {
      recommendations.push({
        priority: 'High',
        category: 'Water Level',
        title: `Critical water level at ${bw.name}`,
        message: `Water level at ${bw.borewellId} is ${bw.currentWaterLevel}m below ground. Consider reducing extraction and increasing recharge efforts nearby.`,
        entityType: 'Borewell',
        entityId: bw._id,
        action: 'Reduce extraction by 30%'
      });
    });

    // Find structures needing maintenance
    const poorStructures = await RechargeStructure.find({ condition: 'Poor', status: 'Operational' });
    poorStructures.forEach(rs => {
      recommendations.push({
        priority: 'Medium',
        category: 'Maintenance',
        title: `Maintenance needed: ${rs.name}`,
        message: `${rs.type} "${rs.name}" (${rs.structureId}) is in poor condition. Schedule inspection and maintenance to maintain recharge efficiency.`,
        entityType: 'RechargeStructure',
        entityId: rs._id,
        action: 'Schedule maintenance inspection'
      });
    });

    // Find low-recharge structures
    const lowRecharge = await RechargeStructure.find({ currentStorageLevel: { $lt: 20 }, status: 'Operational' });
    lowRecharge.forEach(rs => {
      recommendations.push({
        priority: 'Medium',
        category: 'Recharge',
        title: `Low storage at ${rs.name}`,
        message: `${rs.type} "${rs.name}" is at only ${rs.currentStorageLevel}% storage capacity. Consider diverting water inflow or repairing intake channels.`,
        entityType: 'RechargeStructure',
        entityId: rs._id,
        action: 'Repair intake channels'
      });
    });

    // Over-extraction analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentExtraction = await ExtractionRecord.aggregate([
      { $match: { extractionDate: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$borewellId',
          totalVolume: { $sum: '$volumeExtracted' },
          totalHours: { $sum: '$pumpingDuration' },
          count: { $sum: 1 }
        }
      },
      { $match: { totalHours: { $gt: 200 } } },
      {
        $lookup: {
          from: 'borewells',
          localField: '_id',
          foreignField: '_id',
          as: 'borewell'
        }
      },
      { $unwind: '$borewell' }
    ]);

    recentExtraction.forEach(rec => {
      recommendations.push({
        priority: 'High',
        category: 'Extraction',
        title: `Over-extraction at ${rec.borewell.name}`,
        message: `${rec.borewell.borewellId} has been pumped for ${rec.totalHours.toFixed(0)} hours in the last 30 days (${rec.count} sessions). This exceeds sustainable limits.`,
        entityType: 'Borewell',
        entityId: rec._id,
        action: 'Implement extraction schedule'
      });
    });

    // Sort by priority
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};

// @desc    Detect anomalies in data
// @route   GET /api/ai/anomalies
exports.getAnomalies = async (req, res, next) => {
  try {
    const anomalies = [];

    // Sudden water level drops
    const borewells = await Borewell.find({ status: 'Active' });

    for (const bw of borewells) {
      const recentReadings = await GroundwaterLevel.find({ borewellId: bw._id })
        .sort({ measuredAt: -1 })
        .limit(5)
        .select('waterLevel measuredAt');

      if (recentReadings.length >= 2) {
        const latest = recentReadings[0].waterLevel;
        const previous = recentReadings[1].waterLevel;
        const change = latest - previous;

        if (Math.abs(change) > 3) {
          anomalies.push({
            type: 'Sudden Level Change',
            severity: Math.abs(change) > 5 ? 'Critical' : 'Warning',
            entity: bw.name,
            entityId: bw._id,
            message: `Water level ${change > 0 ? 'dropped' : 'rose'} by ${Math.abs(change).toFixed(1)}m at ${bw.borewellId}`,
            value: change,
            detectedAt: recentReadings[0].measuredAt
          });
        }
      }
    }

    res.json({ success: true, data: anomalies });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Chat — answer questions about water resource data
// @route   POST /api/ai/chat
exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Gather context data for the AI
    const totalBorewells = await Borewell.countDocuments();
    const activeBorewells = await Borewell.countDocuments({ status: 'Active' });
    const avgWaterLevel = await Borewell.aggregate([
      { $group: { _id: null, avg: { $avg: '$currentWaterLevel' } } }
    ]);
    const criticalCount = await Borewell.countDocuments({ currentWaterLevel: { $gt: 15 } });
    const totalStructures = await RechargeStructure.countDocuments();
    const unresolvedAlerts = await Alert.countDocuments({ isResolved: false });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyExtraction = await ExtractionRecord.aggregate([
      { $match: { extractionDate: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$volumeExtracted' } } }
    ]);

    const districtData = await Borewell.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 }, avgLevel: { $avg: '$currentWaterLevel' } } }
    ]);

    const context = {
      totalBorewells,
      activeBorewells,
      avgWaterLevel: avgWaterLevel[0]?.avg?.toFixed(2) || 'N/A',
      criticalBorewells: criticalCount,
      totalRechargeStructures: totalStructures,
      unresolvedAlerts,
      monthlyExtraction: monthlyExtraction[0]?.total || 0,
      districtData
    };

    // Try to use Gemini API if available
    let response;
    try {
      const geminiService = require('../services/geminiService');
      response = await geminiService.chat(message, context);
    } catch (err) {
      // Fallback to rule-based response if Gemini is not configured
      response = generateFallbackResponse(message, context);
    }

    res.json({ success: true, data: { response, context } });
  } catch (error) {
    next(error);
  }
};

function generateFallbackResponse(message, context) {
  const msg = message.toLowerCase();

  if (msg.includes('borewell') || msg.includes('bore well')) {
    return `📊 **Borewell Summary**\n\nWe currently monitor **${context.totalBorewells}** borewells, of which **${context.activeBorewells}** are active. The average water level is **${context.avgWaterLevel}m** below ground level. **${context.criticalBorewells}** borewells are at critical levels (>15m deep).`;
  }

  if (msg.includes('water level') || msg.includes('groundwater')) {
    return `💧 **Groundwater Status**\n\nThe average groundwater level across all monitored borewells is **${context.avgWaterLevel}m** below ground level. **${context.criticalBorewells}** borewells are showing critically low water levels and require immediate attention.`;
  }

  if (msg.includes('extraction') || msg.includes('pumping')) {
    const vol = (context.monthlyExtraction / 1000).toFixed(0);
    return `🔄 **Extraction Report**\n\nTotal extraction in the last 30 days: **${vol} kL** (${context.monthlyExtraction.toLocaleString()} liters). Monitor the Extraction Patterns page for detailed purpose-wise breakdowns.`;
  }

  if (msg.includes('recharge') || msg.includes('structure')) {
    return `🏗️ **Recharge Infrastructure**\n\nWe have **${context.totalRechargeStructures}** recharge structures in the system. Visit the Recharge Structures page for detailed capacity and condition information.`;
  }

  if (msg.includes('alert') || msg.includes('warning')) {
    return `🚨 **Alert Status**\n\nThere are currently **${context.unresolvedAlerts}** unresolved alerts. Visit the Alerts page to review and resolve them.`;
  }

  if (msg.includes('summary') || msg.includes('overview') || msg.includes('status')) {
    return `📋 **System Overview**\n\n- **Borewells**: ${context.totalBorewells} total (${context.activeBorewells} active)\n- **Avg Water Level**: ${context.avgWaterLevel}m below ground\n- **Critical Borewells**: ${context.criticalBorewells}\n- **Recharge Structures**: ${context.totalRechargeStructures}\n- **Unresolved Alerts**: ${context.unresolvedAlerts}\n- **Monthly Extraction**: ${(context.monthlyExtraction / 1000).toFixed(0)} kL\n\n**Districts**: ${context.districtData.map(d => `${d._id} (${d.count} borewells, avg ${d.avgLevel?.toFixed(1)}m)`).join(', ')}`;
  }

  return `🤖 **AquaVision AI**\n\nI can help you with information about:\n- **Borewells** — status, water levels, maintenance\n- **Groundwater levels** — trends, predictions\n- **Extraction patterns** — volumes, schedules\n- **Recharge structures** — capacity, conditions\n- **Alerts** — unresolved issues\n\nTry asking: "What is the current groundwater status?" or "Show me a summary"`;
}
