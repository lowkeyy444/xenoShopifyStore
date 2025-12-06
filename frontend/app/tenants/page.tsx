"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";

// Shopify design tokens
const SHOPIFY_GREEN = "#008060";
const SHOPIFY_GREEN_DARK = "#006E52";
const PAGE_BG = "#F8FAFC";
const TEXT_DARK = "#303030";

export default function TenantsPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mount safely
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch tenants
  useEffect(() => {
    if (!mounted) return;

    if (!auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }

    api
      .get("/api/tenant/all")
      .then((res) => setTenants(res.data.tenants))
      .catch(() => console.error("Failed to load tenants"))
      .finally(() => setLoading(false));

  }, [mounted]);

  const handleSelect = (tenantId: string) => {
    localStorage.setItem("tenantId", tenantId);
    router.push("/dashboard");
  };

  if (!mounted) return null;

  // -----------------------------------------------------
  // LOADING STATE
  // -----------------------------------------------------
  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center text-gray-500 text-lg"
        style={{ backgroundColor: PAGE_BG }}
      >
        <div className="animate-pulse">Loading your stores…</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: PAGE_BG }} className="min-h-screen py-16 px-4">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: TEXT_DARK }}>
              Your Stores
            </h1>
            <p className="text-gray-600">Select a Shopify store to view analytics</p>
          </div>

          <button
            onClick={() => router.push("/add-tenant")}
            className="text-white px-5 py-2.5 rounded-lg font-medium shadow transition"
            style={{ backgroundColor: SHOPIFY_GREEN }}
          >
            + Add Store
          </button>
        </div>

        {/* EMPTY STATE */}
        {tenants.length === 0 && (
          <div className="text-center text-gray-600 mt-24">
            <p className="text-xl mb-4">No stores connected yet.</p>

            <button
              onClick={() => router.push("/add-tenant")}
              className="text-white px-6 py-3 rounded-lg shadow hover:shadow-lg transition"
              style={{ backgroundColor: SHOPIFY_GREEN }}
            >
              Add Your First Store
            </button>
          </div>
        )}

        {/* STORES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="border p-6 rounded-xl bg-white shadow-sm hover:shadow-lg transition"
            >
              <h2
                className="text-xl font-semibold mb-1"
                style={{ color: TEXT_DARK }}
              >
                {tenant.shopName || tenant.shopifyDomain}
              </h2>

              <p className="text-gray-500 text-sm mb-4">{tenant.shopifyDomain}</p>

              <button
                onClick={() => handleSelect(tenant.id)}
                className="text-white w-full py-2.5 rounded-lg font-medium hover:shadow-md transition"
                style={{ backgroundColor: SHOPIFY_GREEN }}
              >
                View Dashboard
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}