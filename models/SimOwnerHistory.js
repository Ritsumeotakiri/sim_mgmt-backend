/**
 * SimOwnerHistory Model
 * Tracks SIM ownership changes
 */
class SimOwnerHistory {
  constructor(data = {}) {
    this.owner_history_id = data.owner_history_id || null;
    this.sim_id = data.sim_id || null;
    this.old_customer_id = data.old_customer_id || null;
    this.new_customer_id = data.new_customer_id || null;
    this.changed_by = data.changed_by || null;
    this.changed_at = data.changed_at || new Date();
    this.reason = data.reason || '';
  }

  /**
   * Validate history data
   */
  validate() {
    const errors = [];

    if (!this.sim_id) {
      errors.push('SIM ID is required');
    }

    if (!this.new_customer_id) {
      errors.push('New customer ID is required');
    }

    if (this.old_customer_id === this.new_customer_id) {
      errors.push('Old and new customer IDs cannot be the same');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to database insert format
   */
  toDatabase() {
    return {
      sim_id: this.sim_id,
      old_customer_id: this.old_customer_id,
      new_customer_id: this.new_customer_id,
      changed_by: this.changed_by,
      reason: this.reason,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      owner_history_id: this.owner_history_id,
      sim_id: this.sim_id,
      old_customer_id: this.old_customer_id,
      new_customer_id: this.new_customer_id,
      changed_by: this.changed_by,
      changed_at: this.changed_at,
      reason: this.reason,
    };
  }
}

module.exports = SimOwnerHistory;
