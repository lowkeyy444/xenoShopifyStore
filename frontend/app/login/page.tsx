"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

const PRIMARY_GREEN = "#008060";
const PRIMARY_GREEN_HOVER = "#006E52";
const BG_LIGHT = "#F6F6F7";
const BORDER_GRAY = "#D2D5D8";
const TEXT_DARK = "#202223";
const TEXT_MUTED = "#6D7175";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.isLoggedIn()) router.push("/tenants");
  }, []);

  const handleLogin = () => {
    if (!email.trim()) return setError("Please enter your email.");
    if (!email.includes("@")) return setError("Enter a valid email address.");

    auth.login(email);
    router.push("/tenants");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: BG_LIGHT }}
    >
      <div className="w-full max-w-sm bg-white border rounded-xl p-8 shadow-sm"
           style={{ borderColor: BORDER_GRAY }}>

        <h1
          className="text-3xl font-semibold text-center mb-2"
          style={{ color: TEXT_DARK }}
        >
          Xeno Insights
        </h1>

        <p className="text-center mb-8 text-sm" style={{ color: TEXT_MUTED }}>
          Sign in to access your store analytics
        </p>

        <label className="block text-sm mb-2" style={{ color: TEXT_DARK }}>
          Work Email
        </label>

        <input
          type="email"
          className="border rounded-lg p-3 w-full mb-3 text-gray-800 placeholder-gray-400 outline-none transition"
          style={{ borderColor: BORDER_GRAY }}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          className="text-white w-full py-3 rounded-lg font-medium transition active:scale-[0.98]"
          style={{ backgroundColor: PRIMARY_GREEN }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = PRIMARY_GREEN_HOVER)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = PRIMARY_GREEN)
          }
          onClick={handleLogin}
        >
          Sign In
        </button>

        <p className="text-center text-xs mt-6" style={{ color: TEXT_MUTED }}>
          Only authorized users can access this dashboard.
        </p>
      </div>
    </div>
  );
}