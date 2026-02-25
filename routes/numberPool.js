const express = require('express');
const router = express.Router();
const numberPoolController = require('../controllers/numberPoolController');
const { validateNumberPool } = require('../utils/validators');

/**
 * @route   GET /api/number-pool
 * @desc    Get all numbers in pool
 */
router.get('/', numberPoolController.getAllNumbers);

/**
 * @route   GET /api/number-pool/status/:status
 * @desc    Get numbers by status
 */
router.get('/status/:status', numberPoolController.getNumbersByStatus);

/**
 * @route   GET /api/number-pool/msisdn/:msisdn
 * @desc    Get number by MSISDN
 */
router.get('/msisdn/:msisdn', numberPoolController.getNumberByMsisdn);

/**
 * @route   GET /api/number-pool/:id
 * @desc    Get number by ID
 */
router.get('/:id', numberPoolController.getNumberById);

/**
 * @route   POST /api/number-pool
 * @desc    Create new number in pool
 */
router.post('/', validateNumberPool, numberPoolController.createNumber);

/**
 * @route   PUT /api/number-pool/:id
 * @desc    Update number in pool
 */
router.put('/:id', validateNumberPool, numberPoolController.updateNumber);

/**
 * @route   DELETE /api/number-pool/:id
 * @desc    Delete number from pool
 */
router.delete('/:id', numberPoolController.deleteNumber);

module.exports = router;
