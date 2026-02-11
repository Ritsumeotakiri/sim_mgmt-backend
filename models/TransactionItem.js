/**
 * TransactionItem Model
 * Represents an item within a transaction
 */
class TransactionItem {
  constructor(data = {}) {
    this.transaction_item_id = data.transaction_item_id || null;
    this.transaction_id = data.transaction_id || null;
    this.sim_id = data.sim_id || null;
    this.amount = data.amount || 0;
  }

  /**
   * Validate transaction item data
   */
  validate() {
    const errors = [];

    if (!this.transaction_id) {
      errors.push('Transaction ID is required');
    }

    if (!this.sim_id) {
      errors.push('SIM ID is required');
    }

    if (this.amount < 0) {
      errors.push('Amount must be a positive number');
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
      transaction_id: this.transaction_id,
      sim_id: this.sim_id,
      amount: this.amount,
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      transaction_item_id: this.transaction_item_id,
      transaction_id: this.transaction_id,
      sim_id: this.sim_id,
      amount: parseFloat(this.amount),
    };
  }
}

module.exports = TransactionItem;
