"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

const SHOPIFY_GREEN = "#008060";
const TEXT_DARK = "#2C2C2C";
const PAGE_BG = "#F8FAFC";

export default function AddTenantPage() {
  const router = useRouter();

  const [shopName, setShopName] = useState("");
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.isLoggedIn()) router.replace("/login");
  }, []);

  const handleAddTenant = async () => {
    if (!shopName.trim() || !domain.trim() || !token.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/tenant/register", {
        shopName,
        shopifyDomain: domain,
        accessToken: token,
      });

      router.push("/tenants");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to register store. Check your details."
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-10">
        <h1
          className="text-3xl font-bold text-center mb-2"
          style={{ color: TEXT_DARK }}
        >
          Add New Store
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Connect a Shopify store to start syncing analytics
        </p>

        <label className="block text-sm font-medium mb-1" style={{ color: TEXT_DARK }}>
          Store Name
        </label>
        <input
          className="border rounded-lg p-3 w-full text-gray-800 outline-none
                     focus:ring-2 focus:ring-[#008060] transition mb-5"
          placeholder="eg. Xeno Demo Store"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1" style={{ color: TEXT_DARK }}>
          Shopify Store Domain
        </label>
        <input
          className="border rounded-lg p-3 w-full text-gray-800 outline-none
                     focus:ring-2 focus:ring-[#008060] transition mb-5"
          placeholder="your-store.myshopify.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1" style={{ color: TEXT_DARK }}>
          Admin API Access Token
        </label>
        <input
          type="password"
          className="border rounded-lg p-3 w-full text-gray-800 outline-none
                     focus:ring-2 focus:ring-[#008060] transition mb-5"
          placeholder="shpat_..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          onClick={handleAddTenant}
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold transition disabled:opacity-50"
          style={{ backgroundColor: SHOPIFY_GREEN }}
        >
          {loading ? "Adding Store…" : "Add Store"}
        </button>

        <p
          onClick={() => router.push("/tenants")}
          className="text-center text-gray-600 text-sm mt-6 cursor-pointer hover:underline"
        >
          ← Back to Stores
        </p>
      </div>
    </div>
  );
}