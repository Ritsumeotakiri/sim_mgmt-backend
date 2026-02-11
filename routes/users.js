const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { validateUser } = require('../utils/validators');

/**
 * @route   GET /api/users
 * @desc    Get all users
 */
router.get('/', usersController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 */
router.get('/:id', usersController.getUserById);

/**
 * @route   GET /api/users/branch/:branchId
 * @desc    Get users by branch ID
 */
router.get('/branch/:branchId', usersController.getUsersByBranch);

/**
 * @route   GET /api/users/role/:role
 * @desc    Get users by role
 */
router.get('/role/:role', usersController.getUsersByRole);

/**
 * @route   POST /api/users
 * @desc    Create new user
 */
router.post('/', validateUser, usersController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 */
router.put('/:id', validateUser, usersController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 */
router.delete('/:id', usersController.deleteUser);

module.exports = router;
