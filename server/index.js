const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const tenantRoutes = require("./routes/tenantRoutes");
app.use("/api/tenants", tenantRoutes);

app.get("/", (req, res) => {
  res.send("Xeno Shopify Ingestion Service is running ");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));