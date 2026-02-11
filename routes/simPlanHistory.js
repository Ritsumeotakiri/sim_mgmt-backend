const express = require('express');
const router = express.Router();
const simPlanHistoryController = require('../controllers/simPlanHistoryController');

/**
 * @route   GET /api/sim-plan-history
 * @desc    Get all SIM plan history
 */
router.get('/', simPlanHistoryController.getAllHistory);

/**
 * @route   GET /api/sim-plan-history/:id
 * @desc    Get SIM plan history by ID
 */
router.get('/:id', simPlanHistoryController.getHistoryById);

/**
 * @route   GET /api/sim-plan-history/sim/:simId
 * @desc    Get SIM plan history by SIM ID
 */
router.get('/sim/:simId', simPlanHistoryController.getHistoryBySimId);

/**
 * @route   POST /api/sim-plan-history
 * @desc    Create new SIM plan history entry
 */
router.post('/', simPlanHistoryController.createHistory);

/**
 * @route   PUT /api/sim-plan-history/:id
 * @desc    Update SIM plan history entry
 */
router.put('/:id', simPlanHistoryController.updateHistory);

/**
 * @route   DELETE /api/sim-plan-history/:id
 * @desc    Delete SIM plan history entry
 */
router.delete('/:id', simPlanHistoryController.deleteHistory);

module.exports = router;
