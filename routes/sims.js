const express = require('express');
const router = express.Router();
const simsController = require('../controllers/simsController');
const { validateSIM } = require('../utils/validators');

/**
 * @route   GET /api/sims
 * @desc    Get all SIMs
 */
router.get('/', simsController.getAllSims);

/**
 * @route   GET /api/sims/:id
 * @desc    Get SIM by ID
 */
router.get('/:id', simsController.getSimById);

/**
 * @route   GET /api/sims/branch/:branchId
 * @desc    Get SIMs by branch ID
 */
router.get('/branch/:branchId', simsController.getSimsByBranch);

/**
 * @route   GET /api/sims/customer/:customerId
 * @desc    Get SIMs by customer ID
 */
router.get('/customer/:customerId', simsController.getSimsByCustomer);

/**
 * @route   POST /api/sims
 * @desc    Create new SIM
 */
router.post('/', validateSIM, simsController.createSim);

/**
 * @route   PUT /api/sims/:id
 * @desc    Update SIM
 */
router.put('/:id', validateSIM, simsController.updateSim);

/**
 * @route   DELETE /api/sims/:id
 * @desc    Delete SIM
 */
router.delete('/:id', simsController.deleteSim);

/**
 * @route   POST /api/sims/:id/activate
 * @desc    Activate SIM via SOAP
 */
router.post('/:id/activate', simsController.activateSim);

/**
 * @route   POST /api/sims/:id/deactivate
 * @desc    Deactivate SIM via SOAP
 */
router.post('/:id/deactivate', simsController.deactivateSim);

/**
 * @route   POST /api/sims/:id/change-owner
 * @desc    Change SIM owner
 */
router.post('/:id/change-owner', simsController.changeOwner);

/**
 * @route   POST /api/sims/:id/assign-plan
 * @desc    Assign plan to SIM
 */
router.post('/:id/assign-plan', simsController.assignPlan);

module.exports = router;
