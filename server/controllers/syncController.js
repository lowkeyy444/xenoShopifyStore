// server/controllers/syncController.js

const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper: call Shopify API
async function shopifyGet(shopDomain, accessToken, endpoint) {
  const apiVersion = "2024-07";
  const url = `https://${shopDomain}/admin/api/${apiVersion}/${endpoint}`;

  const response = await axios.get(url, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      Accept: "application/json",
    },
  });

  return response.data;
}

exports.fullSync = async (req, res) => {
  const { tenantId } = req.params;

  try {
    // 1) Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const { shopifyDomain, accessToken } = tenant;

    // --------------------------
    // 2) Sync CUSTOMERS
    // --------------------------
    const customersData = await shopifyGet(
      shopifyDomain,
      accessToken,
      "customers.json"
    );

    let customersCount = 0;

    for (const c of customersData.customers || []) {
      await prisma.customer.upsert({
        where: { id: c.id },
        update: {
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          totalSpent: c.total_spent,
          updatedAt: new Date(c.updated_at),
        },
        create: {
          id: c.id,
          tenantId,
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          totalSpent: c.total_spent,
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at),
        },
      });
      customersCount++;
    }

    // --------------------------
    // 3) Sync PRODUCTS
    // --------------------------
    const productsData = await shopifyGet(
      shopifyDomain,
      accessToken,
      "products.json"
    );

    let productsCount = 0;

    for (const p of productsData.products || []) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          title: p.title,
          updatedAt: new Date(p.updated_at),
        },
        create: {
          id: p.id,
          tenantId,
          title: p.title,
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at),
        },
      });
      productsCount++;
    }

    // --------------------------
    // 4) Sync ORDERS
    // --------------------------
    const ordersData = await shopifyGet(
      shopifyDomain,
      accessToken,
      "orders.json?status=any"
    );

    let ordersCount = 0;

    for (const o of ordersData.orders || []) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {
          totalPrice: o.total_price,
          currency: o.currency,
          customerId: o.customer?.id || null,
          updatedAt: new Date(o.updated_at),
        },
        create: {
          id: o.id,
          tenantId,
          totalPrice: o.total_price,
          currency: o.currency,
          customerId: o.customer?.id || null,
          createdAt: new Date(o.created_at),
          updatedAt: new Date(o.updated_at),
        },
      });
      ordersCount++;
    }

    // --------------------------
    // 5) Return the result
    // --------------------------
    res.json({
      message: "Full sync completed",
      tenantId,
      counts: {
        customers: customersCount,
        products: productsCount,
        orders: ordersCount,
      },
    });
  } catch (err) {
    console.error("Full sync error:", err.response?.data || err.message);
    res.status(500).json({ error: "Full sync failed", details: err.message });
  }
};