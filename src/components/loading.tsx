export default function Loading() {
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