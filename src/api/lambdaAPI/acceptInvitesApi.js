const API_BASE = "https://oprmwzx3qb.execute-api.us-east-1.amazonaws.com";

export async function acceptInvite(accessToken, inviteCode) {
    const res = await fetch(`${API_BASE}/invites/accept`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ inviteCode }),
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return res.json();
}
