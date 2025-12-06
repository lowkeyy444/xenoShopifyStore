// server/controllers/metricsController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function toJS(value) {
  if (typeof value === "bigint") return value.toString();
  return value;
}

exports.summary = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const totalCustomers = await prisma.customer.count({
      where: { tenantId },
    });

    const ordersAgg = await prisma.order.aggregate({
      where: { tenantId },
      _count: { _all: true },
      _sum: { totalPrice: true },
    });

    return res.json({
      totalCustomers,
      totalOrders: ordersAgg._count._all || 0,
      totalRevenue: Number(ordersAgg._sum.totalPrice || 0),
    });
  } catch (err) {
    console.error("metrics.summary error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.ordersByDate = async (req, res) => {
  const { tenantId } = req.params;
  const { start, end } = req.query;

  try {
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 29 * 24 * 3600 * 1000);

    const startDate = start ? new Date(start) : defaultStart;
    const endDate = end ? new Date(end) : now;

    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT 
        to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS orders_count,
        COALESCE(SUM("totalPrice")::numeric, 0) AS revenue
      FROM "Order"
      WHERE "tenantId" = $1
        AND "createdAt" BETWEEN $2::timestamp AND $3::timestamp
      GROUP BY 1
      ORDER BY 1;
      `,
      tenantId,
      startDate.toISOString(),
      endDate.toISOString()
    );

    const dayMap = {};
    rows.forEach((r) => {
      dayMap[r.day] = {
        date: r.day,
        orders: Number(r.orders_count),
        revenue: Number(r.revenue),
      };
    });

    const result = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      result.push(dayMap[key] || { date: key, orders: 0, revenue: 0 });
    }

    res.json(result);
  } catch (err) {
    console.error("metrics.ordersByDate error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.topCustomers = async (req, res) => {
  const { tenantId } = req.params;
  const limit = parseInt(req.query.limit || "5", 10);

  try {
    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT 
        c.id AS customer_id,
        COALESCE(c."firstName", '') AS first_name,
        COALESCE(c."lastName", '') AS last_name,
        COALESCE(c.email, '') AS email,
        COALESCE(SUM(o."totalPrice"), 0) AS total_spent,
        COUNT(o.id) AS orders_count
      FROM "Customer" c
      LEFT JOIN "Order" o
        ON o."customerId" = c.id 
       AND o."tenantId" = $1
      WHERE c."tenantId" = $1
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT $2;
      `,
      tenantId,
      limit
    );

    const formatted = rows.map((r) => ({
      customerId: toJS(r.customer_id),
      name: `${r.first_name} ${r.last_name}`.trim(),
      email: r.email,
      totalSpent: Number(r.total_spent || 0),
      ordersCount: Number(toJS(r.orders_count) || 0),
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("metrics.topCustomers error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.revenueTrend = async (req, res) => {
  const { tenantId } = req.params;
  const { start, end } = req.query;

  try {
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 29 * 24 * 3600 * 1000);

    const startDate = start ? new Date(start) : defaultStart;
    const endDate = end ? new Date(end) : now;

    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT 
        to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
        COALESCE(SUM("totalPrice")::numeric, 0) AS revenue
      FROM "Order"
      WHERE "tenantId" = $1
        AND "createdAt" BETWEEN $2::timestamp AND $3::timestamp
      GROUP BY 1
      ORDER BY 1;
      `,
      tenantId,
      startDate.toISOString(),
      endDate.toISOString()
    );

    const dayMap = {};
    rows.forEach((r) => {
      dayMap[r.day] = Number(r.revenue || 0);
    });

    const result = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      result.push({
        date: key,
        revenue: dayMap[key] || 0,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("metrics.revenueTrend error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};