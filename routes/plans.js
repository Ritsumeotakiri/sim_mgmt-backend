const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');
const { validatePlan } = require('../utils/validators');

/**
 * @route   GET /api/plans
 * @desc    Get all plans
 */
router.get('/', plansController.getAllPlans);

/**
 * @route   GET /api/plans/:id
 * @desc    Get plan by ID
 */
router.get('/:id', plansController.getPlanById);

/**
 * @route   POST /api/plans
 * @desc    Create new plan
 */
router.post('/', validatePlan, plansController.createPlan);

/**
 * @route   PUT /api/plans/:id
 * @desc    Update plan
 */
router.put('/:id', validatePlan, plansController.updatePlan);

/**
 * @route   DELETE /api/plans/:id
 * @desc    Delete plan
 */
router.delete('/:id', plansController.deletePlan);

module.exports = router;
