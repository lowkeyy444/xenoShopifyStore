// server/routes/tenantRoutes.js
const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");

// register a new tenant (onboard)
router.post("/register", tenantController.registerTenant);

// list tenants (for testing)
router.get("/", tenantController.listTenants);

module.exports = router;