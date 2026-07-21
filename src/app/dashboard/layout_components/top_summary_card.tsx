"use client";

import { Sparkles, Award } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Training {
    id: number;
    title: string;
    description: string;
    category: string;
}

interface WorkspaceDetail {
    progress: number;
    currentTraining: Training | null;
    totalLectures: number;
    completedCount: number;
}

export default function TopSummaryCard({
    user,
    totalUsersCount,
}: {
    user: User | null;
    totalUsersCount: number;
}) {
    const pathname = usePathname();
    const params = useParams();

    const rawId = params?.id;
    const trainingId = rawId ? Number(rawId) : null;
    const isValidTrainingId = typeof trainingId === "number" && !isNaN(trainingId) && trainingId > 0;

    const isTrainingWorkspace = Boolean(pathname.includes("/dashboard/trainings/") && isValidTrainingId);
    const isSettings = pathname.includes("/dashboard/settings");
    const isMainDashboard = pathname === "/dashboard";
    const isAdmin = user?.role === "admin" || user?.role === "system_administrator";

    const [trainings, setTrainings] = useState<Training[]>([]);
    const [workspaceData, setWorkspaceData] = useState<WorkspaceDetail | null>(null);

    // 1. Listen for real-time progress updates dispatched directly from page.tsx (0 extra API calls)
    useEffect(() => {
        const handleWorkspaceUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<WorkspaceDetail>;
            if (customEvent.detail) {
                setWorkspaceData(customEvent.detail);
            }
        };

        window.addEventListener("trainingWorkspaceUpdate", handleWorkspaceUpdate);
        return () => {
            window.removeEventListener("trainingWorkspaceUpdate", handleWorkspaceUpdate);
        };
    }, []);

    // 2. Fetch overall training list once for dashboard counters
    useEffect(() => {
        let isMounted = true;

        async function loadLayoutData() {
            try {
                const trainingsRes = await fetch("/api/trainings/user", { method: "POST" });
                if (!trainingsRes.ok) return;

                const trainingsData = await trainingsRes.json();
                if (isMounted) {
                    setTrainings(Array.isArray(trainingsData) ? trainingsData : trainingsData.trainings || []);
                }
            } catch (error) {
                console.error("Dashboard layout data error:", error);
            }
        }

        loadLayoutData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Active training context & real-time percentage
    const currentTraining = workspaceData?.currentTraining || (isValidTrainingId ? trainings.find((t) => t.id === trainingId) : null);
    const courseProgressPercentage = workspaceData?.progress ?? 0;

    // CASE 1: Inside an active Training Page (Show course details & dynamic progress bar)
    if (isTrainingWorkspace && currentTraining) {
        return (
            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", padding: "2rem", borderRadius: "var(--radius-xl)", marginBottom: "2rem", boxShadow: "var(--shadow-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "1.5rem" }}>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.15)", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontWeight: 600, textTransform: "uppercase" }}>
                            {currentTraining.category || "Training"}
                        </span>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                            {currentTraining.title}
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", margin: 0 }}>
                            {currentTraining.description}
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Sparkles size={20} color="#facc15" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.9 }}>
                            {currentTraining.title}
                        </span>
                    </div>
                </div>

                {/* Dynamic Progress Bar */}
                <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        <span>Course Track Progress</span>
                        <span>{courseProgressPercentage}% Complete</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${courseProgressPercentage}%`,
                                height: "100%",
                                background: "#10b981",
                                transition: "width 0.4s ease-out",
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // CASE 2: Main Admin Dashboard view
    if (isAdmin && isMainDashboard) {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Total Trainings</div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "#1e1b4b", marginTop: "0.5rem" }}>{trainings.length}</div>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Total Users</div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "#1e1b4b", marginTop: "0.5rem" }}>{totalUsersCount}</div>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Pending Reviews</div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "#facc15", marginTop: "0.5rem" }}>3</div>
                </div>
            </div>
        );
    }

    // CASE 3: Standard Fallback / General User Dashboard Banner
    let title = `Welcome Back, ${user?.name ? user.name.split(" ")[0] : "User"}!`;
    let description = "Choose an available course track below to pick up right where you left off.";
    let badgeText = "Level 1";
    let subBadgeText = "Apprentice";

    if (isSettings) {
        title = "Account Settings";
        description = "Customize your user profile details, manage security, and review active course enrollments.";
        badgeText = "Profile";
        subBadgeText = user?.role || "user";
    }

    return (
        <div
            style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "var(--radius-xl)",
                marginBottom: "2rem",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                boxShadow: "var(--shadow-lg)",
            }}
        >
            <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {title} <Sparkles size={22} color="#facc15" />
                </h1>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", margin: 0 }}>
                    {description}
                </p>
            </div>

            <div
                style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                }}
            >
                <Award size={28} color="#facc15" />
                <div style={{ fontWeight: 800, fontSize: "1.25rem" }}>{badgeText}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: 700 }}>
                    {subBadgeText}
                </div>
            </div>
        </div>
    );
}