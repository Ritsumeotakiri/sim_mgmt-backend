const db = require('../db');
const logger = require('../utils/logger');
const { NumberPool } = require('../models');

/**
 * Get all numbers in pool
 */
const getAllNumbers = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, msisdn, status, created_at, updated_at FROM number_pool ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all numbers', { error: error.message });
    next(error);
  }
};

/**
 * Get number by ID
 */
const getNumberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM number_pool WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Number not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching number by ID', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Get number by MSISDN
 */
const getNumberByMsisdn = async (req, res, next) => {
  try {
    const { msisdn } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM number_pool WHERE msisdn = $1',
      [msisdn]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Number not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching number by MSISDN', { msisdn: req.params.msisdn, error: error.message });
    next(error);
  }
};

/**
 * Get numbers by status
 */
const getNumbersByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM number_pool WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching numbers by status', { status: req.params.status, error: error.message });
    next(error);
  }
};

/**
 * Create new number in pool
 */
const createNumber = async (req, res, next) => {
  try {
    const numberPool = new NumberPool(req.body);
    const validation = numberPool.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const numberData = numberPool.toDatabase();
    const { rows } = await db.query(
      'INSERT INTO number_pool (msisdn, status) VALUES ($1, $2) RETURNING *',
      [numberData.msisdn, numberData.status]
    );

    logger.info('Number created in pool', { id: rows[0].id, msisdn: rows[0].msisdn });
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error creating number', { error: error.message });
    next(error);
  }
};

/**
 * Update number in pool
 */
const updateNumber = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numberPool = new NumberPool({ ...req.body, id });
    const validation = numberPool.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const numberData = numberPool.toDatabase();
    const { rows } = await db.query(
      'UPDATE number_pool SET msisdn = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [numberData.msisdn, numberData.status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Number not found' });
    }

    logger.info('Number updated', { id });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error updating number', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Delete number from pool
 */
const deleteNumber = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      'DELETE FROM number_pool WHERE id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Number not found' });
    }

    logger.info('Number deleted', { id });
    res.json({ success: true, message: 'Number deleted successfully' });
  } catch (error) {
    logger.error('Error deleting number', { id: req.params.id, error: error.message });
    next(error);
  }
};

module.exports = {
  getAllNumbers,
  getNumberById,
  getNumberByMsisdn,
  getNumbersByStatus,
  createNumber,
  updateNumber,
  deleteNumber,
};
