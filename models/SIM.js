/**
 * SIM Model
 * Represents a SIM card in the system
 */
class SIM {
  constructor(data = {}) {
    this.sim_id = data.sim_id || null;
    this.iccid = data.iccid || '';
    this.price = data.price || 0;
    this.status = data.status || 'inactive'; // active, inactive, suspended, blocked
    this.branch_id = data.branch_id || null;
    this.customer_id = data.customer_id || null;
    this.plan_id = data.plan_id || null;
    this.msisdn = data.msisdn || null;
    this.created_at = data.created_at || new Date();
  }

  /**
   * Validate SIM data
   */
  validate() {
    const errors = [];

    if (!this.iccid || this.iccid.trim().length === 0) {
      errors.push('ICCID is required');
    }

    if (this.iccid.length < 18 || this.iccid.length > 22) {
      errors.push('ICCID must be between 18 and 22 characters');
    }

    if (this.price < 0) {
      errors.push('Price must be a positive number');
    }

    if (!['active', 'inactive', 'suspended', 'blocked'].includes(this.status)) {
      errors.push('Invalid status. Must be active, inactive, suspended, or blocked');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if SIM is active
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Check if SIM is assigned to a customer
   */
  isAssigned() {
    return this.customer_id !== null;
  }

  /**
   * Check if SIM has a plan
   */
  hasPlan() {
    return this.plan_id !== null;
  }

  /**
   * Activate SIM
   */
  activate() {
    this.status = 'active';
  }

  /**
   * Deactivate SIM
   */
  deactivate() {
    this.status = 'inactive';
  }

  /**
   * Suspend SIM
   */
  suspend() {
    this.status = 'suspended';
  }

  /**
   * Block SIM
   */
  block() {
    this.status = 'blocked';
  }

  /**
   * Convert to database insert format
   */
  toDatabase() {
    return {
      iccid: this.iccid,
      price: this.price,
      status: this.status,
      branch_id: this.branch_id,
      customer_id: this.customer_id,
      plan_id: this.plan_id,
      msisdn: this.msisdn,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      sim_id: this.sim_id,
      iccid: this.iccid,
      price: parseFloat(this.price),
      status: this.status,
      branch_id: this.branch_id,
      customer_id: this.customer_id,
      plan_id: this.plan_id,
      msisdn: this.msisdn,
      created_at: this.created_at,
    };
  }
}

module.exports = SIM;
