const db = require('../db');
const logger = require('../utils/logger');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all queries in parallel for better performance
    const [
      simsStats,
      customersCount,
      branchesCount,
      revenueStats,
      transactionsCount,
      plansCount,
      simUtilization
    ] = await Promise.all([
      // Get SIM statistics
      db.query(`
        SELECT 
          COUNT(*) as total_sims,
          COUNT(*) FILTER (WHERE status = 'active') as active_sims,
          COUNT(*) FILTER (WHERE status = 'inactive') as inactive_sims
        FROM sims
      `),
      
      // Get customers count
      db.query(`
        SELECT COUNT(*) as total_customers
        FROM customers
      `),
      
      // Get active branches count
      db.query(`
        SELECT COUNT(*) as active_branches
        FROM branches
      `),
      
      // Get revenue statistics from transactions
      db.query(`
        SELECT 
          COALESCE(SUM(ti.amount), 0) as total_revenue,
          COUNT(DISTINCT s.sim_id) as revenue_generating_sims
        FROM transaction_items ti
        INNER JOIN transactions t ON ti.transaction_id = t.transaction_id
        LEFT JOIN sims s ON ti.sim_id = s.sim_id
        WHERE t.status = 'completed'
      `),
      
      // Get transactions count
      db.query(`
        SELECT COUNT(*) as total_transactions
        FROM transactions
        WHERE status = 'completed'
      `),
      
      // Get available plans count
      db.query(`
        SELECT COUNT(*) as total_plans
        FROM plans
      `),
      
      // Get SIM utilization (SIMs assigned to customers)
      db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE customer_id IS NOT NULL) as assigned_sims,
          COUNT(*) as total_sims
        FROM sims
      `)
    ]);

    // Extract data from query results
    const simsData = simsStats.rows[0];
    const totalSims = parseInt(simsData.total_sims) || 0;
    const activeSims = parseInt(simsData.active_sims) || 0;
    const inactiveSims = parseInt(simsData.inactive_sims) || 0;
    
    const totalCustomers = parseInt(customersCount.rows[0].total_customers) || 0;
    const activeBranches = parseInt(branchesCount.rows[0].active_branches) || 0;
    
    const revenueData = revenueStats.rows[0];
    const totalRevenue = parseFloat(revenueData.total_revenue) || 0;
    const revenueGeneratingSims = parseInt(revenueData.revenue_generating_sims) || 0;
    
    const totalTransactions = parseInt(transactionsCount.rows[0].total_transactions) || 0;
    const totalPlans = parseInt(plansCount.rows[0].total_plans) || 0;
    
    const utilizationData = simUtilization.rows[0];
    const assignedSims = parseInt(utilizationData.assigned_sims) || 0;
    const utilizationTotalSims = parseInt(utilizationData.total_sims) || 0;

    // Calculate percentages and averages
    const activeSimsPercentage = totalSims > 0 
      ? ((activeSims / totalSims) * 100).toFixed(2) 
      : 0;
    
    const simUtilizationPercentage = utilizationTotalSims > 0 
      ? ((assignedSims / utilizationTotalSims) * 100).toFixed(2) 
      : 0;
    
    const avgRevenuePerSim = revenueGeneratingSims > 0 
      ? (totalRevenue / revenueGeneratingSims).toFixed(2) 
      : 0;

    // Prepare response
    const dashboardData = {
      statistics: {
        totalSims: {
          value: totalSims,
          active: activeSims,
          inactive: inactiveSims,
          label: 'Total SIMs'
        },
        activeSims: {
          value: activeSims,
          percentage: parseFloat(activeSimsPercentage),
          label: 'Active SIMs'
        },
        customers: {
          value: totalCustomers,
          label: 'Customers',
          description: 'Registered users'
        },
        branches: {
          value: activeBranches,
          label: 'Branches',
          description: 'Total locations'
        },
        totalRevenue: {
          value: totalRevenue,
          formatted: `$${totalRevenue.toFixed(2)}`,
          description: `From ${revenueGeneratingSims} SIMs`,
          label: 'Total Revenue'
        },
        transactions: {
          value: totalTransactions,
          label: 'Transactions',
          description: 'Total processed'
        }
      },
      systemOverview: {
        availablePlans: {
          value: totalPlans,
          label: 'Available Plans'
        },
        simUtilization: {
          value: parseFloat(simUtilizationPercentage),
          formatted: `${simUtilizationPercentage}%`,
          assigned: assignedSims,
          total: utilizationTotalSims,
          label: 'SIM Utilization'
        },
        avgRevenuePerSim: {
          value: parseFloat(avgRevenuePerSim),
          formatted: `$${avgRevenuePerSim}`,
          label: 'Avg Revenue/SIM'
        }
      }
    };

    logger.info('Dashboard statistics retrieved successfully');
    res.json({ 
      success: true, 
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching dashboard statistics', { error: error.message });
    next(error);
  }
};

/**
 * Get recent activity for dashboard with pagination
 * @query page - Page number (default: 1)
 * @query pageSize - Number of records per page (default: 10, max: 100)
 * @query limit - Alternative to pageSize for backward compatibility
 */
const getRecentActivity = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize || req.query.limit) || 10;
    const maxPageSize = 100;
    
    // Ensure pageSize doesn't exceed max and page is valid
    const validPageSize = Math.min(pageSize, maxPageSize);
    const validPage = Math.max(page, 1);
    const offset = (validPage - 1) * validPageSize;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE t.status = 'completed'
    `;
    const countResult = await db.query(countQuery);
    const totalRecords = parseInt(countResult.rows[0].total) || 0;
    const totalPages = Math.ceil(totalRecords / validPageSize);

    // Get paginated data
    const dataQuery = `
      SELECT 
        t.transaction_id,
        t.transaction_type,
        t.transaction_date,
        t.status,
        u.username as user_name,
        b.name as branch_name,
        c.full_name as customer_name,
        (SELECT SUM(ti.amount) 
         FROM transaction_items ti 
         WHERE ti.transaction_id = t.transaction_id) as total_amount
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN branches b ON t.branch_id = b.branch_id
      LEFT JOIN customers c ON t.customer_id = c.customer_id
      ORDER BY t.transaction_date DESC
      LIMIT $1 OFFSET $2
    `;

    const { rows } = await db.query(dataQuery, [validPageSize, offset]);

    res.json({ 
      success: true, 
      data: rows,
      pagination: {
        currentPage: validPage,
        pageSize: validPageSize,
        totalRecords: totalRecords,
        totalPages: totalPages,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1
      }
    });

  } catch (error) {
    logger.error('Error fetching recent activity', { error: error.message });
    next(error);
  }
};

/**
 * Get SIM status distribution for charts
 */
const getSimStatusDistribution = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 2) as percentage
      FROM sims
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json({ 
      success: true, 
      data: rows
    });

  } catch (error) {
    logger.error('Error fetching SIM status distribution', { error: error.message });
    next(error);
  }
};

/**
 * Get revenue trends (monthly)
 */
const getRevenueTrends = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;

    const { rows } = await db.query(`
      SELECT 
        DATE_TRUNC('month', t.transaction_date) as month,
        TO_CHAR(DATE_TRUNC('month', t.transaction_date), 'Mon YYYY') as month_label,
        COUNT(DISTINCT t.transaction_id) as transaction_count,
        COALESCE(SUM(ti.amount), 0) as total_revenue
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
      WHERE t.status = 'completed'
        AND t.transaction_date >= NOW() - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', t.transaction_date)
      ORDER BY month DESC
    `);

    res.json({ 
      success: true, 
      data: rows
    });

  } catch (error) {
    logger.error('Error fetching revenue trends', { error: error.message });
    next(error);
  }
};

/**
 * Get top performing branches with pagination
 * @query page - Page number (default: 1)
 * @query pageSize - Number of records per page (default: 10, max: 100)
 * @query limit - Alternative to pageSize for backward compatibility
 */
const getTopBranches = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize || req.query.limit) || 10;
    const maxPageSize = 100;
    
    // Ensure pageSize doesn't exceed max and page is valid
    const validPageSize = Math.min(pageSize, maxPageSize);
    const validPage = Math.max(page, 1);
    const offset = (validPage - 1) * validPageSize;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM branches b
    `;
    const countResult = await db.query(countQuery);
    const totalRecords = parseInt(countResult.rows[0].total) || 0;
    const totalPages = Math.ceil(totalRecords / validPageSize);

    // Get paginated data
    const dataQuery = `
      SELECT 
        b.branch_id,
        b.name as branch_name,
        b.location,
        COUNT(DISTINCT t.transaction_id) as transaction_count,
        COUNT(DISTINCT s.sim_id) as total_sims,
        COALESCE(SUM(ti.amount), 0) as total_revenue
      FROM branches b
      LEFT JOIN transactions t ON b.branch_id = t.branch_id AND t.status = 'completed'
      LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
      LEFT JOIN sims s ON b.branch_id = s.branch_id
      GROUP BY b.branch_id, b.name, b.location
      ORDER BY total_revenue DESC
      LIMIT $1 OFFSET $2
    `;

    const { rows } = await db.query(dataQuery, [validPageSize, offset]);

    res.json({ 
      success: true, 
      data: rows,
      pagination: {
        currentPage: validPage,
        pageSize: validPageSize,
        totalRecords: totalRecords,
        totalPages: totalPages,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1
      }
    });

  } catch (error) {
    logger.error('Error fetching top branches', { error: error.message });
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getSimStatusDistribution,
  getRevenueTrends,
  getTopBranches
};
