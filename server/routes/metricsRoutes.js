// server/routes/metricsRoutes.js
const express = require("express");
const router = express.Router();
const metricsController = require("../controllers/metricsController");

// Summary: totals
router.get("/summary/:tenantId", metricsController.summary);

// Orders by date with optional ?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/orders-by-date/:tenantId", metricsController.ordersByDate);

// Top customers by spend (optional ?limit=5)
router.get("/top-customers/:tenantId", metricsController.topCustomers);

router.get("/revenue-trend/:tenantId", metricsController.revenueTrend);

module.exports = router;