const express = require('express');
const router = express.Router();
const simStatusHistoryController = require('../controllers/simStatusHistoryController');

/**
 * @route   GET /api/sim-status-history
 * @desc    Get all SIM status history
 */
router.get('/', simStatusHistoryController.getAllHistory);

/**
 * @route   GET /api/sim-status-history/:id
 * @desc    Get SIM status history by ID
 */
router.get('/:id', simStatusHistoryController.getHistoryById);

/**
 * @route   GET /api/sim-status-history/sim/:simId
 * @desc    Get SIM status history by SIM ID
 */
router.get('/sim/:simId', simStatusHistoryController.getHistoryBySimId);

/**
 * @route   POST /api/sim-status-history
 * @desc    Create new SIM status history entry
 */
router.post('/', simStatusHistoryController.createHistory);

/**
 * @route   DELETE /api/sim-status-history/:id
 * @desc    Delete SIM status history entry
 */
router.delete('/:id', simStatusHistoryController.deleteHistory);

module.exports = router;
