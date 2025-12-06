"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Shopify colors
const SHOPIFY_GREEN = "#008060";
const SHOPIFY_GREEN_DARK = "#006E52";
const TEXT_DARK = "#1A1A1A"; // Bold dark header color

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const [summary, setSummary] = useState<any>(null);
  const [ordersByDate, setOrdersByDate] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // Hydration-safe mount
  useEffect(() => {
    setMounted(true);
    setTenantId(localStorage.getItem("tenantId"));
  }, []);

  // Fetch metrics
  useEffect(() => {
    if (!mounted || !tenantId) return;

    async function fetchData() {
      try {
        setLoading(true);

        const s = await axios.get(
          `http://localhost:3000/api/metrics/summary/${tenantId}`
        );

        const o = await axios.get(
          `http://localhost:3000/api/metrics/orders-by-date/${tenantId}?start=${start}&end=${end}`
        );

        const tc = await axios.get(
          `http://localhost:3000/api/metrics/top-customers/${tenantId}`
        );

        setSummary(s.data);
        setOrdersByDate(o.data);
        setTopCustomers(tc.data);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [mounted, tenantId, start, end]);

  // Sync button logic
  const handleSync = async () => {
    if (!tenantId) return alert("No tenant selected");

    try {
      setLoading(true);
      await axios.post(`http://localhost:3000/api/sync/full/${tenantId}`);
      alert("Sync completed!");

      // Re-fetch after sync
      const s = await axios.get(
        `http://localhost:3000/api/metrics/summary/${tenantId}`
      );
      const o = await axios.get(
        `http://localhost:3000/api/metrics/orders-by-date/${tenantId}?start=${start}&end=${end}`
      );
      const tc = await axios.get(
        `http://localhost:3000/api/metrics/top-customers/${tenantId}`
      );

      setSummary(s.data);
      setOrdersByDate(o.data);
      setTopCustomers(tc.data);
    } catch (err) {
      console.error("Sync error:", err);
      alert("Sync failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  // Safe rendering
  if (!mounted) return null;
  if (!tenantId) return <p className="p-10 text-red-500">No tenant selected</p>;
  if (loading) return <p className="p-10">Loading dashboard...</p>;

  return (
    <div className="p-10 space-y-10 bg-gray-50 min-h-screen">

      {/* ------------ HEADER (Bolder, Cleaner, Shopify Style) ------------ */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ color: TEXT_DARK }}
          >
            Store Dashboard
          </h1>

          <p className="text-gray-600 mt-1 text-lg">
            A complete overview of your store’s performance
          </p>
        </div>

        <button
          onClick={handleSync}
          className="px-6 py-3 rounded-lg shadow text-white font-medium transition"
          style={{ backgroundColor: SHOPIFY_GREEN }}
        >
          Sync Now
        </button>
      </div>

      {/* ------------ SUMMARY CARDS ------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Customers" value={summary.totalCustomers} />
        <SummaryCard title="Orders" value={summary.totalOrders} />
        <SummaryCard
          title="Revenue"
          value={`$${summary.totalRevenue}`}
          color="green"
        />
      </div>

      {/* ------------ COMBINED FILTER + CHART CARD ------------ */}
      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        <h2
          className="text-2xl font-semibold"
          style={{ color: TEXT_DARK }}
        >
          Orders by Date
        </h2>

        {/* Filters in a row */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-gray-600 text-sm">Start Date</p>
            <input
              type="date"
              value={start}
              className="p-2 border rounded text-gray-800"
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div>
            <p className="text-gray-600 text-sm">End Date</p>
            <input
              type="date"
              value={end}
              className="p-2 border rounded text-gray-800"
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill={SHOPIFY_GREEN} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ------------ TOP CUSTOMERS ------------ */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: TEXT_DARK }}
        >
          Top Customers
        </h2>

        <table className="min-w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-right font-semibold">Total Spent</th>
              <th className="p-3 text-right font-semibold">Orders</th>
            </tr>
          </thead>

          <tbody>
            {topCustomers.map((c, i) => (
              <tr
                key={i}
                className={`border-t ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="p-3 text-gray-800">{c.name}</td>
                <td className="p-3 text-gray-600">{c.email}</td>
                <td className="p-3 text-right text-gray-900 font-medium">
                  ${c.totalSpent}
                </td>
                <td className="p-3 text-right text-gray-900">{c.ordersCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------ Summary Card ------------ */
function SummaryCard({
  title,
  value,
  color = "blue",
}: {
  title: string;
  value: any;
  color?: "blue" | "green" | "amber";
}) {
  const colors = {
    blue: "text-blue-600",
    green: "text-green-600",
    amber: "text-amber-600",
  };

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      <p className="text-xl font-semibold">{title}</p>
      <p className={`text-4xl font-bold mt-2 ${colors[color]}`}>{value}</p>
    </div>
  );
}