export async function sendChatMessage(message) {
  const res = await fetch("http://18.233.134.123:3001/api/chat", {
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
