// server/routes/syncRoutes.js
const express = require("express");
const router = express.Router();
const syncController = require("../controllers/syncController");

// FIXED: Should be POST, not GET
router.post("/full/:tenantId", syncController.fullSync);

module.exports = router;