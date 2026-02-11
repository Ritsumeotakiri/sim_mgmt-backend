const db = require('../db');
const logger = require('../utils/logger');
const { SimOwnerHistory } = require('../models');

/**
 * Get all SIM owner history
 */
const getAllHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT soh.*, 
              s.iccid,
              oc.full_name as old_customer_name,
              nc.full_name as new_customer_name,
              u.username as changed_by_username 
       FROM sim_owner_history soh
       LEFT JOIN sims s ON soh.sim_id = s.sim_id
       LEFT JOIN customers oc ON soh.old_customer_id = oc.customer_id
       LEFT JOIN customers nc ON soh.new_customer_id = nc.customer_id
       LEFT JOIN users u ON soh.changed_by = u.user_id
       ORDER BY soh.changed_at DESC`
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all SIM owner history', { error: error.message });
    next(error);
  }
};

/**
 * Get SIM owner history by ID
 */
const getHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT soh.*, 
              s.iccid,
              oc.full_name as old_customer_name,
              nc.full_name as new_customer_name,
              u.username as changed_by_username 
       FROM sim_owner_history soh
       LEFT JOIN sims s ON soh.sim_id = s.sim_id
       LEFT JOIN customers oc ON soh.old_customer_id = oc.customer_id
       LEFT JOIN customers nc ON soh.new_customer_id = nc.customer_id
       LEFT JOIN users u ON soh.changed_by = u.user_id
       WHERE soh.owner_history_id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'History record not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching history by ID', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Get SIM owner history by SIM ID
 */
const getHistoryBySimId = async (req, res, next) => {
  try {
    const { simId } = req.params;
    const { rows } = await db.query(
      `SELECT soh.*,
              oc.full_name as old_customer_name,
              nc.full_name as new_customer_name,
              u.username as changed_by_username 
       FROM sim_owner_history soh
       LEFT JOIN customers oc ON soh.old_customer_id = oc.customer_id
       LEFT JOIN customers nc ON soh.new_customer_id = nc.customer_id
       LEFT JOIN users u ON soh.changed_by = u.user_id
       WHERE soh.sim_id = $1
       ORDER BY soh.changed_at DESC`,
      [simId]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching history by SIM ID', { simId: req.params.simId, error: error.message });
    next(error);
  }
};

/**
 * Create new SIM owner history entry
 */
const createHistory = async (req, res, next) => {
  try {
    const history = new SimOwnerHistory(req.body);
    const validation = history.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const historyData = history.toDatabase();
    const { rows } = await db.query(
      'INSERT INTO sim_owner_history (sim_id, old_customer_id, new_customer_id, changed_by, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [historyData.sim_id, historyData.old_customer_id, historyData.new_customer_id, historyData.changed_by, historyData.reason]
    );

    logger.info('SIM owner history created', { ownerHistoryId: rows[0].owner_history_id });
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error creating SIM owner history', { error: error.message });
    next(error);
  }
};

/**
 * Delete SIM owner history entry
 */
const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      'DELETE FROM sim_owner_history WHERE owner_history_id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'History record not found' });
    }

    logger.info('SIM owner history deleted', { ownerHistoryId: id });
    res.json({ success: true, message: 'History record deleted successfully' });
  } catch (error) {
    logger.error('Error deleting history', { id: req.params.id, error: error.message });
    next(error);
  }
};

module.exports = {
  getAllHistory,
  getHistoryById,
  getHistoryBySimId,
  createHistory,
  deleteHistory,
};
