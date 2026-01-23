const API_BASE = "https://8ys1hr8ne0.execute-api.ap-east-1.amazonaws.com";

export async function createInvite(accessToken, { clientId, clientName }) {
    const res = await fetch(`${API_BASE}/invites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ clientId, clientName }),
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return res.json();
}
