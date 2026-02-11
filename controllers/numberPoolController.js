const db = require('../db');
const logger = require('../utils/logger');
const { NumberPool } = require('../models');

/**
 * Get all numbers in pool
 */
const getAllNumbers = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM number_pool ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all numbers', { error: error.message });
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
      'INSERT INTO number_pool (msisdn, country_code, number, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [numberData.msisdn, numberData.country_code, numberData.number, numberData.status]
    );

    logger.info('Number created in pool', { msisdn: rows[0].msisdn });
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
    const { msisdn } = req.params;
    const numberPool = new NumberPool({ ...req.body, msisdn });
    const validation = numberPool.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const numberData = numberPool.toDatabase();
    const { rows } = await db.query(
      'UPDATE number_pool SET country_code = $1, number = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE msisdn = $4 RETURNING *',
      [numberData.country_code, numberData.number, numberData.status, msisdn]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Number not found' });
    }

    logger.info('Number updated', { msisdn });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error updating number', { msisdn: req.params.msisdn, error: error.message });
    next(error);
  }
};

/**
 * Delete number from pool
 */
const deleteNumber = async (req, res, next) => {
  try {
    const { msisdn } = req.params;

    const { rows } = await db.query(
      'DELETE FROM number_pool WHERE msisdn = $1 RETURNING *',
      [msisdn]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Number not found' });
    }

    logger.info('Number deleted', { msisdn });
    res.json({ success: true, message: 'Number deleted successfully' });
  } catch (error) {
    logger.error('Error deleting number', { msisdn: req.params.msisdn, error: error.message });
    next(error);
  }
};

module.exports = {
  getAllNumbers,
  getNumberByMsisdn,
  getNumbersByStatus,
  createNumber,
  updateNumber,
  deleteNumber,
};
