const express = require('express');
const router = express.Router();
const {
  getRecords, addRecord, getPatterns, getByPurpose
} = require('../controllers/extractionController');
const { protect } = require('../middleware/auth');

router.get('/patterns', getPatterns);
router.get('/by-purpose', getByPurpose);
router.route('/').get(getRecords).post(protect, addRecord);

module.exports = router;
