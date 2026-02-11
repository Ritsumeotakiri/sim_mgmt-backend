const express = require('express');
const router = express.Router();
const branchesController = require('../controllers/branchesController');
const { validateBranch } = require('../utils/validators');

/**
 * @route   GET /api/branches
 * @desc    Get all branches
 */
router.get('/', branchesController.getAllBranches);

/**
 * @route   GET /api/branches/:id
 * @desc    Get branch by ID
 */
router.get('/:id', branchesController.getBranchById);

/**
 * @route   POST /api/branches
 * @desc    Create new branch
 */
router.post('/', validateBranch, branchesController.createBranch);

/**
 * @route   PUT /api/branches/:id
 * @desc    Update branch
 */
router.put('/:id', validateBranch, branchesController.updateBranch);

/**
 * @route   DELETE /api/branches/:id
 * @desc    Delete branch
 */
router.delete('/:id', branchesController.deleteBranch);

module.exports = router;
