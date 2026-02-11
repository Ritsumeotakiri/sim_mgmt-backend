/**
 * SimStatusHistory Model
 * Tracks SIM status changes
 */
class SimStatusHistory {
  constructor(data = {}) {
    this.history_id = data.history_id || null;
    this.sim_id = data.sim_id || null;
    this.old_status = data.old_status || '';
    this.new_status = data.new_status || '';
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

    if (!this.old_status || this.old_status.trim().length === 0) {
      errors.push('Old status is required');
    }

    if (!this.new_status || this.new_status.trim().length === 0) {
      errors.push('New status is required');
    }

    const validStatuses = ['active', 'inactive', 'suspended', 'blocked'];
    if (!validStatuses.includes(this.old_status)) {
      errors.push('Invalid old status');
    }

    if (!validStatuses.includes(this.new_status)) {
      errors.push('Invalid new status');
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
      old_status: this.old_status,
      new_status: this.new_status,
      changed_by: this.changed_by,
      reason: this.reason,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      history_id: this.history_id,
      sim_id: this.sim_id,
      old_status: this.old_status,
      new_status: this.new_status,
      changed_by: this.changed_by,
      changed_at: this.changed_at,
      reason: this.reason,
    };
  }
}

module.exports = SimStatusHistory;
