require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');

// Import routes
const dashboardRoutes = require('./routes/dashboard');
const branchesRoutes = require('./routes/branches');
const customersRoutes = require('./routes/customers');
const plansRoutes = require('./routes/plans');
const numberPoolRoutes = require('./routes/numberPool');
const simsRoutes = require('./routes/sims');
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const simStatusHistoryRoutes = require('./routes/simStatusHistory');
const simOwnerHistoryRoutes = require('./routes/simOwnerHistory');
const simPlanHistoryRoutes = require('./routes/simPlanHistory');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/number-pool', numberPoolRoutes);
app.use('/api/sims', simsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/sim-status-history', simStatusHistoryRoutes);
app.use('/api/sim-owner-history', simOwnerHistoryRoutes);
app.use('/api/sim-plan-history', simPlanHistoryRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
