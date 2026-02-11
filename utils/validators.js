const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Branch validation rules
 */
const validateBranch = [
  body('name')
    .notEmpty()
    .withMessage('Branch name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Branch name must be between 2 and 100 characters'),
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  checkValidation,
];

/**
 * Customer validation rules
 */
const validateCustomer = [
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('id_number')
    .optional()
    .isString()
    .withMessage('ID number must be a string'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),
  checkValidation,
];

/**
 * Plan validation rules
 */
const validatePlan = [
  body('name')
    .notEmpty()
    .withMessage('Plan name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Plan name must be between 2 and 100 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration_days')
    .notEmpty()
    .withMessage('Duration days is required')
    .isInt({ min: 1 })
    .withMessage('Duration days must be at least 1'),
  checkValidation,
];

/**
 * Number Pool validation rules
 */
const validateNumberPool = [
  body('msisdn')
    .notEmpty()
    .withMessage('MSISDN is required')
    .isLength({ max: 15 })
    .withMessage('MSISDN must be at most 15 characters'),
  body('country_code')
    .optional()
    .isLength({ max: 5 })
    .withMessage('Country code must be at most 5 characters'),
  body('number')
    .notEmpty()
    .withMessage('Number is required')
    .isLength({ max: 10 })
    .withMessage('Number must be at most 10 characters'),
  body('status')
    .optional()
    .isIn(['available', 'assigned', 'reserved'])
    .withMessage('Status must be available, assigned, or reserved'),
  checkValidation,
];

/**
 * SIM validation rules
 */
const validateSIM = [
  body('iccid')
    .notEmpty()
    .withMessage('ICCID is required')
    .isString()
    .withMessage('ICCID must be a string'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'blocked'])
    .withMessage('Invalid status'),
  body('branch_id')
    .optional()
    .isInt()
    .withMessage('Branch ID must be an integer'),
  body('customer_id')
    .optional()
    .isInt()
    .withMessage('Customer ID must be an integer'),
  body('plan_id')
    .optional()
    .isInt()
    .withMessage('Plan ID must be an integer'),
  body('msisdn')
    .optional()
    .isString()
    .withMessage('MSISDN must be a string'),
  checkValidation,
];

/**
 * User validation rules
 */
const validateUser = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .if(body('password').exists())
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'sales', 'support'])
    .withMessage('Role must be admin, sales, or support'),
  body('branch_id')
    .optional()
    .isInt()
    .withMessage('Branch ID must be an integer'),
  checkValidation,
];

/**
 * Transaction validation rules
 */
const validateTransaction = [
  body('transaction_type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['sale', 'top_up', 'transfer', 'refund'])
    .withMessage('Transaction type must be sale, top_up, transfer, or refund'),
  body('customer_id')
    .optional()
    .isInt()
    .withMessage('Customer ID must be an integer'),
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt()
    .withMessage('User ID must be an integer'),
  body('branch_id')
    .notEmpty()
    .withMessage('Branch ID is required')
    .isInt()
    .withMessage('Branch ID must be an integer'),
  body('items')
    .notEmpty()
    .withMessage('Transaction items are required')
    .isArray({ min: 1 })
    .withMessage('At least one transaction item is required'),
  body('items.*.sim_id')
    .notEmpty()
    .withMessage('SIM ID is required for each item')
    .isInt()
    .withMessage('SIM ID must be an integer'),
  body('items.*.amount')
    .notEmpty()
    .withMessage('Amount is required for each item')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  checkValidation,
];

module.exports = {
  validateBranch,
  validateCustomer,
  validatePlan,
  validateNumberPool,
  validateSIM,
  validateUser,
  validateTransaction,
};
