const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');
const { validateCustomer } = require('../utils/validators');

/**
 * @route   GET /api/customers
 * @desc    Get all customers
 */
router.get('/', customersController.getAllCustomers);

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 */
router.get('/:id', customersController.getCustomerById);

/**
 * @route   POST /api/customers
 * @desc    Create new customer
 */
router.post('/', validateCustomer, customersController.createCustomer);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update customer
 */
router.put('/:id', validateCustomer, customersController.updateCustomer);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete customer
 */
router.delete('/:id', customersController.deleteCustomer);

module.exports = router;
