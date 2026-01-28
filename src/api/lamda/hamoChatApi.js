const API_BASE = "https://offqbknrwc.execute-api.us-east-1.amazonaws.com";

/* ======================================================
   INTERNAL HELPER
====================================================== */

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
        throw new Error(
            `API error ${res.status}: ${text || res.statusText}`
        );
    }

    return res.json();
}

/* ======================================================
   API CALLS
====================================================== */

/**
 * Send message to AI (POST /chat)
 */
export async function sendChatMessage(token, message) {
    return authFetch(`${API_BASE}/chat`, token, {
        method: "POST",
        body: JSON.stringify({ message }),
    });
}

/**
 * Load chat history (GET /chat/history)
 */
export async function fetchChatHistory(token, clientId, avatarId) {
    const params = new URLSearchParams({
        clientId,
        avatarId,
    });

    return authFetch(
        `${API_BASE}/chat/history?${params.toString()}`,
        token
    );
}

/**
 * Save one chat message (POST /chat/message)
 */
export async function saveChatMessage(
    token,
    { clientId, avatarId, sender, text }
) {
    return authFetch(`${API_BASE}/chat/message`, token, {
        method: "POST",
        body: JSON.stringify({
            clientId,
            avatarId,
            sender, // "user" | "ai"
            text,
        }),
    });
}
