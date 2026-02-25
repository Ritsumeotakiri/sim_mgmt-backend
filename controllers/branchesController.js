const db = require('../db');
const logger = require('../utils/logger');
const { Branch } = require('../models');

/**
 * Get all branches
 */
const getAllBranches = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT branch_id as id, name, location, created_at FROM branches ORDER BY branch_id ASC'
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all branches', { error: error.message });
    next(error);
  }
};

/**
 * Get branch by ID
 */
const getBranchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM branches WHERE branch_id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching branch by ID', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Create new branch
 */
const createBranch = async (req, res, next) => {
  try {
    const branch = new Branch(req.body);
    const validation = branch.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const branchData = branch.toDatabase();
    const { rows } = await db.query(
      'INSERT INTO branches (name, location) VALUES ($1, $2) RETURNING *',
      [branchData.name, branchData.location]
    );

    logger.info('Branch created', { branchId: rows[0].branch_id });
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      logger.error('Duplicate branch name', { error: error.message });
      return res.status(409).json({ success: false, message: 'Branch with this name already exists' });
    }
    logger.error('Error creating branch', { error: error.message });
    next(error);
  }
};

/**
 * Update branch
 */
const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const branch = new Branch(req.body);
    const validation = branch.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const branchData = branch.toDatabase();
    const { rows } = await db.query(
      'UPDATE branches SET name = $1, location = $2 WHERE branch_id = $3 RETURNING *',
      [branchData.name, branchData.location, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    logger.info('Branch updated', { branchId: id });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error updating branch', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Delete branch
 */
const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      'DELETE FROM branches WHERE branch_id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    logger.info('Branch deleted', { branchId: id });
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    logger.error('Error deleting branch', { id: req.params.id, error: error.message });
    next(error);
  }
};

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};
