const db = require('../db');
const logger = require('../utils/logger');
const { User } = require('../models');

/**
 * Get all users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT u.user_id, u.username, u.role, u.branch_id, u.created_at,
              b.name as branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.branch_id
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all users', { error: error.message });
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT u.user_id, u.username, u.role, u.branch_id, u.created_at,
              b.name as branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.branch_id
       WHERE u.user_id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching user by ID', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Get users by branch
 */
const getUsersByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { rows } = await db.query(
      `SELECT user_id, username, role, branch_id, created_at
       FROM users
       WHERE branch_id = $1
       ORDER BY created_at DESC`,
      [branchId]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching users by branch', { branchId: req.params.branchId, error: error.message });
    next(error);
  }
};

/**
 * Get users by role
 */
const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { rows } = await db.query(
      `SELECT u.user_id, u.username, u.role, u.branch_id, u.created_at,
              b.name as branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.branch_id
       WHERE u.role = $1
       ORDER BY u.created_at DESC`,
      [role]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching users by role', { role: req.params.role, error: error.message });
    next(error);
  }
};

/**
 * Create new user
 */
const createUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const validation = user.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    // TODO: Hash password before storing
    const userData = user.toDatabase();
    const { rows } = await db.query(
      'INSERT INTO users (username, password, role, branch_id) VALUES ($1, $2, $3, $4) RETURNING user_id, username, role, branch_id, created_at',
      [userData.username, userData.password, userData.role, userData.branch_id]
    );

    const createdUser = new User(rows[0]);
    logger.info('User created', { userId: rows[0].user_id });
    res.status(201).json({ success: true, data: createdUser.toJSON() });
  } catch (error) {
    logger.error('Error creating user', { error: error.message });
    next(error);
  }
};

/**
 * Update user
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = new User(req.body);
    const validation = user.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const userData = user.toDatabase();
    const { rows } = await db.query(
      'UPDATE users SET username = $1, role = $2, branch_id = $3 WHERE user_id = $4 RETURNING user_id, username, role, branch_id, created_at',
      [userData.username, userData.role, userData.branch_id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = new User(rows[0]);
    logger.info('User updated', { userId: id });
    res.json({ success: true, data: updatedUser.toJSON() });
  } catch (error) {
    logger.error('Error updating user', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info('User deleted', { userId: id });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user', { id: req.params.id, error: error.message });
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUsersByBranch,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
};
