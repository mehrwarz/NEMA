"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import Navbar from "@/components/Navbar";
import UserDashboard from "./userDashboard";
import AdminDashboard from "./adminDashboard";
import SystemAdminDashboard from "./systemAdminDashboard";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | string; // Extended to support role structures
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    async function checkAuthAndLoadData() {
      try {
        const authRes = await fetch("/api/auth/me");
        const authData = await authRes.json();
        if (!authData.user) {
          router.push("/auth");
          return;
        }
        setUser(authData.user);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoadData();
  }, [router]);


  if (!mounted || loading) {
    return <Loading />;
  }


  return (

    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "var(--font-sans)" }}>
      <Navbar user={user} />
      { user?.role === "admin" ? <AdminDashboard /> : user?.role === "system_administrator" ? <SystemAdminDashboard /> : <UserDashboard />}
    </div>
  );
}