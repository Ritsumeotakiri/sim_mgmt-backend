# Dashboard API - Quick Start Guide

## ✅ What's Been Implemented

### Backend API Endpoints

1. **Dashboard Statistics** - `GET /api/dashboard/stats`
   - Total SIMs (with active/inactive breakdown)
   - Active SIMs percentage
   - Total Customers
   - Total Branches
   - Total Revenue from transactions
   - Total Transactions
   - Available Plans
   - SIM Utilization percentage
   - Average Revenue per SIM

2. **Recent Activity** - `GET /api/dashboard/recent-activity`
   - Recent transactions with customer, branch, and user details
   - Transaction amounts and types
   - Returns ALL transactions by default (optional limit parameter)

3. **SIM Status Distribution** - `GET /api/dashboard/sim-status-distribution`
   - Breakdown of SIMs by status (active, inactive, suspended, blocked)
   - Includes counts and percentages
   - Perfect for pie/donut charts

4. **Revenue Trends** - `GET /api/dashboard/revenue-trends?months=6`
   - Monthly revenue aggregation
   - Transaction counts per month
   - Ideal for line/bar charts

5. **Top Branches** - `GET /api/dashboard/top-branches`
   - Branch performance metrics
   - Revenue, transaction count, and SIM count per branch
   - Returns ALL branches sorted by revenue (optional limit parameter)

### Frontend Integration

The dashboard has been updated to consume the new optimized API:
- Real-time statistics display
- Formatted currency values
- Percentage calculations
- Error handling with retry functionality
- Loading states

## 🚀 How to Use

### 1. Start the Backend Server

```bash
node server.js
```

The server will run on `http://localhost:3000`

### 2. Start the Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:5173
```

The dashboard will automatically load and display:
- 6 statistics cards (Total SIMs, Active SIMs, Customers, Branches, Revenue, Transactions)
- System overview box (Plans, Utilization, Avg Revenue)
- Quick action buttons
- Welcome information

## 📊 API Response Example

When you visit `http://localhost:3000/api/dashboard/stats`, you'll get:

```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalSims": {
        "value": 3,
        "active": 1,
        "inactive": 1,
        "label": "Total SIMs"
      },
      "activeSims": {
        "value": 1,
        "percentage": 33.33,
        "label": "Active SIMs"
      },
      "customers": {
        "value": 3,
        "label": "Customers",
        "description": "Registered users"
      },
      "branches": {
        "value": 5,
        "label": "Branches",
        "description": "Total locations"
      },
      "totalRevenue": {
        "value": 10,
        "formatted": "$10.00",
        "description": "From 2 SIMs",
        "label": "Total Revenue"
      },
      "transactions": {
        "value": 3,
        "label": "Transactions",
        "description": "Total processed"
      }
    },
    "systemOverview": {
      "availablePlans": {
        "value": 3,
        "label": "Available Plans"
      },
      "simUtilization": {
        "value": 100,
        "formatted": "100.00%",
        "assigned": 3,
        "total": 3,
        "label": "SIM Utilization"
      },
      "avgRevenuePerSim": {
        "value": 5,
        "formatted": "$5.00",
        "label": "Avg Revenue/SIM"
      }
    }
  },
  "timestamp": "2026-02-13T03:50:13.038Z"
}
```

## 🔧 Testing the API

### Using PowerShell

```powershell
# Test main dashboard stats
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/stats" -Method GET

# Test recent activity (all records)
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/recent-activity" -Method GET

# Test recent activity (limited to 5)
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/recent-activity?limit=5" -Method GET

# Test SIM status distribution
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/sim-status-distribution" -Method GET

# Test revenue trends
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/revenue-trends?months=12" -Method GET

# Test all branches
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/top-branches" -Method GET

# Test top 3 branches only
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/top-branches?limit=3" -Method GET
```

### Using cURL

```bash
# Test main dashboard stats
curl http://localhost:3000/api/dashboard/stats

# Test recent activity
curl http://localhost:3000/api/dashboard/recent-activity?limit=5

# Test SIM status distribution
curl http://localhost:3000/api/dashboard/sim-status-distribution
```

## 📁 Files Created/Modified

### New Files
- `controllers/dashboardController.js` - Dashboard API logic
- `routes/dashboard.js` - Dashboard route definitions
- `DASHBOARD_API.md` - Comprehensive API documentation
- `QUICKSTART_DASHBOARD.md` - This file

### Modified Files
- `server.js` - Added dashboard routes
- `frontend/src/services/api.js` - Added dashboardAPI methods
- `frontend/src/pages/Dashboard.jsx` - Updated to use new API

## 🎯 Key Features

### Performance Optimizations
- **Parallel Queries**: All statistics are fetched in parallel for maximum speed
- **Database Aggregation**: Calculations done at database level, not in application
- **Optimized Joins**: Efficient JOINs to minimize query overhead

### Data Accuracy
- **Real-time Data**: All statistics are calculated from actual database data
- **Transaction-based Revenue**: Revenue is calculated from completed transactions only
- **SIM Utilization**: Based on actual SIM assignments to customers

### User Experience
- **Formatted Values**: Currency values pre-formatted (e.g., "$10.00")
- **Percentages**: Pre-calculated percentages for display
- **Labels & Descriptions**: User-friendly labels for all metrics
- **Error Handling**: Graceful error handling with retry options

## 🔄 Next Steps

To further enhance the dashboard:

1. **Add Charts**: Integrate Recharts for visual data representation
   ```bash
   cd frontend
   npm install recharts
   ```

2. **Real-time Updates**: Implement polling or WebSocket for live updates

3. **Date Range Filters**: Allow users to filter data by custom date ranges

4. **Export Functionality**: Add CSV/PDF export for reports

5. **Additional Metrics**: 
   - Customer acquisition trends
   - SIM activation rates
   - Branch comparison charts
   - Revenue forecasting

## 📚 Additional Documentation

For detailed API documentation, see: [DASHBOARD_API.md](./DASHBOARD_API.md)

For general API examples, see: [API_EXAMPLES.md](./API_EXAMPLES.md)

## 🐛 Troubleshooting

### Issue: API returns 404
**Solution**: Ensure the backend server is running on port 3000

### Issue: Dashboard shows "No data available"
**Solution**: Check that the database is properly connected and has data

### Issue: Frontend can't connect to backend
**Solution**: Verify CORS is enabled and check the `VITE_API_URL` environment variable

### Issue: Database query errors
**Solution**: Verify all tables exist and have the correct schema

## ✨ Summary

You now have a fully functional dashboard API that:
- ✅ Aggregates data from multiple sources efficiently
- ✅ Provides comprehensive statistics for the dashboard
- ✅ Includes additional endpoints for charts and analytics
- ✅ Integrates seamlessly with the React frontend
- ✅ Follows best practices for performance and maintainability

**Current Status**: ✅ All systems operational
- Backend: Running on http://localhost:3000
- Frontend: Running on http://localhost:5173
- All 5 dashboard endpoints tested and working
