const API_BASE = "https://8ys1hr8ne0.execute-api.ap-east-1.amazonaws.com";

export async function initUserProfile({ authToken, mode }) {
    const res = await fetch(`${API_BASE}/user/init`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            roleHint: mode === "pro" ? "THERAPIST" : "CLIENT",
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to initialize user");
    }

    return res.json();
}
