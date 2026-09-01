const express = require('express');
const router = express.Router();
const {
  predictLevel, getRecommendations, getAnomalies, chat
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/predict-level', predictLevel);
router.get('/recommendations', getRecommendations);
router.get('/anomalies', getAnomalies);
router.post('/chat', chat);

module.exports = router;
