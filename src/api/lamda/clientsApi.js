const API_BASE = "https://8ys1hr8ne0.execute-api.ap-east-1.amazonaws.com";

/**
 * Helper: common fetch wrapper
 */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "API request failed");
  }

  return res.json();
}

/**
 * =========================
 * GET /clients
 * =========================
 */
export async function fetchClients(accessToken) {
  return apiFetch(`${API_BASE}/clients`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * =========================
 * POST /clients
 * =========================
 */
export async function createClient(accessToken, client) {
  return apiFetch(`${API_BASE}/clients`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: client.name,
      sex: client.sex,
      age: client.age,
      emotionPattern: client.emotionPattern,
      personality: client.personality,
      cognition: client.cognition,
      goals: client.goals,
      principles: client.principles,
    }),
  });
}


/**
 * =========================
 * DELETE /clients/{clientId}
 * =========================
 */
export async function deleteClient(accessToken, clientId) {
  if (!clientId) {
    throw new Error("clientId is required");
  }

  return apiFetch(`${API_BASE}/clients/${clientId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
