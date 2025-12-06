const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");

// Register tenant
router.post("/register", tenantController.registerTenant);

// exact route frontend expects
router.get("/all", tenantController.listTenants);

// fallback route (optional)
router.get("/", tenantController.listTenants);

module.exports = router;