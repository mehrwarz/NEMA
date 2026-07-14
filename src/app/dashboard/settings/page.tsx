"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [avatarUrl, setAvatarUrl] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [trainings, setTrainings] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            const [enrollRes, trainRes] = await Promise.all([
                fetch("/api/enrollments"),
                fetch("/api/trainings")
            ]);
            const enrollData = await enrollRes.json();
            const trainData = await trainRes.json();
            setEnrollments(enrollData.enrollments || []);
            setTrainings(trainData.trainings || []);
        }
        loadData();
    }, []);

    const handleLeaveTraining = async (trainingId: number) => {
        if (!confirm("Are you sure you want to leave this training?")) return;
        await fetch("/api/enrollments", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trainingId })
        });
        setEnrollments(enrollments.filter(e => e.trainingId !== trainingId));
    };

    const updateAvatar = () => {
        alert("Avatar updated!");
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "800px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Account Settings</h1>
            
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Profile Settings</h2>
                <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }} placeholder="Avatar Image URL" />
                <button onClick={updateAvatar} style={{ padding: "0.5rem 1rem", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "4px" }}>Update Avatar</button>
            </div>

            <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Change Password</h2>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }} placeholder="Old Password" />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} placeholder="New Password" />
                <button style={{ marginTop: "0.5rem", padding: "0.5rem 1rem", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "4px" }}>Update Password</button>
            </div>

            <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>My Enrollments</h2>
                {enrollments.map(e => {
                    const training = trainings.find(t => t.id === e.trainingId);
                    if (!training) return null;
                    return (
                        <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0" }}>
                            <span>{training.title}</span>
                            <button onClick={() => handleLeaveTraining(training.id)} style={{ padding: "0.25rem 0.5rem", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: "4px", cursor: "pointer" }}>Leave</button>
                        </div>
                    );
                })}
            </div>
            
            <button onClick={() => router.push("/dashboard")} style={{ marginTop: "2rem", padding: "0.5rem 1rem", background: "#f1f5f9", border: "none", borderRadius: "4px", cursor: "pointer" }}>Back to Dashboard</button>
        </div>
    );
}
