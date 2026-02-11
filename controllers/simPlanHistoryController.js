const db = require('../db');
const logger = require('../utils/logger');
const { SimPlanHistory } = require('../models');

/**
 * Get all SIM plan history
 */
const getAllHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT sph.*, 
              s.iccid,
              p.name as plan_name,
              u.username as assigned_by_username 
       FROM sim_plan_history sph
       LEFT JOIN sims s ON sph.sim_id = s.sim_id
       LEFT JOIN plans p ON sph.plan_id = p.plan_id
       LEFT JOIN users u ON sph.assigned_by = u.user_id
       ORDER BY sph.start_date DESC`
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all SIM plan history', { error: error.message });
    next(error);
  }
};

/**
 * Get SIM plan history by ID
 */
const getHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT sph.*, 
              s.iccid,
              p.name as plan_name,
              u.username as assigned_by_username 
       FROM sim_plan_history sph
       LEFT JOIN sims s ON sph.sim_id = s.sim_id
       LEFT JOIN plans p ON sph.plan_id = p.plan_id
       LEFT JOIN users u ON sph.assigned_by = u.user_id
       WHERE sph.plan_history_id = $1`,
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
 * Get SIM plan history by SIM ID
 */
const getHistoryBySimId = async (req, res, next) => {
  try {
    const { simId } = req.params;
    const { rows } = await db.query(
      `SELECT sph.*,
              p.name as plan_name,
              u.username as assigned_by_username 
       FROM sim_plan_history sph
       LEFT JOIN plans p ON sph.plan_id = p.plan_id
       LEFT JOIN users u ON sph.assigned_by = u.user_id
       WHERE sph.sim_id = $1
       ORDER BY sph.start_date DESC`,
      [simId]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching history by SIM ID', { simId: req.params.simId, error: error.message });
    next(error);
  }
};

/**
 * Create new SIM plan history entry
 */
const createHistory = async (req, res, next) => {
  try {
    const history = new SimPlanHistory(req.body);
    const validation = history.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const historyData = history.toDatabase();
    const { rows } = await db.query(
      'INSERT INTO sim_plan_history (sim_id, plan_id, start_date, end_date, assigned_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [historyData.sim_id, historyData.plan_id, historyData.start_date, historyData.end_date, historyData.assigned_by]
    );

    logger.info('SIM plan history created', { planHistoryId: rows[0].plan_history_id });
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error creating SIM plan history', { error: error.message });
    next(error);
  }
};

/**
 * Update SIM plan history entry (mainly for end_date)
 */
const updateHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { end_date } = req.body;

    const { rows } = await db.query(
      'UPDATE sim_plan_history SET end_date = $1 WHERE plan_history_id = $2 RETURNING *',
      [end_date, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'History record not found' });
    }

    logger.info('SIM plan history updated', { planHistoryId: id });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error updating history', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Delete SIM plan history entry
 */
const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      'DELETE FROM sim_plan_history WHERE plan_history_id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'History record not found' });
    }

    logger.info('SIM plan history deleted', { planHistoryId: id });
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
  updateHistory,
  deleteHistory,
};
