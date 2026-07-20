"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    name: string;
    email: string;
}

export default function Navbar({ user }: { user: User | null }) {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [activeTrainingId, setActiveTrainingId] = useState<number | null>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    return (
        <nav
            style={{
                background: "white",
                padding: "1rem 2rem",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "64px"
            }}
        >
            <div style={{ fontWeight: 800, color: "var(--color-dark)" }}>
                {activeTrainingId ? "Training View" : "Dashboard"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        style={{ fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}
                    >
                        {user?.name}
                    </div>
                    <div
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "var(--color-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            cursor: "pointer"
                        }}
                    >
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    {profileMenuOpen && (
                        <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "0.5rem", background: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", padding: "0.5rem", boxShadow: "var(--shadow-md)", width: "160px", zIndex: 10 }}>
                            <button onClick={() => router.push("/dashboard/settings")} style={{ display: "block", width: "100%", padding: "0.5rem", textAlign: "left", cursor: "pointer", background: "none", border: "none" }}>Account Settings</button>
                            <button onClick={handleLogout} style={{ display: "block", width: "100%", padding: "0.5rem", textAlign: "left", cursor: "pointer", background: "none", border: "none", color: "red" }}>Sign Out</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}