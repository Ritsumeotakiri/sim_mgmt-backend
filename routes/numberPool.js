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
 * @route   GET /api/number-pool/:msisdn
 * @desc    Get number by MSISDN
 */
router.get('/:msisdn', numberPoolController.getNumberByMsisdn);

/**
 * @route   GET /api/number-pool/status/:status
 * @desc    Get numbers by status
 */
router.get('/status/:status', numberPoolController.getNumbersByStatus);

/**
 * @route   POST /api/number-pool
 * @desc    Create new number in pool
 */
router.post('/', validateNumberPool, numberPoolController.createNumber);

/**
 * @route   PUT /api/number-pool/:msisdn
 * @desc    Update number in pool
 */
router.put('/:msisdn', validateNumberPool, numberPoolController.updateNumber);

/**
 * @route   DELETE /api/number-pool/:msisdn
 * @desc    Delete number from pool
 */
router.delete('/:msisdn', numberPoolController.deleteNumber);

module.exports = router;
