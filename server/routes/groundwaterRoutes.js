const express = require('express');
const router = express.Router();
const {
  getReadings, addReading, getTrends, getSummary, getHeatmap
} = require('../controllers/groundwaterController');
const { protect } = require('../middleware/auth');

router.get('/summary', getSummary);
router.get('/heatmap', getHeatmap);
router.get('/trends/:borewellId', getTrends);
router.route('/').get(getReadings).post(protect, addReading);

module.exports = router;
