"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  LogOut,
  Sparkles,
  BarChart3,
  Award,
  Video,
} from "lucide-react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Training {
  id: number;
  title: string;
  description: string;
  category: string;
}

interface Enrollment {
  id: number;
  userId: number;
  trainingId: number;
}

interface Lecture {
  id: number;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  duration: number;
  sortOrder: number;
}

interface Progress {
  id: number;
  lectureId: number;
  watchedDuration: number;
  completed: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [activeTrainingId, setActiveTrainingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

        const [trainingsRes, enrollmentsRes] = await Promise.all([
          fetch("/api/trainings"),
          fetch("/api/enrollments"),
        ]);

        const [trainingsData, enrollmentsData] = await Promise.all([
          trainingsRes.json(),
          enrollmentsRes.json(),
        ]);

        setTrainings(trainingsData.trainings || []);
        setEnrollments(enrollmentsData.enrollments || []);
        
        setLoading(false);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoadData();
  }, [router]);

  useEffect(() => {
    if (activeTrainingId !== null) {
      async function loadTrainingData() {
        // Load lectures and progress for active training
        const [lecturesRes, progressRes] = await Promise.all([
          fetch(`/api/lectures?trainingId=${activeTrainingId}`),
          fetch("/api/progress"),
        ]);

        const lecturesData = await lecturesRes.json();
        const progressData = await progressRes.json();

        setLectures(lecturesData.lectures || []);
        setProgress(progressData.progress || []);

        if (lecturesData.lectures && lecturesData.lectures.length > 0) {
          setActiveLecture(lecturesData.lectures[0]);
        }
      }
      loadTrainingData();
    }
  }, [activeTrainingId]);

  if (!mounted) {
    return null; // Or a simple skeleton
  }

  const handleEnroll = async (trainingId: number) => {
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingId }),
      });
      if (res.ok) {
        const enrollmentsRes = await fetch("/api/enrollments");
        const data = await enrollmentsRes.json();
        setEnrollments(data.enrollments || []);
      }
    } catch (error) {
      console.error("Enroll error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
        // Refresh local progress state
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

  const categories = ["All", ...Array.from(new Set(lectures.map((l) => l.category)))];
  const enrolledTrainings = trainings.filter(t => enrollments.some(e => e.trainingId === t.id));

  const filteredLectures =
    (activeCategory === "All"
      ? lectures
      : lectures.filter((l) => l.category === activeCategory)).filter(l => activeTrainingId === null || l.trainingId === activeTrainingId);

  const totalCompleted = progress.filter((p) => p.completed).length;
  const percentCompleteAll =
    lectures.length > 0 ? Math.round((totalCompleted / lectures.length) * 100) : 0;

  const activeTrainingLectures = lectures.filter(l => l.trainingId === activeTrainingId);
  const activeTrainingProgress = progress.filter(p => activeTrainingLectures.some(l => l.id === p.lectureId));
  const activeCompleted = activeTrainingProgress.filter(p => p.completed).length;
  const percentCompleteActive = activeTrainingLectures.length > 0 ? Math.round((activeCompleted / activeTrainingLectures.length) * 100) : 0;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-surface)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--color-primary)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style jsx global>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "grid",
        gridTemplateColumns: activeTrainingId ? "280px 1fr" : "1fr",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Sidebar - Only show when activeTrainingId is set */}
      {activeTrainingId && (
        <aside
          style={{
            background: "var(--color-dark)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Sidebar Brand */}
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
              onClick={() => setActiveTrainingId(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                color: "white",
                fontWeight: 800,
                background: "none",
                border: "none",
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

          {/* Enrolled Trainings List */}
          <nav style={{ flex: 1, padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.5rem", marginBottom: "0.25rem" }}>
              My Trainings
            </div>
            {enrolledTrainings.map((training) => (
              <button
                key={training.id}
                onClick={() => setActiveTrainingId(training.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  background: activeTrainingId === training.id ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeTrainingId === training.id ? "white" : "#94a3b8",
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <BookOpen size={16} />
                {training.title}
              </button>
            ))}
            <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <button 
                onClick={() => setActiveTrainingId(null)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  padding: "0.6rem 0.75rem",
                  width: "100%",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem"
                }}
              >
                &larr; Back to Trainings
              </button>
            </div>
          </nav>
        </aside>
      )}

      {/* Main Workspace */}
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Top Navbar */}
        <header
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
        </header>
        <main style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
        {!activeTrainingId ? (
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Available Trainings</h1>
                    <button 
                        onClick={() => router.push("/dashboard/trainings/create")}
                        style={{ padding: "0.6rem 1.25rem", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}
                    >
                        + Create Training
                    </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    {trainings.map(training => {
                        const isEnrolled = enrollments.some(e => e.trainingId === training.id);
                        return (
                            <div key={training.id} style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>{training.title}</h3>
                                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>{training.description}</p>
                                <button 
                                    onClick={() => isEnrolled ? setActiveTrainingId(training.id) : handleEnroll(training.id)}
                                    style={{
                                        padding: "0.6rem 1.25rem",
                                        borderRadius: "var(--radius-md)",
                                        background: isEnrolled ? "var(--color-primary)" : "#f1f5f9",
                                        color: isEnrolled ? "white" : "var(--color-dark)",
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        width: "100%"
                                    }}
                                >
                                    {isEnrolled ? "Start Training" : "Enroll"}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        ) : (
            <>
                {/* Top Header Card */}
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
                    Keep up the momentum! You've finished {totalCompleted} of {lectures.length} total lectures.
                    </p>
            {/* Progress Bars */}
            <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.75rem", minWidth: "120px" }}>Selected Training:</span>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${percentCompleteActive}%`, background: "var(--color-primary-light)", height: "100%", borderRadius: "4px", transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "36px" }}>{percentCompleteActive}%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.75rem", minWidth: "120px" }}>Overall Average:</span>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${percentCompleteAll}%`, background: "#94a3b8", height: "100%", borderRadius: "4px", transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "36px" }}>{percentCompleteAll}%</span>
              </div>
            </div>

                </div>
                {/* Badge Widget */}
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

                {/* Dashboard Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                {/* Main Video View */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {activeLecture ? (
                    <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                        {/* Embed Video Player */}
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
                            <>
                                Mark as Complete
                            </>
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
                        No active lecture selected. Select one from the list.
                    </div>
                    )}
                </div>

                {/* Sidebar Lecture List */}
                <div>
                    <div style={{ background: "white", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-dark)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <BarChart3 size={16} /> Lecture Directory ({filteredLectures.length})
                        </h3>
                        <button 
                            onClick={() => router.push(`/dashboard/add-lecture?trainingId=${activeTrainingId}`)}
                            style={{ background: "var(--color-primary)", color: "white", border: "none", borderRadius: "var(--radius-md)", padding: "0.4rem 0.8rem", fontSize: "0.8rem", cursor: "pointer" }}
                        >
                            + Add
                        </button>
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
                            No lectures found.
                        </div>
                        )}
                    </div>
                    </div>
                </div>
                </div>
            </>
        )}
        </main>
      </div>
    </div>
  );
}
