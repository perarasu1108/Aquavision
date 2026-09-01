const express = require('express');
const router = express.Router();
const {
  getStructures, getStructure, createStructure, updateStructure, getRechargeStats
} = require('../controllers/rechargeController');
const { protect } = require('../middleware/auth');

router.get('/stats', getRechargeStats);
router.route('/').get(getStructures).post(protect, createStructure);
router.route('/:id').get(getStructure).put(protect, updateStructure);

module.exports = router;
