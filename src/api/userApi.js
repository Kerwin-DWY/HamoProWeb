const API_BASE = "https://api.qualemind.com";

export async function initUserProfile({ token, mode }) {
    const res = await fetch(`${API_BASE}/api/user/init`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            roleHint: mode === "pro" ? "THERAPIST" : "CLIENT",
        }),
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return res.json();
}
