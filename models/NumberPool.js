/**
 * NumberPool Model
 * Represents a phone number in the available pool
 */
class NumberPool {
  constructor(data = {}) {
    this.id = data.id || null;
    this.msisdn = data.msisdn || '';
    this.status = data.status || 'available'; // available, assigned, reserved
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Validate number pool data
   */
  validate() {
    const errors = [];

    if (!this.msisdn || this.msisdn.trim().length === 0) {
      errors.push('MSISDN is required');
    }

    if (this.msisdn.length > 15) {
      errors.push('MSISDN must not exceed 15 characters');
    }

    if (!['available', 'assigned', 'reserved'].includes(this.status)) {
      errors.push('Status must be available, assigned, or reserved');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if number is available for assignment
   */
  isAvailable() {
    return this.status === 'available';
  }

  /**
   * Mark as assigned
   */
  markAsAssigned() {
    this.status = 'assigned';
    this.updated_at = new Date();
  }

  /**
   * Mark as available
   */
  markAsAvailable() {
    this.status = 'available';
    this.updated_at = new Date();
  }

  /**
   * Convert to database insert format
   */
  toDatabase() {
    return {
      msisdn: this.msisdn,
      status: this.status,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      id: this.id,
      msisdn: this.msisdn,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = NumberPool;
