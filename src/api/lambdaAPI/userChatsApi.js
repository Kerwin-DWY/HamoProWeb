const API_BASE = "https://oprmwzx3qb.execute-api.us-east-1.amazonaws.com";

async function authFetch(url, token, options = {}) {
    if (!token) {
        throw new Error("Missing access token");
    }

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text || res.statusText}`);
    }

    return res.json();
}

/**
 * Fetch all chat sessions for the authenticated user
 */
export async function fetchUserChats(token) {
    return authFetch(`${API_BASE}/user/chats`, token);
}

/**
 * Create a new chat session
 */
export async function createUserChat(token, { clientId, avatarId, clientName, avatarName }) {
    return authFetch(`${API_BASE}/user/chats`, token, {
        method: "POST",
        body: JSON.stringify({ clientId, avatarId, clientName, avatarName }),
    });
}

/**
 * Delete a chat session
 */
export async function deleteUserChat(token, clientId, avatarId) {
    return authFetch(`${API_BASE}/user/chats/${clientId}/${avatarId}`, token, {
        method: "DELETE",
    });
}
