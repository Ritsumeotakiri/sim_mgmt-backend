/**
 * Plan Model
 * Represents a SIM card plan
 */
class Plan {
  constructor(data = {}) {
    this.plan_id = data.plan_id || null;
    this.name = data.name || '';
    this.price = data.price || 0;
    this.duration_days = data.duration_days || 30;
    this.created_at = data.created_at || new Date();
  }

  /**
   * Validate plan data
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Plan name is required');
    }

    if (this.name.length > 100) {
      errors.push('Plan name must not exceed 100 characters');
    }

    if (this.price < 0) {
      errors.push('Price must be a positive number');
    }

    if (this.duration_days < 1) {
      errors.push('Duration must be at least 1 day');
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
      name: this.name,
      price: this.price,
      duration_days: this.duration_days,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      plan_id: this.plan_id,
      name: this.name,
      price: parseFloat(this.price),
      duration_days: this.duration_days,
      created_at: this.created_at,
    };
  }
}

module.exports = Plan;
