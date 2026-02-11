/**
 * SimPlanHistory Model
 * Tracks SIM plan assignments
 */
class SimPlanHistory {
  constructor(data = {}) {
    this.plan_history_id = data.plan_history_id || null;
    this.sim_id = data.sim_id || null;
    this.plan_id = data.plan_id || null;
    this.start_date = data.start_date || new Date();
    this.end_date = data.end_date || null;
    this.assigned_by = data.assigned_by || null;
  }

  /**
   * Validate history data
   */
  validate() {
    const errors = [];

    if (!this.sim_id) {
      errors.push('SIM ID is required');
    }

    if (!this.plan_id) {
      errors.push('Plan ID is required');
    }

    if (!this.start_date) {
      errors.push('Start date is required');
    }

    if (this.end_date && new Date(this.end_date) < new Date(this.start_date)) {
      errors.push('End date must be after start date');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if plan is currently active
   */
  isActive() {
    const now = new Date();
    const start = new Date(this.start_date);
    const end = this.end_date ? new Date(this.end_date) : null;

    return now >= start && (!end || now <= end);
  }

  /**
   * Check if plan has expired
   */
  isExpired() {
    if (!this.end_date) return false;
    return new Date() > new Date(this.end_date);
  }

  /**
   * Convert to database insert format
   */
  toDatabase() {
    return {
      sim_id: this.sim_id,
      plan_id: this.plan_id,
      start_date: this.start_date,
      end_date: this.end_date,
      assigned_by: this.assigned_by,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      plan_history_id: this.plan_history_id,
      sim_id: this.sim_id,
      plan_id: this.plan_id,
      start_date: this.start_date,
      end_date: this.end_date,
      assigned_by: this.assigned_by,
      is_active: this.isActive(),
      is_expired: this.isExpired(),
    };
  }
}

module.exports = SimPlanHistory;
