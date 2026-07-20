"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import Loading from "@/components/loading";
import Navbar from "@/components/Navbar";
import Sidebar from "./layout_components/sidebar";
import TopSummaryCard from "./layout_components/top_summary_card";

interface User { id: number; name: string; email: string; role: string }
interface Training { id: number; title: string; description: string; category: string }

export default function DashboardLayout({ children}: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [workspaceData, setWorkspaceData] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        async function loadLayoutData() {
            try {
                const authRes = await fetch("/api/auth/me");
                const authData = await authRes.json();
                if (!authData.user) {
                    router.push("/auth");
                    return;
                }
                setUser(authData.user);
            } catch (error) {
                console.error("Dashboard layout data error:", error);
            } finally {
                setLoading(false);
            }
        }
        loadLayoutData();
    }, [router]);

    // Mock count for demonstration (you can replace this with real fetch data if needed)
    const [totalUsersCount, setTotalUsersCount] = useState(124);

    useEffect(() => {
        setMounted(true);
        async function loadLayoutData() {
            try {
                const authRes = await fetch("/api/auth/me");
                const authData = await authRes.json();
                if (!authData.user) {
                    router.push("/auth");
                    return;
                }
                setUser(authData.user);
            } catch (error) {
                console.error("Dashboard layout data error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadLayoutData();
    }, [router]);


    useEffect(() => {
        const handleWorkspaceUpdate = (e: Event) => {
            const data = (e as CustomEvent).detail;
            setWorkspaceData(data); // Contains data.progress, data.currentTraining, etc.
        };

        window.addEventListener("trainingWorkspaceUpdate", handleWorkspaceUpdate);
        return () => window.removeEventListener("trainingWorkspaceUpdate", handleWorkspaceUpdate);
    }, []);


    if (!mounted || loading) {
        return <Loading />;
    }

    

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f1f5f9",
                display: "grid",
                gridTemplateColumns: "280px 1fr",
                fontFamily: "var(--font-sans)",
            }}
        >
            {/* Sidebar Navigation */}
            <aside
                style={{
                    background: "var(--color-dark)",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    borderRight: "1px solid rgba(255,255,255,0.1)",
                    height: "100vh",
                    position: "sticky",
                    top: 0,
                }}
            >
                <div
                    style={{
                        padding: "1.5rem",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <button
                        onClick={() => router.push("/dashboard")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: "none",
                            border: "none",
                            color: "white",
                            fontWeight: 800,
                            cursor: "pointer",
                        }}
                    >
                        <span
                            style={{
                                width: "32px",
                                height: "32px",
                                background: "var(--color-primary)",
                                borderRadius: "var(--radius-sm)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <GraduationCap size={18} />
                        </span>
                        mehrabani.org
                    </button>
                </div>

                <nav style={{ flex: 1, padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Sidebar 
                        userRole={user?.role || ""}
                    />
                </nav>
            </aside>

            {/* Primary Workspace Viewport */}
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar user={user} />
                <main style={{ padding: "2rem", flex: 1 }}>
                    {/* Dynamic Summary Cards */}
                    <TopSummaryCard 
                        user={user || null}
                        totalUsersCount={totalUsersCount}
                    />
                    {children}
                </main>
            </div>
        </div>
    );
}