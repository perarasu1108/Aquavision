const express = require('express');
const router = express.Router();
const {
  getBorewells, getBorewell, createBorewell,
  updateBorewell, deleteBorewell, getBorewellStats
} = require('../controllers/borewellController');
const { protect } = require('../middleware/auth');

router.get('/stats', getBorewellStats);
router.route('/').get(getBorewells).post(protect, createBorewell);
router.route('/:id').get(getBorewell).put(protect, updateBorewell).delete(protect, deleteBorewell);

module.exports = router;
