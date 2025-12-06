const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const tenantRoutes = require("./routes/tenantRoutes");
app.use("/api/tenant", tenantRoutes);

const syncRoutes = require("./routes/syncRoutes");
app.use("/api/sync", syncRoutes);

const metricsRoutes = require("./routes/metricsRoutes");
app.use("/api/metrics", metricsRoutes);

app.get("/", (req, res) => {
  res.send("Xeno Shopify Ingestion Service is running ");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));