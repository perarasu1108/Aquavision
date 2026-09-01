const express = require('express');
const router = express.Router();
const {
  getAlerts, getUnreadCount, markAsRead, resolveAlert, getAlertStats
} = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.get('/unread-count', getUnreadCount);
router.get('/stats', getAlertStats);
router.get('/', getAlerts);
router.put('/:id/read', markAsRead);
router.put('/:id/resolve', protect, resolveAlert);

module.exports = router;
