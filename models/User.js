/**
 * User Model
 * Represents a system user
 */
class User {
  constructor(data = {}) {
    this.user_id = data.user_id || null;
    this.username = data.username || '';
    this.password = data.password || '';
    this.role = data.role || 'sales'; // admin, sales, support
    this.branch_id = data.branch_id || null;
    this.created_at = data.created_at || new Date();
  }

  /**
   * Validate user data
   */
  validate() {
    const errors = [];

    if (!this.username || this.username.trim().length === 0) {
      errors.push('Username is required');
    }

    if (this.username.length < 3 || this.username.length > 50) {
      errors.push('Username must be between 3 and 50 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    if (!this.password || this.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (!['admin', 'sales', 'support'].includes(this.role)) {
      errors.push('Role must be admin, sales, or support');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Check if user is sales
   */
  isSales() {
    return this.role === 'sales';
  }

  /**
   * Check if user is support
   */
  isSupport() {
    return this.role === 'support';
  }

  /**
   * Convert to database insert format (without sensitive data)
   */
  toDatabase() {
    return {
      username: this.username,
      password: this.password, // Should be hashed before storing
      role: this.role,
      branch_id: this.branch_id,
    };
  }

  /**
   * Convert to API response format (without password)
   */
  toJSON() {
    return {
      user_id: this.user_id,
      username: this.username,
      role: this.role,
      branch_id: this.branch_id,
      created_at: this.created_at,
    };
  }
}

module.exports = User;
