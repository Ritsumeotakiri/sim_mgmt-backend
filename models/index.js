/**
 * Model Index
 * Central export for all models
 */

const Branch = require('./Branch');
const Customer = require('./Customer');
const Plan = require('./Plan');
const NumberPool = require('./NumberPool');
const SIM = require('./SIM');
const User = require('./User');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');
const SimStatusHistory = require('./SimStatusHistory');
const SimOwnerHistory = require('./SimOwnerHistory');
const SimPlanHistory = require('./SimPlanHistory');

module.exports = {
  Branch,
  Customer,
  Plan,
  NumberPool,
  SIM,
  User,
  Transaction,
  TransactionItem,
  SimStatusHistory,
  SimOwnerHistory,
  SimPlanHistory,
};
