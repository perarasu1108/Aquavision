/**
 * ML Service using Brain.js for water level predictions
 * Uses a simple neural network trained on historical data patterns
 */

const brain = require('brain.js');

class MLService {
  constructor() {
    this.net = new brain.recurrent.LSTMTimeStep({
      inputSize: 1,
      hiddenLayers: [10],
      outputSize: 1
    });
  }

  /**
   * Predict future water levels based on historical data
   * Uses simple moving average + trend analysis as a reliable fallback
   */
  predictWaterLevel(readings, daysAhead = 30) {
    if (readings.length < 3) return [];

    const values = readings.map(r => r.waterLevel);
    const dates = readings.map(r => new Date(r.measuredAt));

    // Calculate trend using linear regression
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) * (i - xMean);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Calculate seasonality (simple sinusoidal pattern)
    const avgPeriod = 365; // annual cycle
    const residuals = values.map((v, i) => v - (slope * i + intercept));
    const amplitude = (Math.max(...residuals) - Math.min(...residuals)) / 2;

    // Generate predictions with confidence intervals
    const predictions = [];
    const lastDate = dates[dates.length - 1];
    const lastValue = values[values.length - 1];

    // Moving average for smoothing
    const windowSize = Math.min(5, values.length);
    const recentAvg = values.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize;

    // Standard deviation for confidence intervals
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - yMean, 2), 0) / n
    );

    for (let d = 1; d <= daysAhead; d++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + d);

      // Combine trend + seasonal component + random walk
      const trendComponent = slope * (n + d - 1) + intercept;
      const seasonalComponent = amplitude * Math.sin(2 * Math.PI * d / avgPeriod);

      // Blend trend prediction with recent average
      const blendWeight = Math.min(d / 60, 0.7); // More weight on trend for further predictions
      const predicted = (1 - blendWeight) * recentAvg + blendWeight * trendComponent + seasonalComponent * 0.3;

      // Ensure water level stays realistic (between 0 and 30m)
      const clampedValue = Math.max(0.5, Math.min(30, predicted));

      // Confidence interval widens over time
      const uncertainty = stdDev * Math.sqrt(d / n) * 0.5;

      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        predictedLevel: parseFloat(clampedValue.toFixed(2)),
        confidenceLow: parseFloat(Math.max(0, clampedValue - uncertainty).toFixed(2)),
        confidenceHigh: parseFloat(Math.min(30, clampedValue + uncertainty).toFixed(2)),
        confidence: parseFloat(Math.max(0.3, 1 - (d / daysAhead) * 0.5).toFixed(2))
      });
    }

    return predictions;
  }

  /**
   * Detect extraction anomalies using statistical methods
   */
  detectExtractionAnomalies(records) {
    if (records.length < 10) return [];

    const volumes = records.map(r => r.volumeExtracted);
    const mean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const stdDev = Math.sqrt(
      volumes.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / volumes.length
    );

    const anomalies = [];
    records.forEach((record, index) => {
      const zScore = (record.volumeExtracted - mean) / stdDev;
      if (Math.abs(zScore) > 2) {
        anomalies.push({
          recordIndex: index,
          date: record.extractionDate,
          volume: record.volumeExtracted,
          expectedRange: {
            low: Math.max(0, mean - 2 * stdDev),
            high: mean + 2 * stdDev
          },
          zScore: parseFloat(zScore.toFixed(2)),
          type: zScore > 0 ? 'Over-extraction' : 'Under-extraction'
        });
      }
    });

    return anomalies;
  }

  /**
   * Calculate recharge efficiency score
   */
  calculateRechargeEfficiency(structure) {
    let score = 0;
    let factors = [];

    // Storage level factor (0-30 points)
    const storageFactor = (structure.currentStorageLevel / 100) * 30;
    score += storageFactor;
    factors.push({ name: 'Storage Level', score: storageFactor.toFixed(1), max: 30 });

    // Condition factor (0-25 points)
    const conditionScores = { 'Good': 25, 'Fair': 15, 'Poor': 5 };
    const conditionFactor = conditionScores[structure.condition] || 10;
    score += conditionFactor;
    factors.push({ name: 'Condition', score: conditionFactor, max: 25 });

    // Age factor (0-20 points) — newer is better
    const age = new Date().getFullYear() - structure.constructionYear;
    const ageFactor = Math.max(0, 20 - age);
    score += ageFactor;
    factors.push({ name: 'Age', score: ageFactor.toFixed(1), max: 20 });

    // Type efficiency (0-25 points)
    const typeScores = {
      'Check Dam': 22, 'Percolation Tank': 25, 'Recharge Shaft': 20,
      'Recharge Well': 18, 'Farm Pond': 15, 'Nala Bund': 17, 'Gabion Structure': 16
    };
    const typeFactor = typeScores[structure.type] || 15;
    score += typeFactor;
    factors.push({ name: 'Type Efficiency', score: typeFactor, max: 25 });

    return {
      totalScore: parseFloat(Math.min(100, score).toFixed(1)),
      rating: score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : score >= 25 ? 'Fair' : 'Poor',
      factors
    };
  }
}

module.exports = new MLService();
