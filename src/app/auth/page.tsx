"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { NextRequest } from "next/server";

export default function AuthPage(request: NextRequest) {
  const router = useRouter();
  
  // Check if the user is already logged in
  useEffect(() => {
    async function checkLogin() {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      if (token) {
        console.log(token)
        router.push("/dashboard");
      }
    }

    checkLogin();
  }, []);

  

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An unexpected error occurred.");
      }

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0e7ff 100%)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Header / Nav */}
      <header
        style={{
          padding: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--color-primary)",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: "1.25rem",
          }}
        >
          <span className="navbar-logo-icon">
            <GraduationCap size={20} />
          </span>
          mehrabani.org
        </Link>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "var(--radius-2xl)",
            padding: "2.5rem 2rem",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--color-dark)",
                marginBottom: "0.5rem",
              }}
            >
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              {isLogin
                ? "Start learning for free today"
                : "Join thousands of learners worldwide"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fee2e2",
                  color: "var(--color-accent-red)",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            {!isLogin && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label
                  htmlFor="name"
                  style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text)" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "white",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label
                htmlFor="email"
                style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text)" }}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "white",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text)" }}
                >
                  Password
                </label>
                {isLogin && (
                  <Link
                    href="/auth/forgot-password"
                    style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--color-primary)", textDecoration: "none" }}
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                id="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "white",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-blue btn-lg"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "0.5rem",
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          {/* Toggle */}
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>Sign up free</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>Sign in</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
