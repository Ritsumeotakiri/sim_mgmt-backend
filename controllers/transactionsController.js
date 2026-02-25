const db = require('../db');
const logger = require('../utils/logger');

/**
 * Get all transactions
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT t.transaction_id as id, t.transaction_type, t.customer_id, 
              t.user_id, t.branch_id, t.transaction_date, 
              t.status, t.created_at,
              c.full_name as customer_name,
              u.username as user_name,
              b.name as branch_name
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.customer_id
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN branches b ON t.branch_id = b.branch_id
       ORDER BY t.created_at DESC`
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all transactions', { error: error.message });
    next(error);
  }
};

/**
 * Get transaction by ID
 */
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT t.*, c.full_name as customer_name, u.username as user_name, b.name as branch_name
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.customer_id
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN branches b ON t.branch_id = b.branch_id
       WHERE t.transaction_id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching transaction by ID', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Get transactions by customer
 */
const getTransactionsByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { rows } = await db.query(
      `SELECT t.transaction_id as id, t.transaction_type, 
              t.status, t.created_at,
              COALESCE(SUM(ti.amount), 0) as total_amount,
              u.username as user_name, b.name as branch_name
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN branches b ON t.branch_id = b.branch_id
       LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
       WHERE t.customer_id = $1
       GROUP BY t.transaction_id, t.transaction_type, t.status, t.created_at, u.username, b.name
       ORDER BY t.created_at DESC`,
      [customerId]
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching transactions by customer', { customerId: req.params.customerId, error: error.message });
    next(error);
  }
};

/**
 * Get transactions by branch
 */
const getTransactionsByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { rows } = await db.query(
      `SELECT t.transaction_id as id, t.transaction_type, t.customer_id,
              t.status, t.created_at,
              COALESCE(SUM(ti.amount), 0) as total_amount,
              c.full_name as customer_name, u.username as user_name
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.customer_id
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
       WHERE t.branch_id = $1
       GROUP BY t.transaction_id, t.transaction_type, t.customer_id, t.status, t.created_at, c.full_name, u.username
       ORDER BY t.created_at DESC`,
      [branchId]
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching transactions by branch', { branchId: req.params.branchId, error: error.message });
    next(error);
  }
};

/**
 * Get transaction statistics
 */
const getTransactionStatistics = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT 
        COUNT(DISTINCT t.transaction_id) as total_transactions,
        COALESCE(SUM(ti.amount), 0) as total_revenue,
        COALESCE(AVG(ti.amount), 0) as average_transaction,
        COUNT(DISTINCT t.customer_id) as unique_customers
       FROM transactions t
       LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id`
    );
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching transaction statistics', { error: error.message });
    next(error);
  }
};

/**
 * Get daily transaction report
 */
const getDailyReport = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT 
        DATE(t.created_at) as date,
        COUNT(DISTINCT t.transaction_id) as transaction_count,
        COALESCE(SUM(ti.amount), 0) as daily_revenue
       FROM transactions t
       LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
       WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(t.created_at)
       ORDER BY date DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    logger.error('Error fetching daily report', { error: error.message });
    next(error);
  }
};

/**
 * Process a new transaction
 */
const processTransaction = async (req, res, next) => {
  try {
    const { customer_id, user_id, branch_id, transaction_type, items } = req.body;
    
    // Insert transaction
    const { rows } = await db.query(
      `INSERT INTO transactions (customer_id, user_id, branch_id, transaction_type, status)
       VALUES ($1, $2, $3, $4, 'completed')
       RETURNING *`,
      [customer_id, user_id, branch_id, transaction_type]
    );

    const transaction = rows[0];

    // Insert transaction items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await db.query(
          `INSERT INTO transaction_items (transaction_id, sim_id, amount)
           VALUES ($1, $2, $3)`,
          [transaction.transaction_id, item.sim_id, item.amount]
        );
      }
    }

    logger.info('Transaction processed', { transactionId: transaction.transaction_id });
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    logger.error('Error processing transaction', { error: error.message });
    next(error);
  }
};

/**
 * Cancel transaction
 */
const cancelTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { rows } = await db.query(
      `UPDATE transactions 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE transaction_id = $1
       RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    logger.info('Transaction cancelled', { transactionId: id });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error cancelling transaction', { id: req.params.id, error: error.message });
    next(error);
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  getTransactionsByCustomer,
  getTransactionsByBranch,
  getTransactionStatistics,
  getDailyReport,
  processTransaction,
  cancelTransaction
};
