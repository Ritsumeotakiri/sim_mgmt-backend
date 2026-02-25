const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const { validateTransaction } = require('../utils/validators');

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions (read-only for viewing)
 */
router.get('/', transactionsController.getAllTransactions);

/**
 * @route   GET /api/transactions/statistics
 * @desc    Get transaction statistics
 */
router.get('/statistics', transactionsController.getTransactionStatistics);

/**
 * @route   GET /api/transactions/reports/daily
 * @desc    Get daily transaction report
 */
router.get('/reports/daily', transactionsController.getDailyReport);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID with items
 */
router.get('/:id', transactionsController.getTransactionById);

/**
 * @route   GET /api/transactions/customer/:customerId
 * @desc    Get transactions by customer ID
 */
router.get('/customer/:customerId', transactionsController.getTransactionsByCustomer);

/**
 * @route   GET /api/transactions/branch/:branchId
 * @desc    Get transactions by branch ID
 */
router.get('/branch/:branchId', transactionsController.getTransactionsByBranch);

/**
 * @route   POST /api/transactions/process
 * @desc    Process a new transaction (business logic, not simple CRUD)
 */
router.post('/process', validateTransaction, transactionsController.processTransaction);

/**
 * @route   POST /api/transactions/:id/cancel
 * @desc    Cancel a pending transaction
 */
router.post('/:id/cancel', transactionsController.cancelTransaction);

module.exports = router;
