"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AddLectureContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const trainingId = parseInt(searchParams.get("trainingId") || "0");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/lectures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title, 
                    description, 
                    category, 
                    videoUrl, 
                    duration: parseInt(duration), 
                    trainingId 
                }),
            });

            if (!res.ok) throw new Error("Failed to create lecture");
            router.push("/dashboard");
        } catch (error) {
            console.error("Create lecture error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>Add New Lecture</h1>
            <form onSubmit={handleSubmit} style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} required />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} required />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Category</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} required />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Video URL</label>
                    <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} required />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Duration (seconds)</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} required />
                </div>
                <button type="submit" disabled={loading} style={{ padding: "0.5rem 1rem", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    {loading ? "Adding..." : "Add Lecture"}
                </button>
            </form>
        </div>
    );
}

export default function AddLecturePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddLectureContent />
        </Suspense>
    );
}
