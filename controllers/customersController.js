const db = require('../db');
const logger = require('../utils/logger');
const { Customer } = require('../models');

/**
 * Get all customers
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT customer_id as id, full_name, id_number, phone, created_at FROM customers ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all customers', { error: error.message });
    next(error);
  }
};

/**
 * Get customer by ID
 */
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM customers WHERE customer_id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching customer by ID', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Create new customer
 */
const createCustomer = async (req, res, next) => {
  try {
    const customer = new Customer(req.body);
    const validation = customer.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const customerData = customer.toDatabase();
    const { rows } = await db.query(
      'INSERT INTO customers (full_name, id_number, phone) VALUES ($1, $2, $3) RETURNING *',
      [customerData.full_name, customerData.id_number, customerData.phone]
    );

    logger.info('Customer created', { customerId: rows[0].customer_id });
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error creating customer', { error: error.message });
    next(error);
  }
};

/**
 * Update customer
 */
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = new Customer(req.body);
    const validation = customer.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const customerData = customer.toDatabase();
    const { rows } = await db.query(
      'UPDATE customers SET full_name = $1, id_number = $2, phone = $3 WHERE customer_id = $4 RETURNING *',
      [customerData.full_name, customerData.id_number, customerData.phone, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    logger.info('Customer updated', { customerId: id });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error updating customer', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Delete customer
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      'DELETE FROM customers WHERE customer_id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    logger.info('Customer deleted', { customerId: id });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    logger.error('Error deleting customer', { id: req.params.id, error: error.message });
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
