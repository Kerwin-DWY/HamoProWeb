const API_BASE = "https://oprmwzx3qb.execute-api.us-east-1.amazonaws.com";

export async function createInvite(accessToken, { clientId, clientName, avatarId,avatarName }) {
    const res = await fetch(`${API_BASE}/invites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ clientId, clientName, avatarId, avatarName }),
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return res.json();
}
