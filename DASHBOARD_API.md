# Dashboard API Documentation

## Overview
The Dashboard API provides aggregated statistics and analytics for the SIM Management System. All endpoints return data optimized for dashboard visualization.

## Base URL
```
http://localhost:3000/api/dashboard
```

---

## Endpoints

### 1. Get Dashboard Statistics
Returns comprehensive statistics for the main dashboard view.

**Endpoint:** `GET /api/dashboard/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalSims": {
        "value": 150,
        "active": 120,
        "inactive": 30,
        "label": "Total SIMs"
      },
      "activeSims": {
        "value": 120,
        "percentage": 80.00,
        "label": "Active SIMs"
      },
      "customers": {
        "value": 85,
        "label": "Customers",
        "description": "Registered users"
      },
      "branches": {
        "value": 5,
        "label": "Branches",
        "description": "Active locations"
      },
      "totalRevenue": {
        "value": 15000.50,
        "formatted": "$15000.50",
        "description": "From 120 SIMs",
        "label": "Total Revenue"
      },
      "transactions": {
        "value": 245,
        "label": "Transactions",
        "description": "Total processed"
      }
    },
    "systemOverview": {
      "availablePlans": {
        "value": 8,
        "label": "Available Plans"
      },
      "simUtilization": {
        "value": 80.00,
        "formatted": "80.00%",
        "assigned": 120,
        "total": 150,
        "label": "SIM Utilization"
      },
      "avgRevenuePerSim": {
        "value": 125.00,
        "formatted": "$125.00",
        "label": "Avg Revenue/SIM"
      }
    }
  },
  "timestamp": "2026-02-13T10:30:00.000Z"
}
```

**Statistics Explained:**
- **Total SIMs**: Total count of all SIMs in the system with breakdown by status
- **Active SIMs**: Number and percentage of active SIMs
- **Customers**: Total registered customers
- **Branches**: Number of active branch locations
- **Total Revenue**: Sum of all completed transaction amounts
- **Transactions**: Count of completed transactions
- **Available Plans**: Count of available subscription plans
- **SIM Utilization**: Percentage of SIMs assigned to customers
- **Avg Revenue/SIM**: Average revenue per SIM that has generated revenue

---

### 2. Get Recent Activity
Returns recent transactions and activities.

**Endpoint:** `GET /api/dashboard/recent-activity`

**Query Parameters:**
- `limit` (optional): Number of records to return. If not specified, returns ALL records.

**Examples:**
```
GET /api/dashboard/recent-activity          # Returns all records
GET /api/dashboard/recent-activity?limit=5  # Returns only 5 records
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "transaction_id": 123,
      "transaction_type": "sale",
      "transaction_date": "2026-02-13T09:15:00.000Z",
      "status": "completed",
      "user_name": "john_doe",
      "branch_name": "Main Branch",
      "customer_name": "Jane Smith",
      "total_amount": 150.00
    }
  ],
  "count": 5
}
```

---

### 3. Get SIM Status Distribution
Returns distribution of SIMs by status for charts/visualization.

**Endpoint:** `GET /api/dashboard/sim-status-distribution`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "status": "active",
      "count": 120,
      "percentage": 80.00
    },
    {
      "status": "inactive",
      "count": 25,
      "percentage": 16.67
    },
    {
      "status": "suspended",
      "count": 3,
      "percentage": 2.00
    },
    {
      "status": "blocked",
      "count": 2,
      "percentage": 1.33
    }
  ]
}
```

**Use Case:** Perfect for pie charts or donut charts showing SIM status distribution.

---

### 4. Get Revenue Trends
Returns monthly revenue trends over a specified period.

**Endpoint:** `GET /api/dashboard/revenue-trends`

**Query Parameters:**
- `months` (optional): Number of months to retrieve (default: 6)

**Example:**
```
GET /api/dashboard/revenue-trends?months=12
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "month": "2026-02-01T00:00:00.000Z",
      "month_label": "Feb 2026",
      "transaction_count": 45,
      "total_revenue": 5500.00
    },
    {
      "month": "2026-01-01T00:00:00.000Z",
      "month_label": "Jan 2026",
      "transaction_count": 38,
      "total_revenue": 4750.00
    }
  ]
}
```

**Use Case:** Ideal for line charts or bar charts showing revenue trends over time.

---

### 5. Get Top Performing Branches
Returns branches sorted by performance (revenue).

**Endpoint:** `GET /api/dashboard/top-branches`

**Query Parameters:**
- `limit` (optional): Number of branches to return. If not specified, returns ALL branches.

**Examples:**
```
GET /api/dashboard/top-branches          # Returns all branches
GET /api/dashboard/top-branches?limit=3  # Returns only top 3 branches
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "branch_id": 1,
      "branch_name": "Main Branch",
      "location": "Downtown",
      "transaction_count": 150,
      "total_sims": 80,
      "total_revenue": 12500.50
    },
    {
      "branch_id": 2,
      "branch_name": "North Branch",
      "location": "North District",
      "transaction_count": 95,
      "total_sims": 45,
      "total_revenue": 8750.00
    }
  ]
}
```

**Use Case:** Perfect for ranking tables or bar charts showing branch performance.

---

## Frontend Integration

### Using the Dashboard API in React

```javascript
import { dashboardAPI } from '../services/api';

// Get dashboard statistics
const response = await dashboardAPI.getStats();
const { statistics, systemOverview } = response.data.data;
all recent activity (no limit)
const allActivity = await dashboardAPI.getRecentActivity();

// Get limited recent activity (e.g., last 10)
const recentActivity = await dashboardAPI.getRecentActivity(10);

// Get SIM distribution (for charts)
const distribution = await dashboardAPI.getSimStatusDistribution();

// Get revenue trends (for graphs)
const trends = await dashboardAPI.getRevenueTrends(12);

// Get all branches
const allBranches = await dashboardAPI.getTopBranches();

// Get top 5 branches only
// Get top branches
const topBranches = await dashboardAPI.getTopBranches(5);
```

---

## Performance Notes

1. **Parallel Queries**: The main stats endpoint runs 7 database queries in parallel for optimal performance
2. **Caching**: Consider implementing frontend caching for dashboard stats (5-10 minute intervals)
3. **Real-time Updates**: For live dashboards, implement polling or WebSocket connections
4. **Data Volume**: All queries are optimized with aggregations at the database level

---

## Error Handling

All endpoints follow the standard error response format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `500`: Internal Server Error

---

## Best Practices

1. **Refresh Interval**: Don't poll too frequently; 30-60 seconds is recommended for dashboard stats
2. **Loading States**: Always show loading indicators while fetching data
3. **Error Recovery**: Implement retry logic with exponential backoff
4. **Data Visualization**: Use the provided formatted values for consistent display
5. **Responsive Design**: Stats grid should adapt to different screen sizes

---

## Future Enhancements

Potential additions to the dashboard API:
- Real-time metrics via WebSocket
- Custom date range filters
- Export functionality (CSV, PDF)
- Comparison with previous periods
- Alerts and notifications
- Predictive analytics
