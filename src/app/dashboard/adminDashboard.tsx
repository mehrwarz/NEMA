"use client";

import { useRouter } from "next/navigation";
import {
    GraduationCap,
    Users,
    Settings,
    LayoutDashboard
} from "lucide-react";

interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user" | string; // Extended to support role structures
}

export default function AdminDashboard() {
    const router = useRouter();

    return (
        <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <LayoutDashboard size={32} color="var(--color-primary)" /> Admin Management Console
                </h1>
                <p style={{ color: "#64748b" }}>Welcome back, administrator. Manage system architecture, user structures, and available course lists.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {/* User Management */}
                <div style={{ background: "white", padding: "1.75rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <div style={{ padding: "0.5rem", background: "#e0f2fe", borderRadius: "var(--radius-md)", color: "#0284c7" }}>
                            <Users size={24} />
                        </div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>User Management</h3>
                    </div>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Review system accounts, modify access levels, permissions, and active enrollment parameters.</p>
                    <button onClick={() => router.push("/dashboard/users")} style={{ width: "100%", padding: "0.6rem", background: "#f1f5f9", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer" }}>
                        Manage System Users
                    </button>
                </div>

                {/* Training Management */}
                <div style={{ background: "white", padding: "1.75rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <div style={{ padding: "0.5rem", background: "#fae8ff", borderRadius: "var(--radius-md)", color: "#c084fc" }}>
                            <GraduationCap size={24} />
                        </div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Training Management</h3>
                    </div>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Build courses, append lectures, modify visibility statuses, or review historical metrics.</p>
                    <button onClick={() => router.push("/dashboard/trainings/create")} style={{ width: "100%", padding: "0.6rem", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer" }}>
                        + Create New Training
                    </button>
                </div>

                {/* System Settings */}
                <div style={{ background: "white", padding: "1.75rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <div style={{ padding: "0.5rem", background: "#f1f5f9", borderRadius: "var(--radius-md)", color: "#475569" }}>
                            <Settings size={24} />
                        </div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>System Settings</h3>
                    </div>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Configure system behaviors, API links, global layout structures, and security settings.</p>
                    <button onClick={() => router.push("/dashboard/settings")} style={{ width: "100%", padding: "0.6rem", background: "#f1f5f9", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer" }}>
                        Open System Configurations
                    </button>
                </div>
            </div>
        </main>
    );
}