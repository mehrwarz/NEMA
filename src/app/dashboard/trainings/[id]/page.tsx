"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BarChart3,
  Award,
  Video,
} from "lucide-react";
import Loading from "@/components/loading";
import Navbar from "@/components/Navbar";

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
  const trainingId = Number(params.id); // Captures /training/[id] context directly from Next router

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

        // Fetch courses, specific lectures for this dynamic ID, and user tracking information
        const [trainingsRes, lecturesRes, progressRes] = await Promise.all([
          fetch("/api/trainings"),
          fetch(`/api/lectures?trainingId=${trainingId}`),
          fetch("/api/progress"),
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

  if (!mounted || loading) {
    return <Loading />;
  }

  const getLectureProgress = (lectureId: number) => {
    return progress.find((p) => p.lectureId === lectureId);
  };

  const handleToggleComplete = async (lecture: Lecture) => {
    if (!user || updatingProgress) return;
    setUpdatingProgress(true);

    const currentProg = getLectureProgress(lecture.id);
    const newCompleted = !currentProg?.completed;
    const newDuration = newCompleted ? lecture.duration : 0;

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: lecture.id,
          watchedDuration: newDuration,
          completed: newCompleted,
        }),
      });

      if (res.ok) {
        const updatedProgressRes = await fetch("/api/progress");
        const updatedProgressData = await updatedProgressRes.json();
        setProgress(updatedProgressData.progress || []);
      }
    } catch (error) {
      console.error("Update progress error:", error);
    } finally {
      setUpdatingProgress(false);
    }
  };

  // State filtering logic
  const currentTraining = trainings.find(t => t.id === trainingId);
  const categories = ["All", ...Array.from(new Set(lectures.map((l) => l.category)))];
  
  const filteredLectures = activeCategory === "All"
    ? lectures
    : lectures.filter((l) => l.category === activeCategory);

  const totalCompleted = progress.filter((p) => p.completed).length;
  const percentCompleteAll = lectures.length > 0 ? Math.round((totalCompleted / lectures.length) * 100) : 0;
  
  const activeCompleted = progress.filter(p => lectures.some(l => l.id === p.lectureId && p.completed)).length;
  const percentCompleteActive = lectures.length > 0 ? Math.round((activeCompleted / lectures.length) * 100) : 0;

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
      {/* Sidebar Workspace Navigation */}
      <aside
        style={{
          background: "var(--color-dark)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.1)",
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
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.5rem", marginBottom: "0.25rem" }}>
            Active View
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.6rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontWeight: 500,
              fontSize: "0.85rem",
            }}
          >
            <BookOpen size={16} />
            {currentTraining?.title || "Loading Course..."}
          </div>
          
          <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                background: "rgba(255, 255, 255, 0.14)",
                color: "#94a3b8",
                padding: "0.6rem 0.75rem",
                width: "100%",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.85rem",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "white"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
            >
              &larr; Back to Dashboard
            </button>
          </div>
        </nav>
      </aside>

      {/* Primary Workspace Viewport */}
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Navbar user={user} />
        <main style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
          {/* Top Summary Card */}
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
                Welcome Back, {user?.name.split(" ")[0]}! <Sparkles size={22} color="#facc15" />
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>
                Keep up the momentum! You've finished {activeCompleted} of {lectures.length} lectures in this course track.
              </p>
              
              <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", minWidth: "120px" }}>Course Progress:</span>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${percentCompleteActive}%`, background: "var(--color-primary-light)", height: "100%", borderRadius: "4px", transition: "width 0.5s ease" }} />
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "36px" }}>{percentCompleteActive}%</span>
                </div>
              </div>
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
              <div style={{ fontWeight: 800, fontSize: "1.25rem" }}>Level {Math.floor(totalCompleted / 2) + 1}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: 700 }}>
                {percentCompleteActive === 100 ? "Master Alchemist" : "Apprentice"}
              </div>
            </div>
          </div>

          {/* Interface Layout Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
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
                      disabled={updatingProgress}
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
                        cursor: "pointer",
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
        </main>
      </div>
    </div>
  );
}