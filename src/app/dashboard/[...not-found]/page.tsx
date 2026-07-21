'use client';

import Link from 'next/link';
import { FileQuestion, ArrowLeft, LayoutDashboard, RefreshCcw } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div 
      style={{ 
        minHeight: "50vh", 
        background: "#f1f5f9", 
        fontFamily: "var(--font-sans)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem"
      }}
    >
      <div 
        style={{ 
          maxWidth: "480px", 
          width: "100%", 
          textAlign: "center", 
          backgroundColor: "white", 
          border: "1px solid #e2e8f0", 
          borderRadius: "12px", 
          padding: "2.5rem 2rem", 
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
        }}
      >
        {/* Visual Icon Badge */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div 
            style={{ 
              width: "64px", 
              height: "64px", 
              borderRadius: "12px", 
              backgroundColor: "rgba(245, 158, 11, 0.1)", 
              border: "1px solid rgba(245, 158, 11, 0.2)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            <FileQuestion style={{ width: "32px", height: "32px", color: "#d97706" }} />
          </div>
          <span 
            style={{ 
              position: "absolute", 
              top: "-4px", 
              right: "-8px", 
              padding: "2px 8px", 
              fontSize: "11px", 
              fontWeight: "bold", 
              borderRadius: "9999px", 
              backgroundColor: "#f59e0b", 
              color: "white", 
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" 
            }}
          >
            404
          </span>
        </div>

        {/* Text Content */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>
            Resource or Page Not Found
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: "1.6" }}>
            The record, view, or section you're trying to reach isn't available under your workspace. It may have been moved or removed.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "white",
              backgroundColor: "#4f46e5",
              textDecoration: "none",
              borderRadius: "8px",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              transition: "background-color 0.15s ease"
            }}
          >
            <LayoutDashboard style={{ width: "16px", height: "16px" }} />
            Dashboard Home
          </Link>

          <button
            onClick={() => window.history.back()}
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#334155",
              backgroundColor: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.15s ease"
            }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            Go Back
          </button>
        </div>

        {/* Subtle Footer Note */}
        <div 
          style={{ 
            marginTop: "2rem", 
            paddingTop: "1rem", 
            borderTop: "1px solid #f1f5f9", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "0.5rem", 
            fontSize: "0.75rem", 
            color: "#94a3b8" 
          }}
        >
          <RefreshCcw style={{ width: "14px", height: "14px" }} />
          <span>If you believe this is an error, try refreshing the page.</span>
        </div>

      </div>
    </div>
  );
}