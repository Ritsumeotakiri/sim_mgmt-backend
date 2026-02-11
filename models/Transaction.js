/**
 * Transaction Model
 * Represents a business transaction
 */
class Transaction {
  constructor(data = {}) {
    this.transaction_id = data.transaction_id || null;
    this.transaction_type = data.transaction_type || 'sale'; // sale, top_up, transfer, refund
    this.customer_id = data.customer_id || null;
    this.user_id = data.user_id || null;
    this.branch_id = data.branch_id || null;
    this.transaction_date = data.transaction_date || new Date();
    this.status = data.status || 'completed'; // completed, pending, failed, cancelled
    this.items = data.items || [];
  }

  /**
   * Validate transaction data
   */
  validate() {
    const errors = [];

    if (!['sale', 'top_up', 'transfer', 'refund'].includes(this.transaction_type)) {
      errors.push('Invalid transaction type. Must be sale, top_up, transfer, or refund');
    }

    if (!this.user_id) {
      errors.push('User ID is required');
    }

    if (!this.branch_id) {
      errors.push('Branch ID is required');
    }

    if (!['completed', 'pending', 'failed', 'cancelled'].includes(this.status)) {
      errors.push('Invalid status. Must be completed, pending, failed, or cancelled');
    }

    if (!Array.isArray(this.items) || this.items.length === 0) {
      errors.push('At least one transaction item is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate total amount from items
   */
  getTotalAmount() {
    return this.items.reduce((total, item) => total + parseFloat(item.amount || 0), 0);
  }

  /**
   * Check if transaction is completed
   */
  isCompleted() {
    return this.status === 'completed';
  }

  /**
   * Check if transaction is pending
   */
  isPending() {
    return this.status === 'pending';
  }

  /**
   * Add item to transaction
   */
  addItem(item) {
    this.items.push(item);
  }

  /**
   * Convert to database insert format
   */
  toDatabase() {
    return {
      transaction_type: this.transaction_type,
      customer_id: this.customer_id,
      user_id: this.user_id,
      branch_id: this.branch_id,
      status: this.status,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      transaction_id: this.transaction_id,
      transaction_type: this.transaction_type,
      customer_id: this.customer_id,
      user_id: this.user_id,
      branch_id: this.branch_id,
      transaction_date: this.transaction_date,
      status: this.status,
      items: this.items,
      total_amount: this.getTotalAmount(),
    };
  }
}

module.exports = Transaction;
