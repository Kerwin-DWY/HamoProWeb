const API_BASE = "http://18.233.134.123:3001/api";

/**
 * Send message to AI
 */
export async function sendChatMessage(message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch AI response");
  }

  const data = await res.json();
  return data.reply;
}

/**
 * Load chat history from DynamoDB
 */
export async function fetchChatHistory(token, clientId) {
  const res = await fetch(
      `${API_BASE}/chat/history?clientId=${clientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
  );

  if (!res.ok) {
    throw new Error("Failed to load chat history");
  }

  return res.json();
}

/**
 * Save one chat message
 */
export async function saveChatMessage(token, { clientId, sender, text }) {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ clientId, sender, text }),
  });

  if (!res.ok) {
    throw new Error("Failed to save message");
  }
}
