const db = require('../db');
const soapService = require('../services/soapService');
const qrCodeService = require('../services/qrCodeService');
const logger = require('../utils/logger');
const { SIM } = require('../models');

/**
 * Get all SIMs
 */
const getAllSims = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT s.sim_id as id, s.iccid, s.msisdn_id, np.msisdn, s.price, s.status, 
              s.branch_id, s.customer_id, s.plan_id, s.created_at,
              b.name as branch_name, 
              c.full_name as customer_name,
              p.name as plan_name
       FROM sims s
       LEFT JOIN branches b ON s.branch_id = b.branch_id
       LEFT JOIN customers c ON s.customer_id = c.customer_id
       LEFT JOIN plans p ON s.plan_id = p.plan_id
       LEFT JOIN number_pool np ON s.msisdn_id = np.id
       ORDER BY s.created_at DESC`
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching all SIMs', { error: error.message });
    next(error);
  }
};

/**
 * Get SIM by ID
 */
const getSimById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT s.*, 
              b.name as branch_name, 
              c.full_name as customer_name,
              p.name as plan_name,
              np.msisdn
       FROM sims s
       LEFT JOIN branches b ON s.branch_id = b.branch_id
       LEFT JOIN customers c ON s.customer_id = c.customer_id
       LEFT JOIN plans p ON s.plan_id = p.plan_id
       LEFT JOIN number_pool np ON s.msisdn_id = np.id
       WHERE s.sim_id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'SIM not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching SIM by ID', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Get SIMs by branch
 */
const getSimsByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { rows } = await db.query(
      `SELECT s.*, 
              c.full_name as customer_name,
              p.name as plan_name,
              np.msisdn
       FROM sims s
       LEFT JOIN customers c ON s.customer_id = c.customer_id
       LEFT JOIN plans p ON s.plan_id = p.plan_id
       LEFT JOIN number_pool np ON s.msisdn_id = np.id
       WHERE s.branch_id = $1
       ORDER BY s.created_at DESC`,
      [branchId]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching SIMs by branch', { branchId: req.params.branchId, error: error.message });
    next(error);
  }
};

/**
 * Get SIMs by customer
 */
const getSimsByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { rows } = await db.query(
      `SELECT s.*, 
              b.name as branch_name, 
              p.name as plan_name,
              np.msisdn
       FROM sims s
       LEFT JOIN branches b ON s.branch_id = b.branch_id
       LEFT JOIN plans p ON s.plan_id = p.plan_id
       LEFT JOIN number_pool np ON s.msisdn_id = np.id
       WHERE s.customer_id = $1
       ORDER BY s.created_at DESC`,
      [customerId]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    logger.error('Error fetching SIMs by customer', { customerId: req.params.customerId, error: error.message });
    next(error);
  }
};

/**
 * Create new SIM
 */
const createSim = async (req, res, next) => {
  try {
    const sim = new SIM(req.body);
    const validation = sim.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const simData = sim.toDatabase();
    const { rows } = await db.query(
      'INSERT INTO sims (iccid, price, status, branch_id, customer_id, plan_id, msisdn_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [simData.iccid, simData.price, simData.status, simData.branch_id, simData.customer_id, simData.plan_id, simData.msisdn_id]
    );

    logger.info('SIM created', { simId: rows[0].sim_id, iccid: rows[0].iccid });
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      logger.error('Duplicate ICCID', { error: error.message });
      return res.status(409).json({ success: false, message: 'SIM with this ICCID already exists' });
    }
    logger.error('Error creating SIM', { error: error.message });
    next(error);
  }
};

/**
 * Update SIM
 */
const updateSim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sim = new SIM(req.body);
    const validation = sim.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const simData = sim.toDatabase();
    const { rows } = await db.query(
      'UPDATE sims SET iccid = $1, price = $2, status = $3, branch_id = $4, customer_id = $5, plan_id = $6, msisdn_id = $7 WHERE sim_id = $8 RETURNING *',
      [simData.iccid, simData.price, simData.status, simData.branch_id, simData.customer_id, simData.plan_id, simData.msisdn_id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'SIM not found' });
    }

    logger.info('SIM updated', { simId: id });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error updating SIM', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Delete SIM
 */
const deleteSim = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query('DELETE FROM sims WHERE sim_id = $1 RETURNING *', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'SIM not found' });
    }

    logger.info('SIM deleted', { simId: id });
    res.json({ success: true, message: 'SIM deleted successfully' });
  } catch (error) {
    logger.error('Error deleting SIM', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Activate SIM via SOAP
 */
const activateSim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { changed_by } = req.body;

    // Get SIM from database
    const { rows } = await db.query('SELECT * FROM sims WHERE sim_id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'SIM not found' });
    }

    const sim = rows[0];
    const oldStatus = sim.status;

    // Call SOAP service to activate
    const soapResult = await soapService.activateSIM(sim.iccid, {
      msisdn: sim.msisdn_id,
    });

    // Update status in database
    await db.query(
      'UPDATE sims SET status = $1 WHERE sim_id = $2',
      ['active', id]
    );

    // Record status change in history
    await db.query(
      'INSERT INTO sim_status_history (sim_id, old_status, new_status, changed_by, reason) VALUES ($1, $2, $3, $4, $5)',
      [id, oldStatus, 'active', changed_by, 'Activated via SOAP']
    );

    logger.info('SIM activated', { simId: id });
    res.json({ success: true, message: 'SIM activated successfully', soapResult });
  } catch (error) {
    logger.error('Error activating SIM', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Deactivate SIM via SOAP
 */
const deactivateSim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { changed_by } = req.body;

    // Get SIM from database
    const { rows } = await db.query('SELECT * FROM sims WHERE sim_id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'SIM not found' });
    }

    const sim = rows[0];
    const oldStatus = sim.status;

    // Call SOAP service to deactivate
    const soapResult = await soapService.deactivateSIM(sim.iccid);

    // Update status in database
    await db.query(
      'UPDATE sims SET status = $1 WHERE sim_id = $2',
      ['inactive', id]
    );

    // Record status change in history
    await db.query(
      'INSERT INTO sim_status_history (sim_id, old_status, new_status, changed_by, reason) VALUES ($1, $2, $3, $4, $5)',
      [id, oldStatus, 'inactive', changed_by, 'Deactivated via SOAP']
    );

    logger.info('SIM deactivated', { simId: id });
    res.json({ success: true, message: 'SIM deactivated successfully', soapResult });
  } catch (error) {
    logger.error('Error deactivating SIM', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Change SIM owner
 */
const changeOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_customer_id, changed_by, reason } = req.body;

    // Get current SIM
    const { rows: simRows } = await db.query(
      'SELECT * FROM sims WHERE sim_id = $1',
      [id]
    );

    if (simRows.length === 0) {
      return res.status(404).json({ success: false, message: 'SIM not found' });
    }

    const oldCustomerId = simRows[0].customer_id;

    // Update SIM with new owner
    await db.query(
      'UPDATE sims SET customer_id = $1 WHERE sim_id = $2',
      [new_customer_id, id]
    );

    // Record owner change in history
    await db.query(
      'INSERT INTO sim_owner_history (sim_id, old_customer_id, new_customer_id, changed_by, reason) VALUES ($1, $2, $3, $4, $5)',
      [id, oldCustomerId, new_customer_id, changed_by, reason]
    );

    logger.info('SIM owner changed', { simId: id, newCustomerId: new_customer_id });
    res.json({ success: true, message: 'SIM owner changed successfully' });
  } catch (error) {
    logger.error('Error changing SIM owner', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Assign plan to SIM
 */
const assignPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan_id, assigned_by, start_date, end_date } = req.body;

    // Update SIM with new plan
    await db.query(
      'UPDATE sims SET plan_id = $1 WHERE sim_id = $2',
      [plan_id, id]
    );

    // Record plan assignment in history
    await db.query(
      'INSERT INTO sim_plan_history (sim_id, plan_id, start_date, end_date, assigned_by) VALUES ($1, $2, $3, $4, $5)',
      [id, plan_id, start_date || new Date(), end_date, assigned_by]
    );

    logger.info('Plan assigned to SIM', { simId: id, planId: plan_id });
    res.json({ success: true, message: 'Plan assigned successfully' });
  } catch (error) {
    logger.error('Error assigning plan', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Get SIM by ICCID (for scanning)
 * Returns full SIM information for employee quick lookup
 */
const getSimByICCID = async (req, res, next) => {
  try {
    const { iccid } = req.params;
    
    const { rows } = await db.query(
      `SELECT s.*, 
              b.name as branch_name, 
              c.full_name as customer_name,
              c.phone as customer_phone,
              c.email as customer_email,
              p.name as plan_name,
              p.price as plan_price,
              p.data_limit,
              p.validity_days,
              np.msisdn
       FROM sims s
       LEFT JOIN branches b ON s.branch_id = b.branch_id
       LEFT JOIN customers c ON s.customer_id = c.customer_id
       LEFT JOIN plans p ON s.plan_id = p.plan_id
       LEFT JOIN number_pool np ON s.msisdn_id = np.id
       WHERE s.iccid = $1`,
      [iccid]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'SIM not found' });
    }
    
    logger.info('SIM retrieved by ICCID', { iccid });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    logger.error('Error fetching SIM by ICCID', { iccid: req.params.iccid, error: error.message });
    next(error);
  }
};

/**
 * Generate QR code image for a SIM (on-demand using ICCID)
 * Returns base64 image data
 */
const getSimQRImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { rows } = await db.query('SELECT * FROM sims WHERE sim_id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'SIM not found' });
    }
    
    const sim = rows[0];
    
    // Generate QR image on-demand using ICCID (not stored in database)
    const qrImage = await qrCodeService.generateSimQRImage(sim.sim_id, sim.iccid);
    
    logger.info('QR image generated for SIM', { simId: id, iccid: sim.iccid });
    
    res.json({
      success: true,
      data: {
        sim_id: sim.sim_id,
        iccid: sim.iccid,
        qr_image: qrImage // base64 data URL
      }
    });
  } catch (error) {
    logger.error('Error generating QR image', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * Download QR code as PNG file
 */
const downloadSimQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { rows } = await db.query('SELECT * FROM sims WHERE sim_id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'SIM not found' });
    }
    
    const sim = rows[0];
    
    // Generate QR image buffer on-demand using ICCID
    const qrBuffer = await qrCodeService.generateSimQRBuffer(sim.sim_id, sim.iccid);
    
    logger.info('QR code downloaded for SIM', { simId: id, iccid: sim.iccid });
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="SIM-${sim.iccid}.png"`);
    res.send(qrBuffer);
  } catch (error) {
    logger.error('Error downloading QR code', { id: req.params.id, error: error.message });
    next(error);
  }
};

module.exports = {
  getAllSims,
  getSimById,
  getSimsByBranch,
  getSimsByCustomer,
  createSim,
  updateSim,
  deleteSim,
  activateSim,
  deactivateSim,
  changeOwner,
  assignPlan,
  getSimByICCID,
  getSimQRImage,
  downloadSimQRCode,
};
