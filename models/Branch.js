/**
 * Branch Model
 * Represents a business branch location
 */
class Branch {
  constructor(data = {}) {
    this.branch_id = data.branch_id || null;
    this.name = data.name || '';
    this.location = data.location || '';
    this.created_at = data.created_at || new Date();
  }

  /**
   * Validate branch data
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Branch name is required');
    }

    if (this.name.length > 100) {
      errors.push('Branch name must not exceed 100 characters');
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
      location: this.location,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      branch_id: this.branch_id,
      name: this.name,
      location: this.location,
      created_at: this.created_at,
    };
  }
}

module.exports = Branch;
