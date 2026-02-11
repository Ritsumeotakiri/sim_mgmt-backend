const db = require('../db');
const logger = require('../utils/logger');
const { Plan } = require('../models');

/**
 * Get all plans
 */
const getAllPlans = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM plans ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all plans', { error: error.message });
    next(error);
  }
};

/**
 * Get plan by ID
 */
const getPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM plans WHERE plan_id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching plan by ID', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Create new plan
 */
const createPlan = async (req, res, next) => {
  try {
    const plan = new Plan(req.body);
    const validation = plan.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const planData = plan.toDatabase();
    const { rows } = await db.query(
      'INSERT INTO plans (name, price, duration_days) VALUES ($1, $2, $3) RETURNING *',
      [planData.name, planData.price, planData.duration_days]
    );

    logger.info('Plan created', { planId: rows[0].plan_id });
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error creating plan', { error: error.message });
    next(error);
  }
};

/**
 * Update plan
 */
const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = new Plan(req.body);
    const validation = plan.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const planData = plan.toDatabase();
    const { rows } = await db.query(
      'UPDATE plans SET name = $1, price = $2, duration_days = $3 WHERE plan_id = $4 RETURNING *',
      [planData.name, planData.price, planData.duration_days, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    logger.info('Plan updated', { planId: id });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error updating plan', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Delete plan
 */
const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      'DELETE FROM plans WHERE plan_id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    logger.info('Plan deleted', { planId: id });
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    logger.error('Error deleting plan', { id: req.params.id, error: error.message });
    next(error);
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
