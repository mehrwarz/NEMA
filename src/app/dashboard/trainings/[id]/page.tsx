"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    CheckCircle2,
    Circle,
    Clock,
    BarChart3,
    Video,
} from "lucide-react";
import Loading from "@/components/loading";

interface Training {
    id: number;
    title: string;
    description: string;
    category: string;
}

interface Lecture {
    id: number;
    title: string;
    description: string;
    category: string;
    videoUrl: string;
    duration: number;
    sortOrder: number;
    trainingId: number;
}

interface Progress {
    id: number;
    lectureId: number;
    watchedDuration: number;
    completed: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
}

export default function TrainingWorkspace() {
    const router = useRouter();
    const params = useParams();
    const trainingId = Number(params.id);

    const [trainings, setTrainings] = useState<Training[]>([]);
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [progress, setProgress] = useState<Progress[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
    const [updatingProgress, setUpdatingProgress] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setMounted(true);
        async function loadWorkspaceData() {
            try {
                const authRes = await fetch("/api/auth/me");
                const authData = await authRes.json();
                if (!authData.user) {
                    router.push("/auth");
                    return;
                }
                setUser(authData.user);

                const [trainingsRes, lecturesRes, progressRes] = await Promise.all([
                    fetch("/api/trainings"),
                    fetch(`/api/lectures?trainingId=${trainingId}`),
                    fetch(`/api/progress?trainingId=${trainingId}`), // FIXED: Added ?trainingId= parameter
                ]);

                const [trainingsData, lecturesData, progressData] = await Promise.all([
                    trainingsRes.json(),
                    lecturesRes.json(),
                    progressRes.json(),
                ]);

                setTrainings(trainingsData.trainings || []);
                const filteredLectures = lecturesData.lectures || [];
                setLectures(filteredLectures);
                setProgress(progressData.progress || []);

                if (filteredLectures.length > 0) {
                    setActiveLecture(filteredLectures[0]);
                }
            } catch (error) {
                console.error("Workspace configuration error:", error);
            } finally {
                setLoading(false);
            }
        }

        if (trainingId) {
            loadWorkspaceData();
        }
    }, [trainingId, router]);

    // Derived states
    const currentTraining = trainings.find((t) => t.id === trainingId);
    const activeCompleted = progress.filter((p) =>
        lectures.some((l) => Number(l.id) === Number(p.lectureId) && p.completed)
    ).length;
    const percentCompleteActive =
        lectures.length > 0 ? Math.round((activeCompleted / lectures.length) * 100) : 0;
    const filteredLectures =
        activeCategory === "All"
            ? lectures
            : lectures.filter((l) => l.category === activeCategory);

    // Sync progress data & training context up to the global layout frame dynamically
    useEffect(() => {
        if (!loading && currentTraining) {
            const event = new CustomEvent("trainingWorkspaceUpdate", {
                detail: {
                    progress: percentCompleteActive,
                    currentTraining: currentTraining,
                    totalLectures: lectures.length,
                    completedCount: activeCompleted,
                },
            });
            window.dispatchEvent(event);
        }
    }, [percentCompleteActive, currentTraining, loading, lectures.length, activeCompleted]);

    if (!mounted || loading) {
        return <Loading />;
    }

    const getLectureProgress = (lectureId: number) => {
        return progress.find((p) => Number(p.lectureId) === Number(lectureId));
    };

    const handleToggleComplete = async (lecture: Lecture) => {
        if (!user || updatingProgress) return;
        setUpdatingProgress(true);

        const currentProg = getLectureProgress(lecture.id);
        const newCompleted = true; // Always set to true since uncompleting is disabled
        const newDuration = lecture.duration;

        // Save previous state in case of network failure
        const previousProgress = [...progress];

        // Optimistically update local state immediately
        setProgress((prev) => {
            const existingIndex = prev.findIndex(
                (p) => Number(p.lectureId) === Number(lecture.id)
            );

            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    completed: true,
                    watchedDuration: newDuration,
                };
                return updated;
            }

            return [
                ...prev,
                {
                    id: Date.now(),
                    lectureId: lecture.id,
                    watchedDuration: newDuration,
                    completed: true,
                },
            ];
        });

        try {
            const res = await fetch("/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    trainingId: trainingId,
                    lectureId: lecture.id,
                    watchedDuration: newDuration,
                    completed: newCompleted,
                }),
            });

            if (res.ok) {
                // FIXED: Included trainingId in query param & cache-busting timestamp
                const updatedProgressRes = await fetch(
                    `/api/progress?trainingId=${trainingId}&t=${Date.now()}`,
                    { cache: "no-store" }
                );
                const updatedProgressData = await updatedProgressRes.json();
                
                if (updatedProgressData.progress) {
                    setProgress(updatedProgressData.progress);
                }
            } else {
                setProgress(previousProgress);
            }
        } catch (error) {
            console.error("Update progress error:", error);
            setProgress(previousProgress);
        } finally {
            setUpdatingProgress(false);
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", padding: "1rem" }}>
            {/* Embedded Video Media Player view */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {activeLecture ? (
                    <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                        <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#000", marginBottom: "1.5rem" }}>
                            <iframe
                                src={activeLecture.videoUrl}
                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={activeLecture.title}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                                <span style={{ background: "#dbeafe", color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "999px", display: "inline-block", marginBottom: "0.5rem" }}>
                                    {activeLecture.category}
                                </span>
                                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-dark)", margin: 0 }}>
                                    {activeLecture.title}
                                </h2>
                            </div>

                            <button
                                onClick={() => handleToggleComplete(activeLecture)}
                                disabled={updatingProgress || getLectureProgress(activeLecture.id)?.completed}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.6rem 1.25rem",
                                    borderRadius: "var(--radius-md)",
                                    background: getLectureProgress(activeLecture.id)?.completed ? "#ecfdf5" : "var(--color-primary)",
                                    border: getLectureProgress(activeLecture.id)?.completed ? "1px solid #a7f3d0" : "none",
                                    color: getLectureProgress(activeLecture.id)?.completed ? "#059669" : "white",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    cursor: getLectureProgress(activeLecture.id)?.completed ? "default" : "pointer",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {getLectureProgress(activeLecture.id)?.completed ? (
                                    <>
                                        <CheckCircle2 size={16} /> Completed
                                    </>
                                ) : (
                                    "Mark as Complete"
                                )}
                            </button>
                        </div>

                        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem", display: "flex", gap: "2rem", color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <Clock size={16} /> {Math.round(activeLecture.duration / 60)} minutes
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <Video size={16} /> HD Lecture Video
                            </span>
                        </div>

                        <p style={{ color: "var(--color-text)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                            {activeLecture.description}
                        </p>
                    </div>
                ) : (
                    <div style={{ background: "white", padding: "3rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", textAlign: "center", color: "var(--color-text-muted)" }}>
                        No active lecture loaded for this configuration.
                    </div>
                )}
            </div>

            {/* Lecture Selection Sidebar Directory */}
            <div>
                <div style={{ background: "white", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-dark)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <BarChart3 size={16} /> Course Chapters ({filteredLectures.length})
                        </h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {filteredLectures.map((lecture) => {
                            const isCompleted = getLectureProgress(lecture.id)?.completed;
                            const isActive = activeLecture?.id === lecture.id;

                            return (
                                <button
                                    key={lecture.id}
                                    onClick={() => setActiveLecture(lecture)}
                                    style={{
                                        padding: "1rem 1.25rem",
                                        border: "none",
                                        borderBottom: "1px solid var(--color-border)",
                                        background: isActive ? "#f8fafc" : "transparent",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                        textAlign: "left",
                                        width: "100%",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <span style={{ marginTop: "0.15rem", color: isCompleted ? "#10b981" : "#94a3b8" }}>
                                        {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                    </span>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "0.85rem", fontWeight: isActive ? 700 : 500, color: isActive ? "var(--color-primary)" : "var(--color-dark)", lineHeight: 1.4, marginBottom: "0.15rem" }}>
                                            {lecture.title}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <span style={{ background: "#f1f5f9", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                                                {lecture.category}
                                            </span>
                                            <span>{Math.round(lecture.duration / 60)} min</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        {filteredLectures.length === 0 && (
                            <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                                No lectures appended to this curriculum sequence yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}