// server/controllers/tenantController.js
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyShopifyToken(shopDomain, token) {
  const apiVersion = "2024-07";
  const url = `https://${shopDomain}/admin/api/${apiVersion}/shop.json`;

  const res = await axios.get(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Accept": "application/json"
    },
    timeout: 8000
  });

  return res.data.shop;
}

exports.registerTenant = async (req, res) => {
  try {
    const { shopifyDomain, accessToken } = req.body;

    if (!shopifyDomain || !accessToken) {
      return res.status(400).json({ error: "shopifyDomain and accessToken required" });
    }

    if (!shopifyDomain.endsWith(".myshopify.com")) {
      return res.status(400).json({ error: "shopifyDomain must be a myshopify.com domain" });
    }

    let shopInfo;
    try {
      shopInfo = await verifyShopifyToken(shopifyDomain, accessToken);
    } catch (err) {
      console.error("Shopify verification failed:", err?.response?.data || err.message);
      return res.status(400).json({ error: "Failed to verify Shopify credentials. Check domain/token." });
    }

    const tenant = await prisma.tenant.upsert({
      where: { shopifyDomain },
      update: {
        accessToken,
      },
      create: {
        shopifyDomain,
        accessToken
      }
    });

    return res.status(201).json({
      message: "Tenant registered successfully",
      tenantId: tenant.id,
      shop: {
        name: shopInfo.name,
        domain: shopInfo.domain,
        email: shopInfo.email
      }
    });
  } catch (err) {
    console.error("registerTenant error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.listTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      select: { id: true, shopifyDomain: true, createdAt: true }
    });
    return res.json({ tenants });
  } catch (err) {
    console.error("listTenants error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};