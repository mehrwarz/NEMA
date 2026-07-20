"use client"

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface Training {
  id: number;
  title: string;
  description: string;
  category: string;
  status?: string; // Checked against available state
}

interface Enrollment {
  id: number;
  userId: number;
  trainingId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
} 

export default function UserDashboard() {
    
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
        
  const availableTrainings = trainings.filter(t => t.status === undefined || t.status === "available");
        
  useEffect(() => {
      setMounted(true);
      async function checkAuthAndLoadData() {
        try {
          
          // Fetch fundamental catalog resources
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
        } catch (error) {
          console.error("Dashboard load error:", error);
        } finally {
          setLoading(false);
        }
      }
  
      checkAuthAndLoadData();
    }, [router]);
  

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

  return (
      <main style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Available Trainings <Sparkles size={24} color="#facc15" />
            </h1>
            <p style={{ color: "#64748b" }}>Choose an available course track below to pick up right where you left off.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {availableTrainings.map((training) => {
            const isEnrolled = enrollments.some((e) => e.trainingId === training.id);
            return (
              <div key={training.id} style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "4px", display: "inline-block", marginBottom: "0.75rem" }}>
                    {training.category || "General"}
                  </span>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>{training.title}</h3>
                  <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.4" }}>{training.description}</p>
                </div>
                <button
                  onClick={() => isEnrolled ? router.push(`/dashboard/trainings/${training.id}`) : handleEnroll(training.id)}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    background: isEnrolled ? "var(--color-primary)" : "#e2e8f0",
                    color: isEnrolled ? "white" : "var(--color-dark)",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    width: "100%",
                    transition: "background 0.2s ease"
                  }}
                >
                  {isEnrolled ? "Start Learning" : "Enroll"}
                </button>
              </div>
            );
          })}
        </div>
      </main>
  );
}