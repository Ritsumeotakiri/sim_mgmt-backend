const db = require('../db');
const logger = require('../utils/logger');
const { SimStatusHistory } = require('../models');

/**
 * Get all SIM status history
 */
const getAllHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT ssh.*, s.iccid, u.username as changed_by_username 
       FROM sim_status_history ssh
       LEFT JOIN sims s ON ssh.sim_id = s.sim_id
       LEFT JOIN users u ON ssh.changed_by = u.user_id
       ORDER BY ssh.changed_at DESC`
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all SIM status history', { error: error.message });
    next(error);
  }
};

/**
 * Get SIM status history by ID
 */
const getHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT ssh.*, s.iccid, u.username as changed_by_username 
       FROM sim_status_history ssh
       LEFT JOIN sims s ON ssh.sim_id = s.sim_id
       LEFT JOIN users u ON ssh.changed_by = u.user_id
       WHERE ssh.history_id = $1`,
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
 * Get SIM status history by SIM ID
 */
const getHistoryBySimId = async (req, res, next) => {
  try {
    const { simId } = req.params;
    const { rows } = await db.query(
      `SELECT ssh.*, u.username as changed_by_username 
       FROM sim_status_history ssh
       LEFT JOIN users u ON ssh.changed_by = u.user_id
       WHERE ssh.sim_id = $1
       ORDER BY ssh.changed_at DESC`,
      [simId]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching history by SIM ID', { simId: req.params.simId, error: error.message });
    next(error);
  }
};

/**
 * Create new SIM status history entry
 */
const createHistory = async (req, res, next) => {
  try {
    const history = new SimStatusHistory(req.body);
    const validation = history.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const historyData = history.toDatabase();
    const { rows } = await db.query(
      'INSERT INTO sim_status_history (sim_id, old_status, new_status, changed_by, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [historyData.sim_id, historyData.old_status, historyData.new_status, historyData.changed_by, historyData.reason]
    );

    logger.info('SIM status history created', { historyId: rows[0].history_id });
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error creating SIM status history', { error: error.message });
    next(error);
  }
};

/**
 * Delete SIM status history entry
 */
const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      'DELETE FROM sim_status_history WHERE history_id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'History record not found' });
    }

    logger.info('SIM status history deleted', { historyId: id });
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
