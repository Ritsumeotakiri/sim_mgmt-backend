/**
 * Customer Model
 * Represents a customer in the system
 */
class Customer {
  constructor(data = {}) {
    this.customer_id = data.customer_id || null;
    this.full_name = data.full_name || '';
    this.id_number = data.id_number || null;
    this.phone = data.phone || null;
    this.created_at = data.created_at || new Date();
  }

  /**
   * Validate customer data
   */
  validate() {
    const errors = [];

    if (!this.full_name || this.full_name.trim().length === 0) {
      errors.push('Full name is required');
    }

    if (this.full_name.length > 100) {
      errors.push('Full name must not exceed 100 characters');
    }

    if (this.phone && !/^[0-9+\-\s()]+$/.test(this.phone)) {
      errors.push('Invalid phone number format');
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
      full_name: this.full_name,
      id_number: this.id_number,
      phone: this.phone,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      customer_id: this.customer_id,
      full_name: this.full_name,
      id_number: this.id_number,
      phone: this.phone,
      created_at: this.created_at,
    };
  }
}

module.exports = Customer;
