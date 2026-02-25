const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Public (add authentication middleware as needed)
 */
router.get('/stats', dashboardController.getDashboardStats);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get recent activity/transactions with pagination
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   pageSize - Records per page (default: 10, max: 100)
 * @query   limit - Alternative to pageSize (for backward compatibility)
 */
router.get('/recent-activity', dashboardController.getRecentActivity);

/**
 * @route   GET /api/dashboard/sim-status-distribution
 * @desc    Get SIM status distribution for charts
 * @access  Public
 */
router.get('/sim-status-distribution', dashboardController.getSimStatusDistribution);

/**
 * @route   GET /api/dashboard/revenue-trends
 * @desc    Get revenue trends over time
 * @access  Public
 * @query   months - Number of months to retrieve (default: 6)
 */
router.get('/revenue-trends', dashboardController.getRevenueTrends);

/**
 * @route   GET /api/dashboard/top-branches
 * @desc    Get top performing branches with pagination
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   pageSize - Records per page (default: 10, max: 100)
 * @query   limit - Alternative to pageSize (for backward compatibility)
 */
router.get('/top-branches', dashboardController.getTopBranches);

module.exports = router;
