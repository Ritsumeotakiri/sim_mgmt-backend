const db = require('../db');
const logger = require('../utils/logger');
const { Transaction, TransactionItem } = require('../models');

/**
 * Get all transactions with details
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT t.*, 
              c.full_name as customer_name,
              u.username as user_name,
              b.name as branch_name,
              COUNT(ti.transaction_item_id) as item_count,
              SUM(ti.amount) as total_amount
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.customer_id
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN branches b ON t.branch_id = b.branch_id
       LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
       GROUP BY t.transaction_id, c.full_name, u.username, b.name
       ORDER BY t.transaction_date DESC`
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all transactions', { error: error.message });
    next(error);
  }
};

/**
 * Get transaction by ID with items
 */
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get transaction details
    const { rows: transactionRows } = await db.query(
      `SELECT t.*, 
              c.full_name as customer_name,
              u.username as user_name,
              b.name as branch_name
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.customer_id
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN branches b ON t.branch_id = b.branch_id
       WHERE t.transaction_id = $1`,
      [id]
    );

    if (transactionRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Get transaction items
    const { rows: itemRows } = await db.query(
      `SELECT ti.*, s.iccid, s.status as sim_status
       FROM transaction_items ti
       LEFT JOIN sims s ON ti.sim_id = s.sim_id
       WHERE ti.transaction_id = $1`,
      [id]
    );

    const transaction = transactionRows[0];
    transaction.items = itemRows;

    res.json({ success: true, data: transaction });
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
      `SELECT t.*, 
              u.username as user_name,
              b.name as branch_name,
              COUNT(ti.transaction_item_id) as item_count,
              SUM(ti.amount) as total_amount
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN branches b ON t.branch_id = b.branch_id
       LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
       WHERE t.customer_id = $1
       GROUP BY t.transaction_id, u.username, b.name
       ORDER BY t.transaction_date DESC`,
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
      `SELECT t.*, 
              c.full_name as customer_name,
              u.username as user_name,
              COUNT(ti.transaction_item_id) as item_count,
              SUM(ti.amount) as total_amount
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.customer_id
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
       WHERE t.branch_id = $1
       GROUP BY t.transaction_id, c.full_name, u.username
       ORDER BY t.transaction_date DESC`,
      [branchId]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching transactions by branch', { branchId: req.params.branchId, error: error.message });
    next(error);
  }
};

/**
 * Process a new transaction (business logic)
 * This is NOT simple CRUD - it handles the complete transaction flow
 */
const processTransaction = async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    const transaction = new Transaction(req.body);
    const validation = transaction.validate();
    
    if (!validation.isValid) {
      client.release();
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    // Validate transaction items
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      client.release();
      return res.status(400).json({ success: false, errors: ['Transaction must have at least one item'] });
    }

    for (const item of req.body.items) {
      const transactionItem = new TransactionItem(item);
      const itemValidation = transactionItem.validate();
      if (!itemValidation.isValid) {
        client.release();
        return res.status(400).json({ success: false, errors: itemValidation.errors });
      }
    }

    const { transaction_type, customer_id, user_id, branch_id, items } = req.body;

    // Start database transaction
    await client.query('BEGIN');

    // Create transaction record
    const { rows: transactionRows } = await client.query(
      'INSERT INTO transactions (transaction_type, customer_id, user_id, branch_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [transaction_type, customer_id, user_id, branch_id, 'completed']
    );

    const transactionRecord = transactionRows[0];
    const transactionId = transactionRecord.transaction_id;

    // Process each transaction item
    for (const item of items) {
      // Create transaction item
      await client.query(
        'INSERT INTO transaction_items (transaction_id, sim_id, amount) VALUES ($1, $2, $3)',
        [transactionId, item.sim_id, item.amount]
      );

      // Update SIM based on transaction type
      if (transaction_type === 'sale') {
        // Assign SIM to customer
        await client.query(
          'UPDATE sims SET customer_id = $1, branch_id = $2 WHERE sim_id = $3',
          [customer_id, branch_id, item.sim_id]
        );
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    logger.info('Transaction processed', { transactionId, type: transaction_type });
    res.status(201).json({ 
      success: true, 
      message: 'Transaction processed successfully',
      data: transactionRecord 
    });

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    logger.error('Error processing transaction', { error: error.message });
    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  getTransactionsByCustomer,
  getTransactionsByBranch,
  processTransaction,
};
