"use client"

import {
    BookOpen,
    Settings,
    Home,
    PlusCircle,
    LayoutDashboard,
    Users,
    Shield,
    Sliders,
    FileCheck,
    BookMarked,
    GraduationCap,
    Award
} from "lucide-react"
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Training {
    id: number;
    title: string;
    description: string;
    category: string;
}


export default function Sidebar({ userRole }: {
    userRole: string;
}) {
    const pathname = usePathname();
    const params = useParams();
    const isMainDashboard = pathname === "/dashboard";
    const isSettings = pathname === "/dashboard/settings";
    const router = useRouter();
    const isTrainingWorkspace = pathname.includes("/dashboard/trainings/") && params.id;
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);


 useEffect(() => {
        setMounted(true);
        async function loadLayoutData() {
            try {
                const [trainingsRes] = await Promise.all([
                    fetch("/api/trainings/user", { method: "post" }),
                ]);

                const [trainingsData] = await Promise.all([
                    trainingsRes.json(),
                ]);
                setTrainings(trainingsData || []);
            } catch (error) {
                console.error("Dashboard layout data error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadLayoutData();
    }, [router]);

    
    // Helper to render shared menu-item buttons
    const renderNavButton = (label: string, icon: React.ReactNode, route: string, isActive: boolean) => (
        <button
            onClick={() => router.push(route)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                width: "100%",
                padding: "0.6rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? "white" : "#94a3b8",
                fontWeight: 500,
                fontSize: "0.85rem",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
            }}
        >
            {icon}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {label}
            </span>
        </button>
    );

    // Dynamic Sidebar Items Selection
    // CASE 1: User is inside a specific training page
    if (isTrainingWorkspace) {
        return (
            <>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.5rem", marginBottom: "0.5rem" }}>
                    Enrolled Courses
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "60vh", overflowY: "auto" }}>
                    {trainings.map((track) => {
                        const isActiveTrack =  Number(params.id) == track.id;
                        return (
                            <div key={track.id}>
                                {renderNavButton(
                                    track.title,
                                    <BookMarked size={16} />,
                                    `/dashboard/trainings/${track.id}`,
                                    isActiveTrack
                                )}
                            </div>
                        );
                    })}
                </div>
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "1rem 0" }} />
                {renderNavButton("Back to Catalog", <Home size={16} />, "/dashboard", false)}
            </>
        );
    }

    // CASE 2: User is an Administrator on general dashboard paths
    if (userRole === "admin" || userRole === "system_administrator") {
        return (
            <>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.5rem", marginBottom: "0.5rem" }}>
                    Admin Management
                </div>
                {renderNavButton("Overview Dashboard", <LayoutDashboard size={16} />, "/dashboard", isMainDashboard)}
                {renderNavButton("Manage User", <Users size={16} />, "/dashboard/admin/users", pathname.includes("/admin/users"))}
                {renderNavButton("Manage Roles", <Shield size={16} />, "/dashboard/admin/roles", pathname.includes("/admin/roles"))}
                {renderNavButton("Manage Training", <PlusCircle size={16} />, "/dashboard/trainings/create", pathname.includes("/trainings/create"))}
                {renderNavButton("Review Quiz", <FileCheck size={16} />, "/dashboard/admin/quizzes", pathname.includes("/admin/quizzes"))}
                {renderNavButton("Manage Setting", <Sliders size={16} />, "/dashboard/settings", isSettings)}
            </>
        );
    }

    // CASE 3: Standard User on general dashboard paths
    return (
        <>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.5rem", marginBottom: "0.5rem" }}>
                Student Workspace
            </div>
            {renderNavButton("Overview Catalog", <LayoutDashboard size={16} />, "/dashboard", isMainDashboard)}
            {renderNavButton("Manage My Trainings", <BookOpen size={16} />, "/dashboard/my-trainings", pathname.includes("/my-trainings"))}
            {renderNavButton("Enroll to New Training", <GraduationCap size={16} />, "/dashboard/enroll", pathname.includes("/enroll"))}
            {renderNavButton("My Certifications", <Award size={16} />, "/dashboard/certifications", pathname.includes("/certifications"))}
            {renderNavButton("Account Settings", <Settings size={16} />, "/dashboard/settings", isSettings)}
        </>
    );
}
