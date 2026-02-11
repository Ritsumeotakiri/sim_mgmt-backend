const express = require('express');
const router = express.Router();
const simOwnerHistoryController = require('../controllers/simOwnerHistoryController');

/**
 * @route   GET /api/sim-owner-history
 * @desc    Get all SIM owner history
 */
router.get('/', simOwnerHistoryController.getAllHistory);

/**
 * @route   GET /api/sim-owner-history/:id
 * @desc    Get SIM owner history by ID
 */
router.get('/:id', simOwnerHistoryController.getHistoryById);

/**
 * @route   GET /api/sim-owner-history/sim/:simId
 * @desc    Get SIM owner history by SIM ID
 */
router.get('/sim/:simId', simOwnerHistoryController.getHistoryBySimId);

/**
 * @route   POST /api/sim-owner-history
 * @desc    Create new SIM owner history entry
 */
router.post('/', simOwnerHistoryController.createHistory);

/**
 * @route   DELETE /api/sim-owner-history/:id
 * @desc    Delete SIM owner history entry
 */
router.delete('/:id', simOwnerHistoryController.deleteHistory);

module.exports = router;
